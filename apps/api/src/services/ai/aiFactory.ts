import { AIProvider } from './aiProvider.interface';
import { GeminiProvider } from './geminiProvider';
import { MockAIProvider } from './mockProvider';

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();
  private static activeProviderName: string = 'google-gemini';

  static {
    const gemini = new GeminiProvider();
    const mock = new MockAIProvider();
    this.providers.set(gemini.name, gemini);
    this.providers.set(mock.name, mock);
  }

  /**
   * Register a custom or third-party AI provider
   */
  public static registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Set active AI provider (e.g. 'google-gemini', 'mock-provider', etc.)
   */
  public static setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`AI Provider "${name}" is not registered.`);
    }
    this.activeProviderName = name;
  }

  /**
   * Get active AI provider or request specific provider by name
   */
  public static getProvider(name?: string): AIProvider {
    const targetName = name || this.activeProviderName;
    const provider = this.providers.get(targetName);
    if (!provider) {
      // Fallback to GeminiProvider if not found
      return this.providers.get('google-gemini') || new GeminiProvider();
    }
    return provider;
  }
}

export const getAIProvider = (name?: string) => AIProviderFactory.getProvider(name);
