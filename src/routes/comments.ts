import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const commentSchema = z.object({
  content: z.string().min(1),
  taskId: z.string()
});

router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { content, taskId } = parsed.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        authorId: req.user!.id
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id as string } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user?.id && req.user?.role !== 'PM') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
