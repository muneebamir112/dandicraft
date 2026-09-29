# 05 - Local Development Setup

## Prerequisites
- Node.js 18+
- MySQL 8.x

## Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup Environment
cp .env.local.example .env.local
# Edit .env.local with your MySQL credentials

# 3. Setup Database (Schema & Seeds)
npm run db:setup

# 4. Start Development Server
npm run dev
```
