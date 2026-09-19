import { query, queryOne, execute, num, bool } from '../config/database.js'
import { id } from '../utils/id.js'
import { money } from '../utils/crypto.js'
import { badRequest } from '../utils/errors.js'
import { WALLET_RULES, WalletTxnType } from '../constants/wallet.js'

const generateReferralCode = (fullName) => {
  const base = fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'HIC'
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${suffix}`
}

export const assignReferralCode = async (userId, fullName) => {
  const user = await queryOne(`SELECT referralCode FROM User WHERE id = :id`, { id: userId })
  if (user?.referralCode) return String(user.referralCode)
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode(fullName)
    try {
      await execute(`UPDATE User SET referralCode = :code WHERE id = :id`, { code, id: userId })
      return code
    } catch {
      /* collision */
    }
  }
  throw badRequest('Could not generate referral code', 'REFERRAL_CODE_FAILED')
}

export const ensureWallet = async (userId) => {
  let wallet = await queryOne(`SELECT * FROM Wallet WHERE userId = :userId`, { userId })
  if (!wallet) {
    const walletId = id()
    await execute(
      `INSERT INTO Wallet (id, userId, balance, referralBalance, joiningBonusCredited)
       VALUES (:id, :userId, 0, 0, 0)`,
      { id: walletId, userId },
    )
    wallet = await queryOne(`SELECT * FROM Wallet WHERE id = :id`, { id: walletId })
  }
  return wallet
}

export const getWalletSummary = async (userId) => {
  const user = await queryOne(`SELECT referralCode, fullName FROM User WHERE id = :id`, { id: userId })
  if (!user) throw badRequest('User not found', 'NOT_FOUND')
  const code = user.referralCode
    ? String(user.referralCode)
    : await assignReferralCode(userId, String(user.fullName))
  const wallet = await ensureWallet(userId)
  const transactions = await query(
    `SELECT id, type, amount, description, createdAt
     FROM WalletTransaction WHERE walletId = :walletId
     ORDER BY createdAt DESC LIMIT 20`,
    { walletId: wallet.id },
  )
  const referralTestsLeft = Math.floor(num(wallet.referralBalance) / WALLET_RULES.REFERRAL_PER_TEST)
  return {
    balance: money(num(wallet.balance)),
    referralBalance: money(num(wallet.referralBalance)),
    totalSpendable: money(num(wallet.balance) + num(wallet.referralBalance)),
    referralPerTest: WALLET_RULES.REFERRAL_PER_TEST,
    referralTestsRemaining: referralTestsLeft,
    joiningBonusCredited: bool(wallet.joiningBonusCredited),
    referralCode: code,
    rules: WALLET_RULES,
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: money(num(t.amount)),
      description: t.description,
      createdAt: t.createdAt,
    })),
  }
}

const credit = async (userId, opts) => {
  const wallet = await ensureWallet(userId)
  const amount = money(opts.amount)
  if (amount <= 0) return wallet
  const balance = money(num(wallet.balance) + (opts.toReferralPool ? 0 : amount))
  const referralBalance = money(num(wallet.referralBalance) + (opts.toReferralPool ? amount : 0))
  const joining = opts.type === WalletTxnType.JOINING_BONUS ? 1 : bool(wallet.joiningBonusCredited) ? 1 : 0
  await execute(
    `UPDATE Wallet SET balance = :balance, referralBalance = :referralBalance, joiningBonusCredited = :joining
     WHERE id = :id`,
    { balance, referralBalance, joining, id: wallet.id },
  )
  await execute(
    `INSERT INTO WalletTransaction
      (id, walletId, type, amount, balanceAfter, referralBalanceAfter, description, meta)
     VALUES (:id, :walletId, :type, :amount, :balanceAfter, :referralBalanceAfter, :description, :meta)`,
    {
      id: id(),
      walletId: wallet.id,
      type: opts.type,
      amount,
      balanceAfter: balance,
      referralBalanceAfter: referralBalance,
      description: opts.description,
      meta: opts.meta != null ? JSON.stringify(opts.meta) : null,
    },
  )
  return { ...wallet, balance, referralBalance, joiningBonusCredited: joining }
}

export const creditJoiningBonus = async (userId) => {
  const wallet = await ensureWallet(userId)
  if (bool(wallet.joiningBonusCredited)) return null
  await credit(userId, {
    type: WalletTxnType.JOINING_BONUS,
    amount: WALLET_RULES.JOINING_BONUS,
    description: `₹${WALLET_RULES.JOINING_BONUS} joining bonus — welcome to HealthID Card`,
  })
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'PROMOTIONAL', :title, :body)`,
    {
      id: id(),
      userId,
      title: '₹250 joining bonus credited',
      body: `Your HealthID Wallet now has ₹${WALLET_RULES.JOINING_BONUS} to use on lab tests. Apply it at checkout.`,
    },
  )
  return WALLET_RULES.JOINING_BONUS
}

