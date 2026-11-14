import {
  RITUU_BASE_SYSTEM_INSTRUCTION,
  MODE_INSTRUCTIONS,
  HINT_FIRST_INSTRUCTION,
  IMAGE_INSPECTION_INSTRUCTION,
  checkHeuristicOffTopic,
} from './rituuSentinel.ts';
import { RITUU_TOOL_DECLARATIONS } from './functionDeclarations.ts';

export interface StreamEvent {
  type: 'token' | 'tool_call' | 'done' | 'error';
  text?: string;
  toolCall?: { name: string; args: Record<string, any> };
  offTopic?: boolean;
  usage?: { inputTokens: number; outputTokens: number };
  error?: string;
}

export interface StreamChatParams {
  message: string;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  mode?: string;
  hintFirst?: boolean;
  imageBase64?: string;
  circuitContext?: string;
  robotContext?: string;
  onChunk: (event: StreamEvent) => void;
  signal?: AbortSignal;
}

export interface AIProvider {
  streamChat(params: StreamChatParams): Promise<void>;
}

/**
 * Official Google Gemini API Provider using @google/genai SDK
 */
export class GeminiAIProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName?: string) {
    this.apiKey = apiKey;
    this.modelName = modelName || 'gemini-3.8-flash';
  }

  async streamChat(params: StreamChatParams): Promise<void> {
    const {
      message,
      history = [],
      mode = 'auto',
      hintFirst = false,
      imageBase64,
      circuitContext,
      robotContext,
      onChunk,
      signal,
    } = params;

    // Fast heuristic off-topic check
    const heuristic = checkHeuristicOffTopic(message);
    if (heuristic.isOffTopic) {
      onChunk({
        type: 'token',
        text: `[OFFTOPIC]\nI'm here exclusively as your RoboVerse robotics mentor! Would you like to build an obstacle-avoiding rover, learn Arduino programming, or wire up a motor driver today?`,
      });
      onChunk({
        type: 'done',
        offTopic: true,
        usage: { inputTokens: 20, outputTokens: 35 },
      });
      return;
    }

    try {
      // Dynamic import of @google/genai for Deno / Edge Function environments
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      // Compose full system instructions
      let fullSystemInstruction = RITUU_BASE_SYSTEM_INSTRUCTION;
      if (mode && MODE_INSTRUCTIONS[mode]) {
        fullSystemInstruction += `\n\n${MODE_INSTRUCTIONS[mode]}`;
      }
      if (hintFirst) {
        fullSystemInstruction += `\n\n${HINT_FIRST_INSTRUCTION}`;
      }
      if (imageBase64) {
        fullSystemInstruction += `\n\n${IMAGE_INSPECTION_INSTRUCTION}`;
      }
      if (circuitContext) {
        fullSystemInstruction += `\n\n=== CURRENT 3D CIRCUIT LAB NETLIST CONTEXT ===\n${circuitContext}`;
      }
      if (robotContext) {
        fullSystemInstruction += `\n\n=== CURRENT ROBOT DESIGN CAD/PHYSICS CONTEXT ===\n${robotContext}`;
      }

      // Build conversation contents array
      const contents: any[] = [];

      for (const turn of history.slice(-12)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }

      // Latest user message parts
      const userParts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        userParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      userParts.push({ text: `<student_message>\n${message}\n</student_message>` });

      contents.push({
        role: 'user',
        parts: userParts,
      });

      // Format tools for Gemini API
      const tools = [
        {
          functionDeclarations: RITUU_TOOL_DECLARATIONS.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
        },
      ];

      const responseStream = await ai.models.generateContentStream({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.4,
          maxOutputTokens: 1500,
          tools,
        },
      });

      let accumulatedText = '';
      let isOffTopic = false;
      let firstChunk = true;

      for await (const chunk of responseStream) {
        if (signal?.aborted) break;

        const text = chunk.text;
        if (text) {
          accumulatedText += text;

          if (firstChunk) {
            firstChunk = false;
            if (accumulatedText.trim().startsWith('[OFFTOPIC]')) {
              isOffTopic = true;
            }
          }

          onChunk({ type: 'token', text });
        }

        // Check for function calls
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const call of chunk.functionCalls) {
            onChunk({
              type: 'tool_call',
              toolCall: {
                name: call.name,
                args: call.args || {},
              },
            });
          }
        }
      }

      onChunk({
        type: 'done',
        offTopic: isOffTopic || accumulatedText.trim().startsWith('[OFFTOPIC]'),
        usage: {
          inputTokens: Math.round(fullSystemInstruction.length / 4 + message.length / 4),
          outputTokens: Math.round(accumulatedText.length / 4),
        },
      });
    } catch (err: any) {
      onChunk({
        type: 'error',
        error: err?.message || 'Gemini API generation error',
      });
    }
  }
}

/**
 * High-fidelity Mock AI Provider for local development, CI tests, or missing API keys.
 */
