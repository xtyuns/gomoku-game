import { llmApiKey, llmBaseUrl, llmModel } from "@/libs/config";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createDataStreamResponse, streamText } from "ai";

const dashscopeDeepseek = createDeepSeek({
    baseURL: llmBaseUrl,
    apiKey: llmApiKey
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request) {
    const { messages } = await request.json();

    const result = streamText({
        model: dashscopeDeepseek(llmModel),
        messages,
        onError({ error }) {
            console.error('streamText error', error);
        },
    });

    return createDataStreamResponse({
        execute: dataStream => {
          result.mergeIntoDataStream(dataStream);
        },
        onError: error => {
          // Error messages are masked by default for security reasons.
          // If you want to expose the error message to the client, you can do so here:
          return error instanceof Error ? error.message : String(error);
        },
      });
}