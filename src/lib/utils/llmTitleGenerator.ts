import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export async function generateLlmTitle(content: string, llm: BaseChatModel): Promise<string> {
  const prompt = PromptTemplate.fromTemplate(
    `Generate a concise and descriptive title for the following article content. The title should be no more than 10 words and accurately reflect the main topic.

Article Content:
{article_content}

Title:`,
  );

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  try {
    const title = await chain.invoke({ article_content: content });
    return title.trim();
  } catch (error) {
    console.error('Error generating LLM title:', error);
    return ''; // Return empty string on error, fallback will be handled by caller
  }
}
