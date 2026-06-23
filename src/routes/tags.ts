import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(30, "Tag name is too long"),
  color: z.string().optional()
});

router.use(authenticate);

// Get all tags
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new tag
router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsed = createTagSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, color } = parsed.data;

    // Check if tag already exists (case-insensitive check handled by Prisma depending on collation, but doing it manually is safer)
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: name } }
    });

    if (existing) {
      return res.status(400).json({ error: 'Tag with this name already exists' });
    }

    const newTag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3b82f6'
      }
    });

    res.status(201).json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
