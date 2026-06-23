import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  acceptanceCriteria: z.string().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  spaceId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
});

router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'PM') {
      return res.status(403).json({ error: 'Only PMs can create tasks' });
    }

    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { tagIds, ...data } = parsed.data;
    const task = await prisma.task.create({
      data: {
        ...data,
        authorId: req.user.id,
        ...(tagIds && tagIds.length > 0 ? {
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        } : {})
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const search = req.query.search as string; const status = req.query.status as string; const priority = req.query.priority as string; const assigneeId = req.query.assigneeId as string; const spaceId = req.query.spaceId as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } }
      ];
    }
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (assigneeId) where.assigneeId = String(assigneeId);
    if (spaceId) where.spaceId = String(spaceId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        author: { select: { id: true, name: true, email: true } },
        tags: true,
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

router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        author: { select: { id: true, name: true, email: true } },
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsed = taskSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { tagIds, ...data } = parsed.data;

    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        ...data,
        ...(tagIds !== undefined ? {
          tags: {
            set: tagIds.map(id => ({ id }))
          }
        } : {})
      }
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'PM') {
      return res.status(403).json({ error: 'Only PMs can delete tasks' });
    }

    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
