import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const spaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPrivate: z.boolean().optional().default(false)
});

router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsed = spaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const space = await prisma.space.create({
      data: parsed.data
    });

    res.status(201).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const spaceId = req.params.id as string;
    const space = await prisma.space.findUnique({
      where: { id: spaceId }
    });
    if (!space) return res.status(404).json({ error: 'Space not found' });
    res.json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/tasks', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const tasks = await prisma.task.findMany({
      where: { spaceId: req.params.id as string },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
