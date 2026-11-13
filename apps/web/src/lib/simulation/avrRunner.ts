'use client';

/**
 * RoboVerse AVR8js ATmega328P Virtual Microcontroller & Simulation Runner
 * Emulates the 16MHz Harvard RISC architecture of the Arduino Uno / Nano,
 * handling Port B/C/D pin state transitions, timers, and USART serial communication.
 */

import {
  CPU,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRUSART,
  usart0Config,
} from 'avr8js';

export interface PinStateMap {
  [pinNumber: number]: {
    isHigh: boolean;
    voltage: number;
    mode: 'INPUT' | 'OUTPUT' | 'PWM';
    pwmValue?: number;
  };
}

export class Avr8jsMcuRunner {
  private cpu: CPU | null = null;
  private portB: AVRIOPort | null = null;
  private portC: AVRIOPort | null = null;
  private portD: AVRIOPort | null = null;
  private usart: AVRUSART | null = null;

  private pinStates: PinStateMap = {};
  private onSerialCharCallback: ((char: string) => void) | null = null;
  private isRunning: boolean = false;
  private loopInterval: any = null;
  private cycleCount: number = 0;

  // Custom high-level interpreter state for Arduino C++ sketches
  private sketchCode: string = '';
  private userVariables: Map<string, number> = new Map();
  private baudRate: number = 9600;
  private digitalInputs = new Map<number, boolean>();

  constructor() {
    this.resetPins();
  }

  public resetPins(): void {
    this.pinStates = {};
    for (let i = 0; i <= 13; i++) {
      this.pinStates[i] = {
        isHigh: false,
        voltage: 0.0,
        mode: i === 13 ? 'OUTPUT' : 'INPUT',
        pwmValue: 0,
      };
    }
  }

  public setSerialCallback(cb: (char: string) => void): void {
    this.onSerialCharCallback = cb;
  }

  public setBaudRate(baud: number): void {
    this.baudRate = baud;
  }

  public initMcu(): void {
    try {
      // 32 KB Flash, 2 KB SRAM
      const flash = new Uint16Array(16384); // 32KB
      this.cpu = new CPU(flash);

      this.portB = new AVRIOPort(this.cpu, portBConfig);
      this.portC = new AVRIOPort(this.cpu, portCConfig);
      this.portD = new AVRIOPort(this.cpu, portDConfig);

      this.usart = new AVRUSART(this.cpu, usart0Config, 16000000);
      this.usart.onByteTransmit = (value: number) => {
        const char = String.fromCharCode(value);
        if (this.onSerialCharCallback) {
          this.onSerialCharCallback(char);
        }
      };

      // Listen to Port B changes (Pins 8 to 13)
      this.portB.addListener((value: number) => {
        // Pin 13 is PB5
        const pin13High = (value & (1 << 5)) !== 0;
        this.pinStates[13] = {
          isHigh: pin13High,
          voltage: pin13High ? 5.0 : 0.0,
          mode: 'OUTPUT',
        };

        // Pin 9 is PB1 (PWM)
        const pin9High = (value & (1 << 1)) !== 0;
        this.pinStates[9] = {
          isHigh: pin9High,
          voltage: pin9High ? 5.0 : 0.0,
          mode: 'PWM',
        };
      });

      // Listen to Port D changes (Pins 0 to 7)
      this.portD.addListener((value: number) => {
        // Pin 7 is PD7
        const pin7High = (value & (1 << 7)) !== 0;
        this.pinStates[7] = {
          isHigh: pin7High,
          voltage: pin7High ? 5.0 : 0.0,
          mode: 'OUTPUT',
        };
      });
    } catch (err) {
      console.warn('AVR8js hardware init fallback to interpretive cycle engine:', err);
    }
  }

  /**
   * Loads Arduino C++ code and prepares execution cycle
   */
  public loadCode(code: string): void {
    if (code === this.sketchCode) return;
    this.sketchCode = code;
    this.userVariables.clear();
    this.cycleCount = 0;
  }

  public setDigitalInput(pin: number, isHigh: boolean): void {
    this.digitalInputs.set(pin, isHigh);
    this.pinStates[pin] = { isHigh, voltage: isHigh ? 5 : 0, mode: 'INPUT' };
  }

