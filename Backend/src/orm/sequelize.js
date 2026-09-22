import { Sequelize } from 'sequelize'
import { config } from '../config/index.js'

const { host, port, user, password, database } = config.db

export const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging: process.env.SEQUELIZE_LOG === '1' ? console.log : false,
  dialectOptions: {
    dateStrings: false,
  },
  timezone: '+00:00',
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    freezeTableName: true,
    underscored: false,
  },
})
