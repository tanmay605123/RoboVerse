import { AIProvider, AIMessage, AICompletionOptions, AIResponse } from './aiProvider.interface';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock-provider';

  public async generateText(prompt: string, options?: AICompletionOptions): Promise<AIResponse> {
    return {
      text: `[MockAIProvider] Response for prompt: "${prompt.slice(0, 50)}..."`,
      modelUsed: options?.model || 'mock-v1',
      tokensUsed: 42,
      finishReason: 'STOP',
      costUsd: 0,
    };
  }

  public async generateChat(messages: AIMessage[], options?: AICompletionOptions): Promise<AIResponse> {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return {
      text: `[MockAIProvider] Response for message: "${lastMsg.slice(0, 50)}..."`,
      modelUsed: options?.model || 'mock-v1',
      tokensUsed: 42,
      finishReason: 'STOP',
      costUsd: 0,
    };
  }

  public async analyzeMultimodal(
    prompt: string,
    imageBase64: string,
    mimeType?: string,
    options?: AICompletionOptions
  ): Promise<AIResponse> {
    return {
      text: `[MockAIProvider Vision] Analyzed image with prompt: "${prompt}"`,
      modelUsed: options?.model || 'mock-vision-v1',
      tokensUsed: 60,
      finishReason: 'STOP',
      costUsd: 0,
    };
  }
}
