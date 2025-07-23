import { RunnableSequence, RunnableMap } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';

const titleGeneratorPrompt = `
You are an expert at creating concise, engaging article titles. Given the content of an article, generate a clear and descriptive title that accurately represents the main topic.

Requirements:
- The title should be no more than 10 words
- It should capture the essence of the article
- It should be engaging and informative
- Do not include quotes or special formatting
- Focus on the main topic or key finding

Article Content:
{content}

Generate only the title, nothing else:`;

type TitleGeneratorInput = {
  content: string;
};

const createTitleGeneratorChain = (llm: BaseChatModel) => {
  return RunnableSequence.from([
    RunnableMap.from({
      content: (input: TitleGeneratorInput) => input.content.slice(0, 1500), // Limit content to avoid token limits
    }),
    PromptTemplate.fromTemplate(titleGeneratorPrompt),
    llm,
    new StringOutputParser(),
  ]);
};

const generateTitle = async (
  input: TitleGeneratorInput,
  llm: BaseChatModel,
): Promise<string> => {
  try {
    // Set temperature to 0.3 for more consistent titles
    (llm as unknown as ChatOpenAI).temperature = 0.3;
    const titleGeneratorChain = createTitleGeneratorChain(llm);
    const title = await titleGeneratorChain.invoke(input);
    return title.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    throw error;
  }
};

export default generateTitle;
