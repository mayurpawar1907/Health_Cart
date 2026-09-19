import { query, queryOne, execute } from '../config/database.js'
import { id } from '../utils/id.js'
import { notFound } from '../utils/errors.js'
import * as membership from './membership.service.js'

const mapMember = (row) => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  relation: row.relation,
  dateOfBirth: row.dateOfBirth,
  gender: row.gender,
  age: row.age != null ? Number(row.age) : null,
  mobile: row.mobile,
  createdAt: row.createdAt,
})

export const list = async (userId) => {
  const rows = await query(
    `SELECT * FROM FamilyMember WHERE userId = :userId ORDER BY createdAt ASC`,
    { userId },
  )
  return rows.map(mapMember)
}

export const create = async (userId, dto) => {
  const memberId = id()
  await execute(
    `INSERT INTO FamilyMember (id, userId, name, relation, age, gender, mobile, dateOfBirth)
     VALUES (:id, :userId, :name, :relation, :age, :gender, :mobile, :dateOfBirth)`,
    {
      id: memberId,
      userId,
      name: dto.name,
      relation: dto.relation,
      age: dto.age ?? null,
      gender: dto.gender ?? null,
      mobile: dto.mobile ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
    },
  )
  const card = await membership.current(userId)
  if (card) {
    await membership.addFamilyToCard(userId, memberId).catch(() => undefined)
  }
  const member = await queryOne(`SELECT * FROM FamilyMember WHERE id = :id`, {
    id: memberId,
  })
  return mapMember(member)
}

export const remove = async (userId, memberId) => {
  const member = await queryOne(
    `SELECT * FROM FamilyMember WHERE id = :id AND userId = :userId LIMIT 1`,
    { id: memberId, userId },
  )
  if (!member) throw notFound('Family member not found', 'NOT_FOUND')
  await execute(`DELETE FROM MembershipMember WHERE familyMemberId = :id`, { id: memberId })
  await execute(`DELETE FROM FamilyMember WHERE id = :id`, { id: memberId })
  return { message: 'Removed' }
}
