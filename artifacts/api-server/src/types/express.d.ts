declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionId: string | null;
        sessionClaims: Record<string, unknown> | null;
      };
    }
  }
}

export {};
