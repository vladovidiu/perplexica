import generateTitle from '@/lib/chains/titleGeneratorAgent';
import { getAvailableChatModelProviders } from '@/lib/providers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '@/lib/config';

interface GenerateTitleBody {
  content: string;
  url: string; // Use URL as cache key
}

// Simple in-memory cache for titles
const titleCache = new Map<string, string>();

export const POST = async (req: Request) => {
  try {
    const body: GenerateTitleBody = await req.json();

    if (!body.content || !body.url) {
      return Response.json(
        { error: 'Content and URL are required' },
        { status: 400 },
      );
    }

    // Check cache first
    const cachedTitle = titleCache.get(body.url);
    if (cachedTitle) {
      return Response.json({ title: cachedTitle }, { status: 200 });
    }

    // Get available chat model for title generation
    const chatModelProviders = await getAvailableChatModelProviders();

    let llm: BaseChatModel | undefined;

    // Try to get a chat model (prefer faster/cheaper models)
    const customOpenAiApiKey = getCustomOpenaiApiKey();
    const customOpenAiApiUrl = getCustomOpenaiApiUrl();
    const customOpenAiModelName = getCustomOpenaiModelName();

    if (customOpenAiApiKey && customOpenAiApiUrl && customOpenAiModelName) {
      llm = new ChatOpenAI({
        apiKey: customOpenAiApiKey,
        modelName: customOpenAiModelName,
        temperature: 0.3,
        configuration: {
          baseURL: customOpenAiApiUrl,
        },
      }) as unknown as BaseChatModel;
    } else {
      // Try to find a suitable model from available providers
      const preferredProviders = ['openai', 'gemini', 'groq', 'anthropic'];

      for (const provider of preferredProviders) {
        if (chatModelProviders[provider]) {
          const models = Object.keys(chatModelProviders[provider]);
          if (models.length > 0) {
            // Prefer smaller/faster models for title generation
            const preferredModels = [
              'gpt-3.5-turbo',
              'gpt-4o-mini',
              'gemini-1.5-flash',
              'claude-3-haiku',
            ];
            const model =
              models.find((m) =>
                preferredModels.some((pm) => m.includes(pm)),
              ) || models[0];
            llm = chatModelProviders[provider][model]
              .model as unknown as BaseChatModel;
            break;
          }
        }
      }
    }

    if (!llm) {
      return Response.json(
        { error: 'No LLM provider available' },
        { status: 503 },
      );
    }

    // Generate title
    const generatedTitle = await generateTitle({ content: body.content }, llm);

    // Cache the title
    titleCache.set(body.url, generatedTitle);

    // Limit cache size to prevent memory issues
    if (titleCache.size > 1000) {
      const firstKey = titleCache.keys().next().value;
      if (firstKey) {
        titleCache.delete(firstKey);
      }
    }

    return Response.json({ title: generatedTitle }, { status: 200 });
  } catch (error) {
    console.error('Error generating title:', error);
    return Response.json(
      { error: 'Failed to generate title' },
      { status: 500 },
    );
  }
};
