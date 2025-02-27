import { streamText } from 'ai';
import { llmBaseUrl, llmApiKey, llmModel } from '@/libs/config';
import { createDeepSeek } from '@ai-sdk/deepseek';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const dashscopeDeepseek = createDeepSeek({
    baseURL: llmBaseUrl,
    apiKey: llmApiKey
});

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: dashscopeDeepseek(llmModel),
    prompt,
  });

  return result.toDataStreamResponse();
}