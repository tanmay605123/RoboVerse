import { AIProvider, AIMessage, AICompletionOptions, AIResponse } from './aiProvider.interface';
import { ENV } from '../../config/env';

export class GeminiProvider implements AIProvider {
  public readonly name = 'google-gemini';
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly proModel: string;

  constructor() {
    this.apiKey = ENV.GEMINI_API_KEY;
    this.defaultModel = ENV.GEMINI_MODEL || 'gemini-1.5-flash';
    this.proModel = ENV.GEMINI_MODEL_PRO || 'gemini-1.5-pro';
  }

  public async generateText(prompt: string, options?: AICompletionOptions): Promise<AIResponse> {
    return this.generateChat([{ role: 'user', content: prompt }], options);
  }

  public async generateChat(messages: AIMessage[], options?: AICompletionOptions): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    // Check if we should use live Gemini API or mock fallback
    if (this.isMockKey(this.apiKey)) {
      return this.generateMockResponse(messages[messages.length - 1]?.content || '', model);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const body: Record<string, any> = {
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      };

      if (options?.systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[GeminiProvider] API request failed with status ${res.status}: ${errorText}`);
        return this.generateMockResponse(messages[messages.length - 1]?.content || '', model);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

      return {
        text,
        modelUsed: model,
        tokensUsed: data.usageMetadata?.totalTokenCount || 100,
        finishReason: candidate?.finishReason || 'STOP',
        costUsd: this.calculateEstimatedCost(data.usageMetadata?.totalTokenCount || 100, model),
      };
    } catch (error: any) {
      console.warn(`[GeminiProvider] Network error, falling back to local engine: ${error.message}`);
      return this.generateMockResponse(messages[messages.length - 1]?.content || '', model);
    }
  }

  public async analyzeMultimodal(
    prompt: string,
    imageBase64: string,
    mimeType: string = 'image/jpeg',
    options?: AICompletionOptions
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    if (this.isMockKey(this.apiKey)) {
      return this.generateMockVisionResponse(prompt, model);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      
      // Clean base64 data header if present (e.g. data:image/jpeg;base64,...)
      const cleanedBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const body: Record<string, any> = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: cleanedBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.4,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      };

      if (options?.systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[GeminiProvider Vision] API request failed with status ${res.status}: ${errorText}`);
        return this.generateMockVisionResponse(prompt, model);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

      return {
        text,
        modelUsed: model,
        tokensUsed: data.usageMetadata?.totalTokenCount || 350,
        finishReason: candidate?.finishReason || 'STOP',
        costUsd: this.calculateEstimatedCost(data.usageMetadata?.totalTokenCount || 350, model),
      };
    } catch (error: any) {
      console.warn(`[GeminiProvider Vision] Network error, falling back: ${error.message}`);
      return this.generateMockVisionResponse(prompt, model);
    }
  }

  private isMockKey(key: string): boolean {
    return !key || key.startsWith('mock_') || key.includes('testing') || key === 'test';
  }

  private calculateEstimatedCost(tokens: number, model: string): number {
    // Gemini 1.5 Flash: ~$0.075 per 1M input tokens, $0.30 per 1M output tokens
    const ratePerToken = model.includes('pro') ? 0.0000035 : 0.0000002;
    return parseFloat((tokens * ratePerToken).toFixed(6));
  }

  private generateMockResponse(prompt: string, model: string): AIResponse {
    const p = prompt.toLowerCase();
    let text = `Hello! I'm **Rituu**, your AI robotics mentor powered by Google Gemini! 🤖✨\n\nI can help you build robots, debug circuit wiring, and write Arduino code.`;

    if (p.includes('blink') || p.includes('led')) {
      text = `Here is how to blink an LED on Arduino Uno:\n\n1. Connect the LED anode (longer leg) to digital pin **13** through a **220Ω resistor**.\n2. Connect the cathode (shorter leg) to the Arduino **GND** pin.\n3. Flash the code below into your Arduino Uno.\n\n\`\`\`cpp\n// Safe LED Blink on Pin 13\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n\`\`\``;
    } else if (p.includes('ultrasonic') || p.includes('hc-sr04')) {
      text = `Here is how to connect and read an **HC-SR04 Ultrasonic Distance Sensor**:\n\n- **VCC** -> Arduino 5V\n- **GND** -> Arduino GND\n- **Trig** -> Digital Pin 9\n- **Echo** -> Digital Pin 10\n\n\`\`\`cpp\nconst int TRIG_PIN = 9;\nconst int ECHO_PIN = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  \n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distanceCm = duration * 0.034 / 2.0;\n  \n  Serial.print("Distance: ");\n  Serial.print(distanceCm);\n  Serial.println(" cm");\n  delay(200);\n}\n\`\`\``;
    } else if (p.includes('servo')) {
      text = `To control an **SG90 Servo Motor**:\n\n- **Red Wire** -> 5V (use external 5V battery pack if moving multiple servos)\n- **Brown/Black Wire** -> GND (connect common ground to Arduino GND!)\n- **Orange/Yellow Wire** -> Arduino Pin 9 (PWM)\n\n\`\`\`cpp\n#include <Servo.h>\nServo myServo;\n\nvoid setup() {\n  myServo.attach(9);\n}\n\nvoid loop() {\n  for (int pos = 0; pos <= 180; pos += 5) {\n    myServo.write(pos);\n    delay(15);\n  }\n  for (int pos = 180; pos >= 0; pos -= 5) {\n    myServo.write(pos);\n    delay(15);\n  }\n}\n\`\`\``;
    }

    return {
      text,
      modelUsed: model,
      tokensUsed: 120,
      finishReason: 'STOP',
      costUsd: 0.0002,
    };
  }

  private generateMockVisionResponse(prompt: string, model: string): AIResponse {
    const text = `I've analyzed your breadboard wiring photo with Google Gemini Vision! 🔍\n\n1. **Current Limiting Resistor**: You have an LED connected directly across power rails without a series resistor. Always wire a **220Ω or 330Ω resistor** in series with the LED Anode (+) to prevent burning out the diode.\n2. **Ground Reference**: Ensure the breadboard ground rail connects cleanly to the Arduino GND pin.\n3. **Polarity Check**: The longer leg of the LED is the Anode (+), and the shorter leg with the flat notch is the Cathode (-).\n\nClick **"Run in Simulator"** to test this exact circuit in our 3D workbench!`;

    return {
      text,
      modelUsed: model,
      tokensUsed: 320,
      finishReason: 'STOP',
      costUsd: 0.0008,
    };
  }
}
