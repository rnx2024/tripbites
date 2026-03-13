# TripBites Frontend

TripBites is a Next.js frontend for a travel intelligence app that helps users get fast, practical city insights before or during a trip.

The app lets users ask about a city and receive a concise response based on live weather conditions, recent local headlines, and risk-related context from the backend service.

## What it does

TripBites is designed as a thin client.

The frontend handles:
- user input
- chat interface
- quick prompts
- lightweight city lookup flow
- display of weather and local update summaries

The backend handles:
- weather retrieval
- news retrieval
- session handling
- AI-generated travel summaries
- risk and disruption interpretation

## Main features

- Ask about any city or place
- Get a travel-oriented summary in natural language
- View a quick weather summary
- View recent local headlines
- Use preset cities and one-click prompts
- Clean card-based UI built with Next.js and Tailwind CSS

## Tech stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Project structure

- `app/` - routes, layout, page entry, API proxy routes
- `components/` - UI components such as chat and quick summary cards
- `lib/` - frontend request helpers
- `public/` - static assets

## API flow

The frontend does not call third-party services directly.

It sends requests to internal Next.js API routes:
- `POST /api/chat`
- `GET /api/weather?place=...`
- `GET /api/news?place=...`

Those routes forward requests to the backend service using secure server-side environment variables.

## Required environment variables

Create a `.env.local` file:

```env
BACKEND_URL=http://localhost:8000
EXTERNAL_API_KEY=your_backend_api_key
BACKEND_TIMEOUT_MS=15000
```
