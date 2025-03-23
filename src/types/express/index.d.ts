// src/types/express/index.d.ts
declare global {
    namespace Express {
        interface Request {
            user?: any; // 👈 deixa como 'any' para evitar conflito
            tenant?: import("../../domain/types/tenant").Tenant;
        }
    }
}

export { };
