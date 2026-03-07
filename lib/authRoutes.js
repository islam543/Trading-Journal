import express from 'express';
import bcrypt from 'bcrypt';
import axios from 'axios';
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

// Google auth (frontend sends Google ID token credential)
authRouter.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    if (!googleClientId) {
      return res.status(500).json({ error: 'Google auth is not configured on the server.' });
    }

    const tokenInfoResponse = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: credential },
    });
    const tokenPayload = tokenInfoResponse.data;

    if (tokenPayload.aud !== googleClientId) {
      return res.status(401).json({ error: 'Google credential audience mismatch.' });
    }

    if (tokenPayload.email_verified !== 'true') {
      return res.status(401).json({ error: 'Google account email is not verified.' });
    }

    const { email, sub: googleId } = tokenPayload;
    const name = tokenPayload.name || tokenPayload.given_name || null;

    if (!email || !googleId) {
      return res.status(401).json({ error: 'Google credential is missing required profile data.' });
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
    if (error.response?.status === 400) {
      return res.status(401).json({ error: 'Invalid Google credential.' });
    }

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
