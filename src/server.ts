import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptionsDelegate } from "cors";
import cookieParser from "cookie-parser";
import 'express-async-errors';
import { verifyToken } from './infrastructure/application/middleware/verifyToken';
import { Tenant } from './domain/types/tenant';

import dotenv from 'dotenv';
import { verifySubdomain } from "./infrastructure/application/middleware/verifySubdomain";
dotenv.config();

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
const allowedOrigins: (string | RegExp)[] = [/\.nestcrm\.com\.au$/, 'https://nestcrm.com.au', 'https://www.nestcrm.com.au', 'https://*.nestcrm.com.au'];

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

app.use('/', verifySubdomain);

// ✅ Dummy protected data
app.get('/api/data', verifyToken, (req: Request, res: Response) => {
  res.json({
    tenant: req.hostname,
    user: req.user,
    data: ['Item 1', 'Item 2', 'Item 3'],
  });
});

app.post('/api/logout', (req: Request, res: Response) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "https://nestcrm.com.au");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.cookie("token", "", {
    domain: ".nestcrm.com.au",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });

  // 🧼 Clear __vercel_toolbar too
  res.cookie("__vercel_toolbar", "", {
    domain: "nestcrm.com.au",
    path: "/",
    expires: new Date(0),
  });

  res.status(200).json({ message: "✅ Logged out + toolbar cleared" });
});


// ✅ Health check
app.get('/api/status', (_req: Request, res: Response) => {
  res.send('✅ EC2 instance is running and healthy!');
});

// ✅ Fallback route
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Start server
app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Backend API server running on port 3000');
});
