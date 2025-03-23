import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptionsDelegate } from "cors";
import cookieParser from "cookie-parser";
import 'express-async-errors';
import { getTenantBySubdomain } from './infrastructure/database/getTenantBySubdomain';
import { extractSubdomain } from './utils/extractSubdomain';
import { verifyToken } from './infrastructure/application/middleware/verifyToken';
import { Tenant } from './domain/types/tenant';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      user?: any;
    }
  }
}

const app = express();

app.use(express.json());
app.use(cookieParser());

// 🌍 Configure CORS
const allowedOrigins: (string | RegExp)[] = [/\.nestcrm\.com\.au$/, 'https://nestcrm.com.au'];

const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin as string | undefined;
  const isAllowed = !origin || allowedOrigins.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  callback(isAllowed ? null : new Error('Not allowed by CORS'), {
    origin: isAllowed,
    credentials: true,
  });
};

app.use(cors(corsOptions));


/**
 * 🛡️ Middleware to validate tenant
 * Checks the subdomain from hostname and fetches tenant info
 */
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const host = req.hostname;
  const subdomain = extractSubdomain(host);

  // Allow root domain to bypass tenant check
  if (host === 'nestcrm.com.au') return next();

  try {
    const tenant = await getTenantBySubdomain(subdomain);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    console.error("❌ Error in tenant verification middleware:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('✅ EC2 instance is running and healthy!');
});

// ✅ Status route (protected)
app.get('/api/status', verifyToken, (req: Request, res: Response) => {
  res.json({
    message: '🟢 API is working fine!',
    tenant: req.tenant?.Subdomain,
    user: req.user
  });
});

// ✅ Dummy protected data
app.get('/api/data', verifyToken, (req: Request, res: Response) => {
  res.json({
    tenant: req.hostname,
    user: req.user,
    data: ['Item 1', 'Item 2', 'Item 3'],
  });
});

// ✅ Fallback route
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Start server
app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Backend API server running on port 3000');
});
