# Email Scraper from Google Maps

A full-stack Next.js application that automates the process of extracting business information from Google Maps and scraping their websites for contact email addresses.

## ✨ Features

- **Google Maps Data Extraction**: Uses `Playwright` to search for queries (e.g., "colleges in Coimbatore") and extracts Business Name, Address, Phone Number(s), Reviews, and Website URL.
- **Deep Email Scraping**: Uses `Cheerio` to crawl the extracted business websites. It looks for emails on the homepage and automatically checks common sub-pages (like `/contact`, `/about-us`) if none are found.
- **Real-Time UI**: Uses Server-Sent Events (SSE) to stream live scraping progress and results directly to the web dashboard.
- **Data Export**: Export scraped leads to CSV or Excel instantly.
- **Clean Data**: Automatically strips out hidden Unicode characters and icons from Google Maps listings, and collects all available phone numbers for a business.
- **Persistent Backend (In-Progress)**: Configured with Docker, PostgreSQL, Prisma, and Redis/BullMQ to handle massive, long-running scrape jobs reliably in the background.

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis)

### 2. Installation

Clone the repository and install dependencies:
```bash
npm install
```

### 3. Setup Database & Infrastructure

Start the local PostgreSQL and Redis containers using Docker:
```bash
docker-compose up -d
```

Initialize the database schema using Prisma:
```bash
npx prisma migrate dev --name init
```

### 4. Run the Application

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Scraping Engine:** Playwright (Headless Chromium), Cheerio
- **Database (New Architecture):** PostgreSQL, Prisma ORM
- **Task Queue (New Architecture):** Redis, BullMQ
