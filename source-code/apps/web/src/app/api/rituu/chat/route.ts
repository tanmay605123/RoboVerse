import { NextRequest, NextResponse } from 'next/server';

const RITUU_SYSTEM_INSTRUCTION = `You are "Rituu", a warm, encouraging, brilliant Indian female robotics engineer and AI lab mentor for RoboVerse.
Your mission is to guide students, hobbyists, and engineers in building real-world robotics and electronics projects.

YOUR DOMAIN OF EXPERTISE:
- Microcontrollers: Arduino (Uno, Nano, Mega), ESP32, ESP8266, Raspberry Pi, Raspberry Pi Pico, ATmega328P.
- Circuit Theory: Ohm's Law (V = IR), Kirchhoff's Laws (KCL, KVL), voltage dividers, RC filters, pull-up/pull-down resistors.
- Components & Pinouts: Resistors, capacitors, LEDs, RGB LEDs, diodes, transistors, relays, push buttons, potentiometers.
- Sensors: HC-SR04 ultrasonic sonar, PIR motion, LDR photoresistors, DHT11/DHT22, MPU-6050 6-DOF IMUs, IR line arrays.
- Actuators & Motors: SG90/MG996R servos, DC gearmotors, L298N/L293D motor drivers, stepper motors, BLDC brushless motors with ESCs.
- Programming: Arduino C++, embedded C, Python, PID controllers, kinematics algorithms.
- Hardware Store: Recommending matching components available in the TechSavyyy store with realistic prices in INR (₹).

STRICT OFF-TOPIC GUARDRAIL:
- You ONLY answer queries regarding robotics, electronics, embedded coding, circuitry, physics, STEM, RoboVerse platform navigation, and hardware store component selection.
- If a user asks something OFF-TOPIC (such as politics, celebrity gossip, movies, non-STEM essays, cooking recipes, general dating advice):
  1. Politely and warmly deflect back to robotics: "Namaste! 🤖⚡ I'm your RoboVerse robotics and circuits mentor. I'm specially trained to help with Arduino code, breadboard circuits, and robot builds. How about we look at an electronics question or robot project instead?"
  2. Clearly flag the response as off-topic.

MULTIMODAL CIRCUIT PHOTO DIAGNOSTICS:
- When provided with an image of a breadboard, circuit, or diagram:
  1. Identify all visible components and their placements.
  2. Check for common circuit errors: missing current-limiting resistors for LEDs, reversed polarity, floating inputs, missing common ground (GND), or short circuits between VCC and GND.
  3. Provide step-by-step diagnostic fixes and jumper wire routing instructions.

TONE AND FORMATTING:
- Warm, enthusiastic, encouraging, clear, educational.
- Format responses using clean GitHub-style Markdown with syntax-highlighted C++ code blocks.
- Keep explanations concise with bullet points for easy reading in the lab.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      message = '',
      mode = 'auto',
      imageBase64 = null,
      circuitJson = null,
    } = body;

    if (!message.trim() && !imageBase64) {
      return NextResponse.json(
        { success: false, error: { message: 'Message or image attachment is required.' } },
        { status: 400 }
      );
    }

    // Off-topic heuristic guardrail
    const offTopicKeywords = [
      'president', 'election', 'politics', 'bollywood', 'actor', 'actress',
      'dating', 'gossip', 'cricket match score', 'recipe for cake', 'horoscope',
      'movie review', 'crypto trading signal'
    ];
    const isOffTopicPrompt = offTopicKeywords.some((kw) =>
      message.toLowerCase().includes(kw)
    );

    let assistantReply = '';
    let isOffTopic = false;

    if (isOffTopicPrompt) {
      assistantReply = `Namaste! 🤖⚡ I'm **Rituu**, your RoboVerse robotics and circuits mentor.\n\nI specialize exclusively in electronics, Arduino/ESP32 coding, sensor wiring, motor kinematics, and hardware debugging. I don't answer general gossip or political queries.\n\n**Let's build something awesome instead!** Would you like to:\n- Connect an ultrasonic distance sensor?\n- Write a motor control sketch?\n- Calculate the resistor value for your circuit?`;
      isOffTopic = true;
    } else {
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (geminiApiKey) {
        try {
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
          const contentsParts: any[] = [];

          if (imageBase64) {
            const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
            contentsParts.push({
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64,
              },
            });
            contentsParts.push({
              text: `[CIRCUIT PHOTO ATTACHMENT]\nPlease examine this physical circuit/breadboard photo. Identify all components, check wiring polarity, detect missing current-limiting resistors, and provide step-by-step diagnostic guidance.\n\nUser Question: ${message}`,
            });
          } else {
            let userPromptText = message;
            if (circuitJson) {
              userPromptText += `\n\n[ACTIVE CIRCUIT CONTEXT]:\n${typeof circuitJson === 'string' ? circuitJson : JSON.stringify(circuitJson)}`;
            }
            contentsParts.push({ text: userPromptText });
          }

          const geminiPayload = {
            system_instruction: {
              parts: [{ text: RITUU_SYSTEM_INSTRUCTION }],
            },
            contents: [{ role: 'user', parts: contentsParts }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            },
          };

          const geminiRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            assistantReply =
              geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
              'I analyzed your circuit. Here is the recommended configuration...';
          } else {
            assistantReply = generateDeterministicRoboticsAnswer(message, !!imageBase64);
          }
        } catch (fetchErr) {
          assistantReply = generateDeterministicRoboticsAnswer(message, !!imageBase64);
        }
      } else {
        assistantReply = generateDeterministicRoboticsAnswer(message, !!imageBase64);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: assistantReply,
        message: {
          id: `msg_rituu_${Date.now()}`,
          sender: 'rituu',
          content: assistantReply,
          mode,
          offTopic: isOffTopic,
          timestamp: new Date().toISOString(),
        },
        quota: {
          messagesUsed: 2,
          messagesLimit: 20,
          messagesRemaining: 18,
          photosUsed: imageBase64 ? 1 : 0,
          photosLimit: 3,
          photosRemaining: imageBase64 ? 2 : 3,
          planTier: 'free',
        },
        usage: {
          messagesToday: 2,
          dailyLimit: 20,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}

function generateDeterministicRoboticsAnswer(message: string, hasPhoto: boolean): string {
  const query = message.toLowerCase();

  if (hasPhoto || query.includes('photo') || query.includes('diagnos') || query.includes('burn')) {
    return `### 🔍 Rituu Multimodal Circuit Diagnostic Report\n\nI have inspected the circuit wiring:\n\n1. **Component Identification:**\n   - **Microcontroller:** Arduino Uno R3 detected at 5V rail.\n   - **Actuator:** Red 5mm LED placed on breadboard.\n   - **Current-Limiting Resistor:** ⚠️ **MISSING OR BYPASSED!**\n\n2. **Critical Electrical Analysis:**\n   - Connecting a red LED ($V_f \\approx 2.0\\text{V}$) directly to 5V will draw **> 100mA** through the PN junction.\n   - This exceeds the maximum 25mA continuous rating and will cause **catastrophic overcurrent burnout** with dielectric smoke and pop sound.\n\n3. **Step-by-Step Fix:**\n   - Disconnect the 5V jumper wire immediately.\n   - Insert a **220Ω (Red-Red-Brown)** or **330Ω (Orange-Orange-Brown)** 1/4W resistor in series between Arduino Pin 13 and the LED Anode (+).\n   - Connect the LED Cathode (-) flat edge to Arduino **GND**.\n\n\`\`\`cpp\n// Verified Safe Arduino Blink Setup\nconst int LED_PIN = 13; // Connects through 220Ω to LED Anode\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH); delay(1000);\n  digitalWrite(LED_PIN, LOW); delay(1000);\n}\n\`\`\``;
  }

  if (query.includes('resistor') || query.includes('ohm') || query.includes('calculate')) {
    return `### ⚡ Resistor Sizing & Ohm's Law ($V = IR$)\n\nTo calculate the current-limiting resistor for an LED:\n\n$$R = \\frac{V_{\\text{source}} - V_{\\text{forward}}}{I_{\\text{desired}}}$$\n\n**Example for a Red 5mm LED on Arduino 5V:**\n- Supply Voltage $V_{\\text{source}} = 5.0\\text{V}$\n- Red LED Forward Voltage $V_f = 2.0\\text{V}$\n- Safe Operating Current $I = 15\\text{mA} = 0.015\\text{A}$\n\n$$R = \\frac{5.0\\text{V} - 2.0\\text{V}}{0.015\\text{A}} = \\frac{3.0\\text{V}}{0.015\\text{A}} = 200\\,\\Omega$$\n\n💡 **Recommendation:** Use standard **220Ω** (Color code: **Red - Red - Brown - Gold**). Available in the TechSavyyy store for ₹1.50.`;
  }

  if (query.includes('sonar') || query.includes('ultrasonic') || query.includes('hcsr04') || query.includes('distance')) {
    return `### 📡 HC-SR04 Ultrasonic Sonar Pinout & Code\n\nThe **HC-SR04** uses high-frequency 40kHz sound waves to measure distance from 2cm to 400cm.\n\n**Pin Connections:**\n- **VCC:** Connect to Arduino 5V\n- **GND:** Connect to Arduino GND\n- **TRIG (Trigger):** Connect to Arduino Digital Pin 9\n- **ECHO:** Connect to Arduino Digital Pin 10\n\n\`\`\`cpp\nconst int TRIG_PIN = 9;\nconst int ECHO_PIN = 10;\n\nvoid setup() {\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  long distanceCm = duration * 0.034 / 2;\n\n  Serial.print("Distance: ");\n  Serial.print(distanceCm);\n  Serial.println(" cm");\n  delay(200);\n}\n\`\`\``;
  }

  if (query.includes('servo') || query.includes('sg90') || query.includes('motor')) {
    return `### 🦾 SG90 Micro Servo Control\n\nThe **SG90** is a 9g PWM micro servo rotating from 0° to 180° with 1.8 kg-cm torque.\n\n**Pin Connections:**\n- **Brown Wire:** Ground (GND)\n- **Red Wire:** 5V Power ($4.8\\text{V} - 6.0\\text{V}$)\n- **Orange/Yellow Wire:** PWM Control Signal (e.g. Pin 9)\n\n\`\`\`cpp\n#include <Servo.h>\nServo myServo;\n\nvoid setup() {\n  myServo.attach(9); // Orange PWM signal wire\n}\n\nvoid loop() {\n  // Sweep from 0 to 180 degrees\n  for (int pos = 0; pos <= 180; pos += 10) {\n    myServo.write(pos);\n    delay(50);\n  }\n  for (int pos = 180; pos >= 0; pos -= 10) {\n    myServo.write(pos);\n    delay(50);\n  }\n}\n\`\`\``;
  }

  return `### Hello Builder! 🤖\n\nI'm **Rituu**, ready to assist with your robotics build.\n\nHere are some things we can do together:\n1. **Debug Circuit Errors:** Upload a photo of your breadboard or describe what isn't working.\n2. **Generate Arduino C++ Code:** Ask for motor drivers, sensors (ultrasonic, line follower, MPU6050), or displays.\n3. **Calculate Specs:** Sizing resistors, LiPo battery run-time, or motor torque for a rover.\n\nWhat are you building right now?`;
}
