import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// FRED API Proxy Endpoint
app.get('/api/fred', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Incoming request: ${req.originalUrl}`);
    console.log(`[${new Date().toISOString()}] Query parameters:`, req.query);
    try {
        // Robust parameter check
        const id = req.query.id || req.query.series_id || req.query.seriesId;
        const q = req.query.q || req.query.search || req.query.query;

        const fredApiKey = process.env.FRED_API_KEY || 'e5bbd2d08eba5b97edfe0e53a499996a';

        if (!id && !q) {
            console.warn(`[${new Date().toISOString()}] Warning: Missing parameters in request.`);
            return res.status(400).json({
                error: 'Missing parameter: id (series id) or q (search query) is required',
                receivedQuery: req.query,
                hint: 'Use /api/fred?id=GNPCA'
            });
        }

        let url = '';

        if (id) {
            url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${fredApiKey}&file_type=json`;
        } else if (q) {
            url = `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(q.toString())}&api_key=${fredApiKey}&file_type=json`;
        }

        console.log(`Fetching from FRED: ${url.replace(fredApiKey, 'REDACTED')}`);

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from FRED API:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch from FRED API',
            details: error.message
        });
    }
});

// Trades API Endpoints
app.get('/api/trades', async (req, res) => {
    try {
        const trades = await prisma.trade.findMany({
            orderBy: { timestamp: 'desc' }
        });
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trades:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});

app.post('/api/trades', async (req, res) => {
    try {
        const { symbol, type, entryPrice, exitPrice, quantity, notes, status } = req.body;

        // Calculate PnL if closed
        let pnl = null;
        if (status === 'CLOSED' && entryPrice && exitPrice && quantity) {
            const multiplier = type === 'BUY' ? 1 : -1;
            pnl = (exitPrice - entryPrice) * quantity * multiplier;
        }

        const trade = await prisma.trade.create({
            data: {
                symbol,
                type,
                entryPrice: Number(entryPrice),
                exitPrice: exitPrice ? Number(exitPrice) : null,
                quantity: Number(quantity),
                notes,
                status: status || 'OPEN',
                pnl: pnl
            }
        });
        res.json(trade);
    } catch (error) {
        console.error('Error creating trade:', error);
        res.status(500).json({ error: 'Failed to create trade' });
    }
});

app.delete('/api/trades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.trade.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Trade deleted successfully' });
    } catch (error) {
        console.error('Error deleting trade:', error);
        res.status(500).json({ error: 'Failed to delete trade' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`FRED Proxy ready at http://localhost:${PORT}/api/fred`);
});
