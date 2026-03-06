import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = globalThis.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// FRED API Proxy Endpoint
app.get("/api/fred", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Incoming request: ${req.originalUrl}`,
  );
  console.log(`[${new Date().toISOString()}] Query parameters:`, req.query);
  try {
    // Robust parameter check
    const id = req.query.id || req.query.series_id || req.query.seriesId;
    const q = req.query.q || req.query.search || req.query.query;

    const fredApiKey =
      process.env.FRED_API_KEY || "e5bbd2d08eba5b97edfe0e53a499996a";

    if (!id && !q) {
      console.warn(
        `[${new Date().toISOString()}] Warning: Missing parameters in request.`,
      );
      return res.status(400).json({
        error:
          "Missing parameter: id (series id) or q (search query) is required",
        receivedQuery: req.query,
        hint: "Use /api/fred?id=GNPCA",
      });
    }

    let url = "";

    if (id) {
      url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${fredApiKey}&file_type=json`;
    } else if (q) {
      url = `https://api.stlouisfed.org/fred/series/search?search_text=${encodeURIComponent(q.toString())}&api_key=${fredApiKey}&file_type=json`;
    }

    console.log(`Fetching from FRED: ${url.replace(fredApiKey, "REDACTED")}`);

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from FRED API:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch from FRED API",
      details: error.message,
    });
  }
});

// Trades API Endpoints
app.get("/api/trades", async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { timestamp: "desc" },
    });
    res.json(trades);
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

app.post("/api/trades", async (req, res) => {
  try {
    const {
      symbol,
      type,
      entryPrice,
      exitPrice,
      quantity,
      notes,
      status,
      imageUrl,
    } = req.body;

    // Calculate PnL if closed
    let pnl = null;
    if (status === "CLOSED" && entryPrice && exitPrice && quantity) {
      const multiplier = type === "BUY" ? 1 : -1;
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
        status: status || "OPEN",
        pnl: pnl,
        imageUrl: imageUrl || null,
      },
    });
    res.json(trade);
  } catch (error) {
    console.error("Error creating trade:", error);
    res.status(500).json({ error: "Failed to create trade" });
  }
});

app.put("/api/trades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      symbol,
      type,
      entryPrice,
      exitPrice,
      quantity,
      notes,
      status,
      imageUrl,
    } = req.body;

    let pnl = null;
    if (status === "CLOSED" && entryPrice && exitPrice && quantity) {
      const multiplier = type === "BUY" ? 1 : -1;
      pnl = (exitPrice - entryPrice) * quantity * multiplier;
    }

    const trade = await prisma.trade.update({
      where: { id: Number(id) },
      data: {
        symbol,
        type,
        entryPrice: entryPrice ? Number(entryPrice) : undefined,
        exitPrice: exitPrice ? Number(exitPrice) : null,
        quantity: quantity ? Number(quantity) : undefined,
        notes,
        status,
        pnl,
        imageUrl: imageUrl || null,
      },
    });
    res.json(trade);
  } catch (error) {
    console.error("Error updating trade:", error);
    res.status(500).json({ error: "Failed to update trade" });
  }
});

app.delete("/api/trades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.trade.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    console.error("Error deleting trade:", error);
    res.status(500).json({ error: "Failed to delete trade" });
  }
});

// --- ForexFactory News Proxy (commented out — rate limited) ---
// let ffCache = { data: null, fetchedAt: 0 };
// const FF_CACHE_TTL = 10 * 60 * 1000;
// app.get('/api/news', async (req, res) => {
//     try {
//         const now = Date.now();
//         if (ffCache.data && (now - ffCache.fetchedAt) < FF_CACHE_TTL) {
//             return res.json(ffCache.data);
//         }
//         const response = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
//             headers: { 'User-Agent': 'TradingJournal/1.0' }
//         });
//         ffCache = { data: response.data, fetchedAt: now };
//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching news:', error.message);
//         if (ffCache.data) return res.json(ffCache.data);
//         res.status(500).json({ error: 'Failed to fetch news (rate limited).' });
//     }
// });

// Finnhub Market News Proxy (free tier — cached 10 min)
let newsCache = { data: null, fetchedAt: 0 };
const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

app.get("/api/news", async (req, res) => {
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (!finnhubKey) {
      return res.status(500).json({
        error: "FINNHUB_API_KEY is not configured. Add it to your .env file.",
      });
    }

    const now = Date.now();
    if (newsCache.data && now - newsCache.fetchedAt < NEWS_CACHE_TTL) {
      return res.json(newsCache.data);
    }

    const category = req.query.category || "general";
    const url = `https://finnhub.io/api/v1/news?category=${category}&token=${finnhubKey}`;
    const response = await axios.get(url);

    const events = Array.isArray(response.data) ? response.data : [];
    newsCache = { data: events, fetchedAt: now };
    res.json(events);
  } catch (error) {
    console.error("Error fetching Finnhub market news:", error.message);
    if (newsCache.data) {
      return res.json(newsCache.data);
    }
    res
      .status(500)
      .json({ error: "Failed to fetch market news from Finnhub." });
  }
});

// Economic Calendar Endpoint (Financial Modeling Prep)
app.get("/api/economic-calendar", async (req, res) => {
  try {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error:
          "FMP_API_KEY is not configured. Add it to your .env file. Get a key at https://financialmodelingprep.com/",
      });
    }

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const from = today.toISOString().split("T")[0];
    const to = nextWeek.toISOString().split("T")[0];

    const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${from}&to=${to}&apikey=${apiKey}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching economic calendar:", error.message);
    res.status(500).json({ error: "Failed to fetch economic calendar" });
  }
});

// AI Analysis Endpoint (Groq)
app.post("/api/ai-analysis", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error:
          "GROQ_API_KEY is not configured. Add it to your .env file. Get a key at https://console.groq.com/",
      });
    }

    const { events } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              'You are a financial market analyst. Analyze the following market news headlines and provide a JSON response with exactly this structure (no markdown, no code blocks, just raw JSON): {"overallSentiment":"Bullish or Bearish or Neutral","summary":"2-3 sentence market overview","events":[{"title":"headline text","sentiment":"Bullish or Bearish or Neutral","impact":"High or Medium or Low","analysis":"1-2 sentence analysis"}]}. Analyze at most 8 events. Respond ONLY with valid JSON, no other text.',
          },
          {
            role: "user",
            content: JSON.stringify(events),
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    let aiContent = response.data.choices[0].message.content;
    // Strip markdown code blocks if present
    aiContent = aiContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    try {
      const parsed = JSON.parse(aiContent);
      // Normalize keys — handle snake_case from LLM
      const result = {
        overallSentiment:
          parsed.overallSentiment || parsed.overall_sentiment || "Neutral",
        summary: parsed.summary || parsed.market_summary || "",
        events: (parsed.events || parsed.analysis || []).map((e) => ({
          title: e.title || e.headline || "",
          sentiment: e.sentiment || "Neutral",
          impact: e.impact || "Medium",
          analysis: e.analysis || e.description || "",
        })),
      };
      res.json(result);
    } catch {
      res.json({ overallSentiment: "Neutral", summary: aiContent, events: [] });
    }
  } catch (error) {
    console.error("Error with AI analysis:", error.message);
    res.status(500).json({ error: "Failed to get AI analysis" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`FRED Proxy ready at http://localhost:${PORT}/api/fred`);
  });
}

export default app;
