import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { appLogger } from '../lib/logger';

const buildUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      rewardProfile: {
        select: {
          tier: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.name || user.email.split('@')[0],
    avatarUrl:
      user.avatarUrl ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=e2e8f0`,
    membershipLabel: `${user.rewardProfile?.tier || 'Basic'} Member`,
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email 已被註冊' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        rewardProfile: {
          create: {
            tier: 'Basic',
          },
        },
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    const profile = await buildUserProfile(user.id);
    res.json({ token, user: profile });
  } catch (error) {
    appLogger.error('Register failed', { error });
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    const profile = await buildUserProfile(user.id);
    res.json({ token, user: profile });
  } catch (error) {
    appLogger.error('Login failed', { error });
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }

    const profile = await buildUserProfile(req.userId);
    if (!profile) {
      res.status(404).json({ error: '找不到使用者' });
      return;
    }

    res.json({ user: profile });
  } catch (error) {
    appLogger.error('Fetch current user profile failed', { error, userId: req.userId });
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }

    const { displayName, avatarUrl } = req.body as { displayName?: string; avatarUrl?: string };
    const updateData: { name?: string | null; avatarUrl?: string | null } = {};

    if (displayName !== undefined) {
      updateData.name = displayName;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });

    const profile = await buildUserProfile(req.userId);
    res.json({ user: profile });
  } catch (error) {
    appLogger.error('Update profile failed', { error, userId: req.userId });
    res.status(500).json({ error: '伺服器錯誤' });
  }
};