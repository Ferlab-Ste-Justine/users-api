import stripJS from 'strip-js';

export const sanitizePayload = (req, res, next) => {
    if (req.body) {
        req.body = stripJS(req.body);
    }
    next();
};
