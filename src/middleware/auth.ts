import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; role: string };
    
    // Verify user actually exists in the DB
    const userExists = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!userExists) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
