# Problem Spark Engine

Turn community noise into build-ready ideas.

## What it does

Scans Reddit, Hacker News, and other communities to surface real problems people are discussing and transforms them into actionable startup ideas using AI.

## Features

- 🔍 **Smart Scraping**: Automated collection from Reddit & Hacker News
- 🤖 **AI Processing**: Gemini AI extracts problems, target users, and MVP suggestions  
- 🏷️ **Smart Tagging**: Automatic categorization and filtering
- 📊 **Real-time Data**: PostgreSQL database with daily updates
- 🔖 **Bookmarking**: Save ideas for later review
- 📱 **Responsive**: Works on all devices

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Vercel serverless functions
- **Database**: Neon PostgreSQL
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

See `.env.local` for required API keys:
- `DATABASE_URL` - Neon PostgreSQL connection
- `GEMINI_API_KEY` - Google Gemini API
- `REDDIT_CLIENT_ID` & `REDDIT_CLIENT_SECRET` - Reddit API

## API Endpoints

- `GET /api/ideas` - Fetch ideas with filtering/pagination
- `POST /api/scrape-ideas` - Trigger manual scraping
- `GET /api/tags` - Get all available tags

---

*Built by [Ohm](https://github.com/ohm) - Curating startup opportunities from community discussions.*