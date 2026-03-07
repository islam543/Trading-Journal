import express from 'express';
import bcrypt from 'bcrypt';
import prisma from './prisma.js';
import { generateToken, authMiddleware } from './authMiddleware.js';

const authRouter = express.Router();

// Sign up with email/password
authRouter.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login with email/password
authRouter.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Google auth (frontend sends google user info)
authRouter.post('/api/auth/google', async (req, res) => {
  try {
    const { email, googleId, name } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and googleId are required.' });
    }

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, name: user.name || name },
        });
      } else {
        user = await prisma.user.create({
          data: { email, googleId, name },
        });
      }
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error during Google auth:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

// Get current user
authRouter.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

export { authRouter };
