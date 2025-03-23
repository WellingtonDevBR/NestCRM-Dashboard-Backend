import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Missing Authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        const subdomainFromToken = decoded.subdomain;
        const subdomainFromRequest = req.hostname.split('.')[0];

        if (subdomainFromToken !== subdomainFromRequest) {
            res.status(403).json({ error: 'Subdomain mismatch' });
            return;
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error('❌ Token validation error', err);
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};
