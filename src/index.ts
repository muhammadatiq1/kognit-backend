import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import commentRoutes from './routes/comments';
import spaceRoutes from './routes/spaces';
import tagsRoutes from './routes/tags';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/tags', tagsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err: any) => {
  console.error('Server error:', err);
});
// restart nodemon