export class MockAIProvider implements AIProvider {
  async streamChat(params: StreamChatParams): Promise<void> {
    const { message, onChunk, hintFirst, mode } = params;
    const lower = message.trim().toLowerCase();

    // Check off-topic heuristic
    const heuristic = checkHeuristicOffTopic(message);
    if (heuristic.isOffTopic) {
      onChunk({
        type: 'token',
        text: `[OFFTOPIC]\nI'm here exclusively as your RoboVerse robotics mentor! Would you like to build an obstacle-avoiding rover, learn Arduino programming, or wire up a motor driver today?`,
      });
      onChunk({
        type: 'done',
        offTopic: true,
        usage: { inputTokens: 25, outputTokens: 35 },
      });
      return;
    }

    // Safety checks for weapons / harmful devices
    if (/\b(weapon|bomb|explosive|emp device|shock someone|lethal)\b/i.test(lower)) {
      onChunk({
        type: 'token',
        text: `⚠️ **RoboVerse Safety Directive**: I cannot assist with building weapons, combat devices, or hazardous electronics. I am glad to help you engineer safe educational robotics projects like obstacle avoiders, automated robotic arms, or weather telemetry stations!`,
      });
      onChunk({
        type: 'done',
        offTopic: false,
        usage: { inputTokens: 25, outputTokens: 40 },
      });
      return;
    }

    let responseText = '';

    if (/^(hi|hello|hey|namaste)\b/i.test(lower)) {
      responseText = `Namaste! I'm **Rituu**, your RoboVerse robotics mentor. What project are we building today? You can ask me how to wire sensors, size DC motors, write Arduino code, or tune PID controllers!`;
    } else if (lower.includes('led') && (lower.includes('blink') || lower.includes('resistor') || lower.includes('light'))) {
      if (hintFirst) {
        responseText = `### 💡 Guiding Hint for LED Circuit:\nTo prevent burning out your LED, remember **Ohm's Law**: $V = I \\times R$.\nAn LED has forward voltage of ~2.0V and safe current of ~15mA.\nWhen connecting to an Arduino 5V pin, what resistor value would drop the remaining 3V?\n\n*Would you like me to show the complete wiring and sketch, or do you want to calculate the value first?*`;
      } else {
        responseText = `### 💡 Wiring an LED to Arduino Uno\n\nTo safely light up an LED without burning it out:\n\n1. **Connect Anode** (longer leg) to **Pin 13** through a **220Ω resistor**.\n2. **Connect Cathode** (shorter leg, flat edge) to **GND**.\n\n\`\`\`cpp\n// Target: Arduino Uno\nconst int LED_PIN = 13;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH); // Turn LED ON\n  delay(1000);                 // Wait 1 second\n  digitalWrite(LED_PIN, LOW);  // Turn LED OFF\n  delay(1000);                 // Wait 1 second\n}\n\`\`\`\n\n**Safety Note**: Always use a current-limiting resistor (220Ω to 330Ω) in series. Connecting directly to 5V will draw excessive current and destroy the LED.\n\n**Next Step**: Would you like to add a push-button to toggle the LED?`;
      }
    } else if (lower.includes('ultrasonic') || lower.includes('hcsr04') || lower.includes('radar')) {
      responseText = `### 📡 HC-SR04 Ultrasonic Sonar Wiring\n\n1. **VCC** $\\to$ Arduino **5V**\n2. **GND** $\\to$ Arduino **GND**\n3. **TRIG** $\\to$ Arduino **Pin 9**\n4. **ECHO** $\\to$ Arduino **Pin 8**\n\n\`\`\`cpp\n// Target: Arduino Uno\nconst int TRIG_PIN = 9;\nconst int ECHO_PIN = 8;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n}\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distanceCm = duration * 0.0343 / 2.0;\n\n  Serial.print("Distance: ");\n  Serial.print(distanceCm);\n  Serial.println(" cm");\n  delay(100);\n}\n\`\`\`\n\n**Next Step**: Shall we connect this distance sensor to an obstacle avoidance rover?`;
    } else if (lower.includes('motor') || lower.includes('l298n') || lower.includes('driver')) {
      responseText = `### 🏎️ Wiring L298N Dual Motor Driver\n\n1. **Power Supply**: Connect external battery (6V–12V) to **12V terminal** and battery negative to **GND**.\n2. **CRITICAL Common Ground**: Connect Arduino GND to L298N GND terminal!\n3. **Logic Control**: Connect **IN1 $\\to$ Pin 4**, **IN2 $\\to$ Pin 5** for Motor A direction.\n4. **Speed Control**: Connect **ENA $\\to$ Pin 3** (PWM capable pin).\n\n\`\`\`cpp\n// Target: Arduino Uno + L298N\nconst int ENA = 3, IN1 = 4, IN2 = 5;\n\nvoid setup() {\n  pinMode(ENA, OUTPUT);\n  pinMode(IN1, OUTPUT);\n  pinMode(IN2, OUTPUT);\n  // Drive forward at 75% speed\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, LOW);\n  analogWrite(ENA, 190);\n}\n\nvoid loop() {}\n\`\`\`\n\n**Next Step**: Do you want to configure differential turning for a 2WD robot?`;
    } else {
      responseText = `### 🤖 Robotics Engineering Advice\n\nRegarding your robotics question: **"${message}"**:\n\n1. **Hardware Verification**: Ensure common GND across all controllers, drivers, and sensors.\n2. **Power Budget**: Separate logic voltage (5V/3.3V) from inductive motor loads to avoid voltage dips.\n3. **Firmware Execution**: Check baud rates and non-blocking timers.\n\n**Next Step**: Would you like me to inspect your current breadboard wiring or generate test code for this module?`;
    }

    // Stream out words with realistic typing cadence
    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk({
        type: 'token',
        text: (i === 0 ? '' : ' ') + words[i],
      });
      // Small tick delay
      await new Promise((resolve) => setTimeout(resolve, 8));
    }

    onChunk({
      type: 'done',
      offTopic: false,
      usage: {
        inputTokens: Math.round(message.length / 4),
        outputTokens: Math.round(responseText.length / 4),
      },
    });
  }
}
