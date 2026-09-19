CREATE TABLE WalletTransaction (
  id VARCHAR(30) PRIMARY KEY,
  walletId VARCHAR(30) NOT NULL,
  type VARCHAR(64) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balanceAfter DECIMAL(10,2) NOT NULL,
  referralBalanceAfter DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  appointmentId VARCHAR(30) NULL,
  meta JSON NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX (walletId, createdAt),
  CONSTRAINT fk_wtx_wallet FOREIGN KEY (walletId) REFERENCES Wallet(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
