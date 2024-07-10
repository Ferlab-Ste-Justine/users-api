import cors from 'cors';
import express, { Express } from 'express';
import { sanitize, xss } from 'express-xss-sanitizer';
import { Keycloak } from 'keycloak-connect';

import { adminRoleName } from './config/env';
import adminRouter from './routes/admin';
import newsletterRouter from './routes/newsletter';
import publicRouter from './routes/public';
import savedFiltersRouter from './routes/savedFilters';
import statisticsRouter from './routes/statistics';
import usersRouter from './routes/user';
import userSetsRouter from './routes/userSets';
import variantRouter from './routes/variant';
import { globalErrorHandler, globalErrorLogger } from './utils/errors';

export default (keycloak: Keycloak): Express => {
    const app = express();

    app.use((req, res, next) => {
        req.body = sanitize(req.body);
        next();
    });

    app.use(cors());
    app.use(xss());
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
    app.use('/statistics', keycloak.protect('realm:' + adminRoleName), statisticsRouter);
    app.use('/newsletter', keycloak.protect(), newsletterRouter);
    app.use('/variants', keycloak.protect(), variantRouter);

    app.use(globalErrorLogger, globalErrorHandler);

    return app;
};
