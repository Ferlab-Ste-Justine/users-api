import cors from 'cors';
import express, { Express } from 'express';
import { Keycloak } from 'keycloak-connect';

import { adminRoleName } from './config/env';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import savedFiltersRouter from './routes/savedFilters';
import usersRouter from './routes/user';
import userSetsRouter from './routes/userSets';
import { globalErrorHandler, globalErrorLogger } from './utils/errors';

export default (keycloak: Keycloak): Express => {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    app.use(
        keycloak.middleware({
            logout: '/logout',
            admin: '/',
        }),
    );

    app.use('/', publicRouter);
    app.use('/user', keycloak.protect(), usersRouter);
    app.use('/saved-filters', keycloak.protect(), savedFiltersRouter);
    app.use('/user-sets', keycloak.protect(), userSetsRouter);
    app.use('/admin', keycloak.protect('realm:' + adminRoleName), adminRouter);

    app.use(globalErrorLogger, globalErrorHandler);

    return app;
};
