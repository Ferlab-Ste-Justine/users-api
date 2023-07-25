import cors from 'cors';
import express, { Express } from 'express';
import session from 'express-session';
import { Keycloak } from 'keycloak-connect';

import { adminRoleName } from './config/env';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import savedFiltersRouter from './routes/savedFilters';
import usersRouter from './routes/user';
import userSetsRouter from './routes/userSets';
import { globalErrorHandler, globalErrorLogger } from './utils/errors';
import {sanitizePayload} from "./utils/utils";

export default (keycloak: Keycloak): Express => {
    const app = express();
    app.use(
        session({
            secret: 'MY_SECRET',
            cookie: {
                httpOnly: true,
                secure: true,
            },
        }),
    );

    app.all('*', sanitizePayload);

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
