# Perplexica Analysis

This document outlines the architecture and functionality of the Perplexica application.

## Overview

Perplexica is an open-source, AI-powered search engine inspired by Perplexity AI. It aims to provide direct, accurate, and up-to-date answers to user queries by leveraging Large Language Models (LLMs) and a metasearch engine.

## Core Components

- **User Interface:** A web-based interface built with Next.js, React, and TypeScript, allowing users to interact with the search engine.
- **Agent/Chains:** Powered by the `langchain` library, these components orchestrate the process of understanding queries, determining the need for a web search, and generating responses.
- **SearXNG:** A metasearch engine used to fetch real-time information from a wide range of sources on the internet.
- **LLMs (Large Language Models):** Perplexica supports various LLM providers for content understanding, response generation, and source citation. Supported providers include:
    - OpenAI
    - Ollama (for local models)
    - Groq
    - Anthropic
    - Gemini
    - Deepseek
- **Embedding Models:** The application uses embedding models and similarity search algorithms (like cosine similarity) to re-rank search results from SearxNG, ensuring the most relevant sources are used to answer the user's query.
- **Database:** A SQLite database is used for data persistence, managed with `drizzle-orm` and the `better-sqlite3` driver. This is likely used to store chat history and user settings.

## How it Works

1.  **Query Intake:** A user's query is sent to the `/api/chat` endpoint.
2.  **Chain Invocation:** Based on the selected "focus mode," a specific `langchain` chain is invoked.
3.  **Query Analysis:** The chain first determines if a web search is necessary. If so, it generates a search query.
4.  **Web Search:** The generated query is passed to SearXNG to retrieve relevant web pages.
5.  **Re-ranking:** The retrieved search results are converted into embeddings along with the user's query. A similarity search is performed to find the most relevant sources.
6.  **Response Generation:** The most relevant sources, along with the chat history and original query, are passed to an LLM to generate a comprehensive answer.
7.  **Streaming and Citation:** The generated response is streamed back to the user interface. The LLM is prompted to cite its sources, which are then displayed in the UI.

## Key Features

- **Multiple Focus Modes:**
    - **All Mode:** A general web search.
    - **Writing Assistant:** For writing tasks without web search.
    - **Academic Search:** For finding academic papers.
    - **YouTube Search:** For finding videos.
    - **Wolfram Alpha:** For computational queries.
    - **Reddit Search:** For finding discussions and opinions.
- **Local LLM Support:** Can connect to local LLMs via Ollama.
- **API:** Provides an API for developers to integrate Perplexica into their own applications.
- **Dockerized:** Includes a `docker-compose.yaml` for easy setup and deployment.

## Project Structure

- **Frontend:** `src/app/` and `src/components/`
- **Backend API:** `src/app/api/`
- **Core Logic:** `src/lib/` (contains chains, prompts, and provider integrations)
- **Database Schema:** `src/lib/db/schema.ts`
- **Configuration:** `config.toml`