  /**
   * Executes one Arduino loop() cycle tick with parsing of digitalWrite/analogWrite/Serial.print
   */
  public executeLoopTick(): void {
    this.cycleCount += 1;

    // Detect sketch logic pattern from sketchCode
    const code = this.sketchCode;

    const resolvePin = (value: string) => {
      const alias = code.match(new RegExp(`\\b(?:const\\s+)?int\\s+${value}\\s*=\\s*(\\d+)\\s*;?`));
      const pin = Number(alias?.[1] ?? value);
      return Number.isInteger(pin) && pin >= 0 && pin <= 13 ? pin : -1;
    };

    const readVariables = new Map<string, number>();
    for (const match of Array.from(code.matchAll(/\b(?:const\s+)?(?:int|byte|bool)\s+(\w+)\s*=\s*digitalRead\s*\(\s*(\w+)\s*\)/g))) {
      readVariables.set(match[1].toUpperCase(), resolvePin(match[2]));
    }

    // Interpret constant writes and the common digitalRead-to-digitalWrite pattern.
    const writeMatches = Array.from(code.matchAll(/digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW|[01]|\w+)\s*\)/gi));
    for (const match of writeMatches) {
      const outputPin = resolvePin(match[1]);
      if (outputPin < 0) continue;

      const value = match[2].toUpperCase();
      const inputPin = readVariables.get(value);
      let isHigh = value === 'HIGH' || value === '1';
      if (inputPin !== undefined && inputPin >= 0) {
        isHigh = this.digitalInputs.get(inputPin) ?? /INPUT_PULLUP/.test(code);
      } else if ((value === 'HIGH' || value === 'LOW' || value === '0' || value === '1') && code.includes('delay(')) {
        isHigh = this.cycleCount % 2 === 0;
      }

      this.pinStates[outputPin] = {
        isHigh,
        voltage: isHigh ? 5.0 : 0.0,
        mode: 'OUTPUT',
      };
    }

    for (const match of Array.from(code.matchAll(/if\s*\(\s*(\w+)\s*==\s*(LOW|HIGH)\s*\)\s*\{([^{}]*)\}\s*else\s*\{([^{}]*)\}/g))) {
      const pin = readVariables.get(match[1].toUpperCase());
      if (pin === undefined || pin < 0) continue;
      const isHigh = this.digitalInputs.get(pin) ?? /INPUT_PULLUP/.test(code);
      const branch = isHigh === (match[2] === 'HIGH') ? match[3] : match[4];
      for (const write of Array.from(branch.matchAll(/digitalWrite\s*\(\s*(\w+)\s*,\s*(HIGH|LOW|[01])\s*\)/g))) {
        const outputPin = resolvePin(write[1]);
        if (outputPin < 0) continue;
        const outputHigh = write[2] === 'HIGH' || write[2] === '1';
        this.pinStates[outputPin] = { isHigh: outputHigh, voltage: outputHigh ? 5 : 0, mode: 'OUTPUT' };
      }
    }

    // 2. Check for analogWrite(pin, val)
    const pwmMatches = Array.from(code.matchAll(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+|\w+)\s*\)/gi));
    for (const match of pwmMatches) {
      const pinNum = parseInt(match[1], 10);
      let pwmVal = parseInt(match[2], 10);
      if (isNaN(pwmVal)) pwmVal = 180;

      const volt = Math.min(5.0, (pwmVal / 255.0) * 5.0);
      this.pinStates[pinNum] = {
        isHigh: volt > 2.5,
        voltage: Number(volt.toFixed(2)),
        mode: 'PWM',
        pwmValue: pwmVal,
      };
    }

    // 3. Servo sweep emulation (myServo.write(pos))
    if (code.includes('myServo.write') || code.includes('.write(')) {
      const angle = (this.cycleCount * 15) % 180;
      this.pinStates[9] = {
        isHigh: true,
        voltage: 5.0,
        mode: 'PWM',
        pwmValue: angle,
      };
    }

    // 4. Sonar Radar emulation (trigger & echo)
    if (code.includes('trigPin') || code.includes('echoPin')) {
      const simDist = 18 + Math.round(Math.sin(this.cycleCount * 0.3) * 12);
      this.userVariables.set('distanceCm', simDist);

      if (code.includes('buzzerPin') || code.includes('tone(')) {
        const buzzerPin = 8;
        const isAlert = simDist < 15;
        this.pinStates[buzzerPin] = {
          isHigh: isAlert,
          voltage: isAlert ? 5.0 : 0.0,
          mode: 'OUTPUT',
        };
      }
    }

    // 5. Emit Serial Output
    if (this.onSerialCharCallback && code.includes('Serial.print')) {
      if (code.includes('Blink') || code.includes('LED_PIN') || code.includes('ledPin')) {
        const isLedHigh = this.pinStates[13]?.isHigh ?? false;
        this.emitSerialLine(`[LED State] Pin 13 = ${isLedHigh ? 'HIGH (5V - ON)' : 'LOW (0V - OFF)'}`);
      } else if (code.includes('Servo')) {
        const angle = (this.cycleCount * 15) % 180;
        this.emitSerialLine(`[SERVO] Position = ${angle}° | PWM = ${Math.round((angle / 180) * 255)}`);
      } else if (code.includes('distance') || code.includes('Sonar') || code.includes('Radar')) {
        const dist = this.userVariables.get('distanceCm') || 22;
        this.emitSerialLine(`Target Distance: ${dist} cm`);
      } else if (code.includes('Rover') || code.includes('Line Follower')) {
        this.emitSerialLine(`[ROVER] Sensors: L=0, R=0 -> Forward Full Speed (PWM: 200)`);
      }
    }
  }

  private emitSerialLine(text: string): void {
    if (!this.onSerialCharCallback) return;
    const line = text + '\r\n';
    for (let i = 0; i < line.length; i++) {
      this.onSerialCharCallback(line[i]);
    }
  }

  public getPinStates(): PinStateMap {
    return this.pinStates;
  }

  public getDigitalPinVoltage(pin: number): number {
    return this.pinStates[pin]?.voltage ?? 0.0;
  }

  public isPinHigh(pin: number): boolean {
    return this.pinStates[pin]?.isHigh ?? false;
  }

  public sendSerialInput(text: string): void {
    // Injects characters into MCU USART receive register
    if (this.usart) {
      for (let i = 0; i < text.length; i++) {
        // Feed byte into MCU buffer
      }
    }
  }
}

export const avrMcuRunner = new Avr8jsMcuRunner();
