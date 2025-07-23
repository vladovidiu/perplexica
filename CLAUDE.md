# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Perplexica is an open-source AI-powered search engine inspired by Perplexity AI. Built with Next.js, TypeScript, and LangChain, it provides intelligent search capabilities across various sources using multiple LLM providers.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production app (includes database push)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format:write` - Format code with Prettier
- `npm run db:push` - Push database schema changes

## Architecture Overview

### Core Components

1. **MetaSearchAgent**: Central search orchestrator located in `src/lib/search/metaSearchAgent.ts`
2. **Focus Modes**: Different search strategies defined in `src/lib/search/index.ts`
3. **LLM Providers**: Multi-provider support in `src/lib/providers/`
4. **Search Pipeline**: Query generation → SearXNG search → Similarity ranking → Response generation

### Request Flow

1. User query hits `/api/chat` route (`src/app/api/chat/route.ts`)
2. Focus mode handler selected from `searchHandlers` 
3. MetaSearchAgent orchestrates: query generation → web search → similarity reranking → response streaming
4. Results stored in SQLite database with Drizzle ORM

## Key Directories

- `src/app/api/` - Next.js API routes (chat, search, config, etc.)
- `src/lib/providers/` - LLM provider integrations (OpenAI, Anthropic, Ollama, etc.)
- `src/lib/search/` - Search logic and MetaSearchAgent
- `src/lib/prompts/` - LLM prompts for different focus modes
- `src/lib/chains/` - LangChain agent implementations
- `src/components/` - React UI components
- `src/lib/db/` - Database schema and configuration

## Focus Modes

Available search modes defined in `src/lib/search/index.ts`:
- `webSearch` - General web search with reranking
- `academicSearch` - Academic papers (arXiv, PubMed, Google Scholar)
- `writingAssistant` - Writing tasks without web search
- `youtubeSearch` - YouTube video search
- `redditSearch` - Reddit discussions
- `wolframAlphaSearch` - Mathematical/computational queries

## Configuration

- Main config: `config.toml` (copied from `sample.config.toml`)
- Configuration loaded via `src/lib/config.ts`
- Database: SQLite with Drizzle ORM (`drizzle.config.ts`)
- Schema: `src/lib/db/schema.ts` (messages and chats tables)

## LLM Provider System

Providers are dynamically loaded from `src/lib/providers/index.ts`:
- Each provider exports `load{Provider}ChatModels` and `load{Provider}EmbeddingModels`
- Configuration keys in `config.toml` determine available providers
- Custom OpenAI-compatible endpoints supported via `custom_openai` provider

## Database Operations

- Use `npm run db:push` to update schema
- Migrations in `drizzle/` directory
- Database file: `data/db.sqlite`

## Important Files

- `src/app/api/chat/route.ts` - Main chat API endpoint
- `src/lib/search/metaSearchAgent.ts` - Core search logic
- `src/lib/providers/index.ts` - Provider management
- `src/lib/config.ts` - Configuration management
- `src/lib/db/schema.ts` - Database schema