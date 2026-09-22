import { DataTypes } from 'sequelize'
import { sequelize } from '../orm/sequelize.js'

const ts = {
  createdAt: { type: DataTypes.DATE(3), allowNull: false },
  updatedAt: { type: DataTypes.DATE(3), allowNull: false },
}

export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    fullName: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    mobile: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    dateOfBirth: DataTypes.DATE,
    gender: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN', 'SUPER_ADMIN'),
      allowNull: false,
      defaultValue: 'USER',
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    avatarUrl: DataTypes.TEXT,
    referralCode: { type: DataTypes.STRING(64), unique: true },
    referredByUserId: DataTypes.STRING(30),
    deletedAt: DataTypes.DATE(3),
    ...ts,
  },
  { tableName: 'User' },
)

export const UserProfile = sequelize.define(
  'UserProfile',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    userId: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    language: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'en' },
    theme: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'system' },
    notificationsOn: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    whatsappOn: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    locationLat: DataTypes.DECIMAL(10, 7),
    locationLng: DataTypes.DECIMAL(10, 7),
  },
  { tableName: 'UserProfile', timestamps: false },
)

export const Wallet = sequelize.define(
  'Wallet',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    userId: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    referralBalance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    joiningBonusCredited: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ...ts,
  },
  { tableName: 'Wallet' },
)

export const TestCategory = sequelize.define(
  'TestCategory',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: DataTypes.TEXT,
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...ts,
  },
  { tableName: 'TestCategory' },
)

export const Test = sequelize.define(
  'Test',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    categoryId: DataTypes.STRING(30),
    name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: DataTypes.TEXT,
    mrp: DataTypes.DECIMAL(10, 2),
    memberPrice: DataTypes.DECIMAL(10, 2),
    isPackage: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isPopular: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...ts,
  },
  { tableName: 'Test' },
)

export const MembershipPlan = sequelize.define(
  'MembershipPlan',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    durationDays: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    isFree: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    flatDiscountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    maxFamilyMembers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...ts,
  },
  { tableName: 'MembershipPlan' },
)

export const Membership = sequelize.define(
  'Membership',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    userId: { type: DataTypes.STRING(30), allowNull: false },
    planId: { type: DataTypes.STRING(30), allowNull: false },
    number: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    startsAt: { type: DataTypes.DATE(3), allowNull: false },
    expiresAt: { type: DataTypes.DATE(3), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: 'Membership', updatedAt: false },
)

export const Appointment = sequelize.define(
  'Appointment',
  {
    id: { type: DataTypes.STRING(30), primaryKey: true },
    code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    userId: { type: DataTypes.STRING(30), allowNull: false },
    testId: { type: DataTypes.STRING(30), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    timeSlot: { type: DataTypes.STRING(64), allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'CONFIRMED',
    },
    patientName: { type: DataTypes.STRING(255), allowNull: false },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    ...ts,
  },
  { tableName: 'Appointment' },
)

User.hasOne(UserProfile, { foreignKey: 'userId' })
UserProfile.belongsTo(User, { foreignKey: 'userId' })
User.hasOne(Wallet, { foreignKey: 'userId' })
Wallet.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Membership, { foreignKey: 'userId' })
Membership.belongsTo(User, { foreignKey: 'userId' })
Membership.belongsTo(MembershipPlan, { foreignKey: 'planId' })
Test.belongsTo(TestCategory, { foreignKey: 'categoryId' })
User.hasMany(Appointment, { foreignKey: 'userId' })
Appointment.belongsTo(User, { foreignKey: 'userId' })
Appointment.belongsTo(Test, { foreignKey: 'testId' })

export const models = {
  User,
  UserProfile,
  Wallet,
  TestCategory,
  Test,
  MembershipPlan,
  Membership,
  Appointment,
}
