📈 AI-Powered Trading Journal
A professional full-stack trading journal designed to help traders track performance and analyze market fundamentals using Llama 3.1 via Groq. This application bridges the gap between technical execution and fundamental awareness.

✨ Key Features
📊 Dynamic Trade Journaling: Log trades with symbols, entry/exit prices, and automated PnL calculation.

🤖 AI Fundamental Analysis: Real-time analysis of economic events (from FRED and FMP) using Llama 3.1 to provide market sentiment (Bullish/Bearish/Neutral).

📅 Economic Calendar: Stay ahead of the curve with a live feed of high-impact news and data releases.

🔐 User Isolation: Secure Google Authentication ensuring that your trades and data are private to your account.

📱 Responsive Dashboard: Built with Tailwind CSS and Framer Motion for a sleek, "tech-noir" aesthetic.

🛠️ Tech Stack
Frontend
Next.js 15+ (App Router)

Tailwind CSS (Styling)

Lucide React (Icons)

Recharts (Performance Analytics)

Backend & Database
Node.js & Express (API Layer)

Prisma ORM (Database Management)

PostgreSQL (Hosted on Supabase/Vercel)

AI & Data APIs
Groq Cloud: Llama 3.1 8B for instant fundamental sentiment.

FRED API: Federal Reserve Economic Data.

Financial Modeling Prep: Global economic calendar.

🚀 Getting Started
1. Clone the repository
Bash

git clone https://github.com/islam543/Trading-Journal.git
cd Trading-Journal
2. Install Dependencies
Bash

npm install
3. Set up Environment Variables
Create a .env file in the root directory:

Code snippet

DATABASE_URL="your_postgresql_url"
GROQ_API_KEY="your_groq_key"
FINNHUB_API_KEY="your_finnhub_key"
FRED_API_KEY="your_fred_key"
NEXTAUTH_SECRET="your_secret"
GOOGLE_CLIENT_ID="your_id"
GOOGLE_CLIENT_SECRET="your_secret"
4. Database Setup
Bash

npx prisma generate
npx prisma db push
5. Run the Project
Bash

# Start frontend and backend
npm run dev
🛡️ Data Privacy & Security
This application uses Row-Level Security (RLS) patterns via Prisma. No trade data is public; every database query is filtered by the unique userId provided by Google OAuth, ensuring your edge stays your own.

👨‍💻 Author
Islam Computer Science Student @ Qatar University (Class of 2026) LinkedIn | Portfolio