export const creditReferralBonus = async (referrerId, referredUserId) => {
  const existing = await queryOne(`SELECT id FROM Referral WHERE referredUserId = :referredUserId`, {
    referredUserId,
  })
  if (existing) return null
  await execute(
    `INSERT INTO Referral (id, referrerId, referredUserId, bonusAmount)
     VALUES (:id, :referrerId, :referredUserId, :bonusAmount)`,
    {
      id: id(),
      referrerId,
      referredUserId,
      bonusAmount: WALLET_RULES.REFERRAL_BONUS,
    },
  )
  await credit(referrerId, {
    type: WalletTxnType.REFERRAL_EARNED,
    amount: WALLET_RULES.REFERRAL_BONUS,
    toReferralPool: true,
    description: `₹${WALLET_RULES.REFERRAL_BONUS} referral bonus — friend activated HealthID Card`,
    meta: { referredUserId },
  })
  await execute(
    `INSERT INTO Notification (id, userId, type, title, body)
     VALUES (:id, :userId, 'PROMOTIONAL', :title, :body)`,
    {
      id: id(),
      userId: referrerId,
      title: 'Referral bonus unlocked!',
      body: `₹${WALLET_RULES.REFERRAL_BONUS} added to your referral wallet. Use ₹${WALLET_RULES.REFERRAL_PER_TEST} on each test booking (up to 5 tests).`,
    },
  )
  return WALLET_RULES.REFERRAL_BONUS
}

export const resolveReferrer = async (referralCode) => {
  if (!referralCode?.trim()) return null
  const code = referralCode.trim().toUpperCase()
  return queryOne(
    `SELECT id, referralCode, fullName FROM User
     WHERE referralCode = :code AND deletedAt IS NULL AND isActive = 1 LIMIT 1`,
    { code },
  )
}

export const computeCheckoutCredits = (wallet, subtotalAfterCard, opts) => {
  let due = money(subtotalAfterCard)
  let referralApplied = 0
  let walletApplied = 0
  if (opts.useReferral && due > 0 && wallet.referralBalance > 0) {
    referralApplied = money(Math.min(WALLET_RULES.REFERRAL_PER_TEST, wallet.referralBalance, due))
    due = money(due - referralApplied)
  }
  if (opts.useWallet && due > 0 && wallet.balance > 0) {
    walletApplied = money(Math.min(wallet.balance, due))
    due = money(due - walletApplied)
  }
  return { referralApplied, walletApplied, amountDue: due }
}

export const debitForBooking = async (userId, appointmentId, referralApplied, walletApplied) => {
  if (referralApplied <= 0 && walletApplied <= 0) return
  const wallet = await ensureWallet(userId)
  const balance = money(num(wallet.balance) - walletApplied)
  const referralBalance = money(num(wallet.referralBalance) - referralApplied)
  if (balance < 0 || referralBalance < 0) {
    throw badRequest('Insufficient wallet balance', 'WALLET_INSUFFICIENT')
  }
  await execute(`UPDATE Wallet SET balance = :balance, referralBalance = :referralBalance WHERE id = :id`, {
    balance,
    referralBalance,
    id: wallet.id,
  })
  if (referralApplied > 0) {
    await execute(
      `INSERT INTO WalletTransaction
        (id, walletId, type, amount, balanceAfter, referralBalanceAfter, description, appointmentId)
       VALUES (:id, :walletId, :type, :amount, :balanceAfter, :referralBalanceAfter, :description, :appointmentId)`,
      {
        id: id(),
        walletId: wallet.id,
        type: WalletTxnType.REFERRAL_REDEEMED,
        amount: -referralApplied,
        balanceAfter: balance,
        referralBalanceAfter: referralBalance,
        description: `₹${referralApplied} referral credit applied to booking`,
        appointmentId,
      },
    )
  }
  if (walletApplied > 0) {
    await execute(
      `INSERT INTO WalletTransaction
        (id, walletId, type, amount, balanceAfter, referralBalanceAfter, description, appointmentId)
       VALUES (:id, :walletId, :type, :amount, :balanceAfter, :referralBalanceAfter, :description, :appointmentId)`,
      {
        id: id(),
        walletId: wallet.id,
        type: WalletTxnType.WALLET_REDEEMED,
        amount: -walletApplied,
        balanceAfter: balance,
        referralBalanceAfter: referralBalance,
        description: `₹${walletApplied} wallet balance applied to booking`,
        appointmentId,
      },
    )
  }
}
