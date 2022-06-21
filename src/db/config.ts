import { Sequelize } from 'sequelize';

import { dbHost, dbName, dbPassword, dbPort, dbUser } from '../env';

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
    port: dbPort,
    host: dbHost,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
});

export default sequelizeConnection;
