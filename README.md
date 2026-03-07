# 📈 AI-Powered Trading Journal

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://trading-journal-islam.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![AI-Llama 3.1](https://img.shields.io/badge/AI-Llama%203.1-orange?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)

A professional-grade full-stack trading journal designed to bridge the gap between technical execution and fundamental analysis. Developed as a personal project to track market performance with real-time AI-driven insights.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Trade Management** | Log, update, and track trades with automated PnL calculation and status management (Open/Closed) |
| 🤖 **AI Market Analyst** | Integrated **Llama 3.1 (via Groq)** that analyzes raw economic data to provide instant fundamental sentiment (Bullish/Bearish/Neutral) |
| 📅 **Economic Calendar** | Live feed of high-impact news from **Forex Factory** and **Financial Modeling Prep** to stay ahead of market volatility |
| 📉 **Macro Data Integration** | Proxied access to **FRED (Federal Reserve Economic Data)** for deep-dive fundamental research |
| 🔐 **User Data Isolation** | Secure **Google OAuth** integration — your trading data is private and accessible only to you |
| 🎨 **Cyberpunk Aesthetic** | Sleek dark-mode UI built with **Tailwind CSS** and **Framer Motion** for a high-performance feel |

---

## 🛠️ Tech Stack

### Frontend
- **React 19 / Vite** — High-speed frontend development
- **Tailwind CSS** — Modern utility-first styling
- **Lucide React** — Crisp, consistent iconography
- **Recharts** — Data visualization for equity curves and PnL

### Backend & Database
- **Node.js / Express** — Robust API layer for data handling and proxying
- **Prisma 5 (ORM)** — Type-safe database access
- **PostgreSQL (Supabase)** — Scalable relational database

### AI & Data Providers
- **Groq Cloud** — Ultra-fast inference for Llama 3.1 fundamental analysis
- **FRED API** — Economic indicator data (GDP, CPI, Interest Rates)
- **Faireconomy API** — Real-time Forex news feeds

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/islam543/Trading-Journal.git
cd Trading-Journal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your keys:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true"

# AI & APIs
GROQ_API_KEY="your_groq_api_key"
FMP_API_KEY="your_fmp_api_key"
FRED_API_KEY="your_fred_api_key"

# Authentication
AUTH_SECRET="your_nextauth_secret"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
```

### 4. Database Sync

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Servers

```bash
# Start Vite frontend and Express backend simultaneously
npm run dev
```

---

## 🔒 Data Isolation & Security

This project implements **multi-tenancy** logic. Every trade entry in the database is linked to a unique `userId` generated via Google OAuth.

- **Privacy:** Users can only view, edit, or delete trades they have created
- **Authentication:** Middleware protection ensures `/api/trades` endpoints are inaccessible without a valid session

---

## 👨‍💻 Author

**Islam** — Computer Science Student @ Qatar University (Class of 2026)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](#)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-000000?style=flat&logo=vercel&logoColor=white)](#)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat&logo=twitter&logoColor=white)](#)

---

> **Disclaimer:** This tool is for educational and journaling purposes only and does not constitute financial advice.
