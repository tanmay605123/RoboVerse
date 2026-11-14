export interface AIMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface AICompletionOptions {
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResponse {
  text: string;
  modelUsed: string;
  tokensUsed?: number;
  finishReason?: string;
  costUsd?: number;
}

export interface AIProvider {
  readonly name: string;
  generateText(prompt: string, options?: AICompletionOptions): Promise<AIResponse>;
  generateChat(messages: AIMessage[], options?: AICompletionOptions): Promise<AIResponse>;
  analyzeMultimodal(
    prompt: string,
    imageBase64: string,
    mimeType?: string,
    options?: AICompletionOptions
  ): Promise<AIResponse>;
}
