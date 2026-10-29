/**
 * RoboVerse Original Component Vector Artworks (SVG renderers)
 * 100% original designs, clean styling, top-down perspective, high contrast pins
 */

export interface SvgRenderOptions {
  state?: Record<string, any>;
  showLabels?: boolean;
  highlightPinId?: string | null;
}

export const COMPONENT_SVG_RENDERERS: Record<string, (options?: SvgRenderOptions) => string> = {
  arduino_uno: () => `
    <g class="robo-arduino-uno">
      <!-- PCB Main Teal/Cyan Board -->
      <rect x="0" y="0" width="220" height="160" rx="10" fill="#00878F" stroke="#00656B" stroke-width="2" />
      <rect x="6" y="6" width="208" height="148" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      
      <!-- Mounting Holes -->
      <circle cx="16" cy="16" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="16" cy="144" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="170" cy="144" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="170" cy="30" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />

      <!-- USB Type-B Metal Port -->
      <rect x="-6" y="24" width="36" height="32" rx="4" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
      <rect x="-4" y="30" width="10" height="20" rx="2" fill="#475569" />

      <!-- DC Barrel Power Jack -->
      <rect x="-8" y="98" width="42" height="38" rx="3" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <circle cx="12" cy="117" r="6" fill="#64748B" />
      <circle cx="12" cy="117" r="2.5" fill="#CBD5E1" />

      <!-- ATmega328P DIP IC Chip -->
      <rect x="70" y="70" width="75" height="28" rx="3" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
      <circle cx="76" cy="84" r="3" fill="#0F172A" />
      <text x="86" y="88" fill="#94A3B8" font-size="8" font-family="monospace" font-weight="bold">ATMEGA328P</text>

      <!-- 16MHz Crystal Oscillator -->
      <rect x="42" y="66" width="18" height="10" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1" />
      <text x="44" y="74" fill="#64748B" font-size="6" font-family="monospace">16.0</text>

      <!-- Reset Button -->
      <rect x="18" y="70" width="16" height="16" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
      <circle cx="26" cy="78" r="4.5" fill="#EF4444" />

      <!-- Brand Silk Screen -->
      <text x="75" y="44" fill="#FFFFFF" font-size="14" font-weight="900" font-family="sans-serif">ROBO<tspan fill="#FFA94D">UNO</tspan></text>
      <text x="75" y="55" fill="rgba(255,255,255,0.7)" font-size="7" font-weight="600" font-family="sans-serif">R3 SIMULATION CORE</text>

      <!-- Digital Header Sockets (Top) -->
      <rect x="8" y="10" width="204" height="14" rx="2" fill="#1E293B" />
      
      <!-- Analog & Power Header Sockets (Bottom) -->
      <rect x="24" y="136" width="188" height="14" rx="2" fill="#1E293B" />
    </g>
  `,

  breadboard_small: () => `
    <g class="robo-breadboard">
      <rect x="0" y="0" width="260" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      
      <!-- Power Lines -->
      <line x1="10" y1="8" x2="250" y2="8" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
      <line x1="10" y1="26" x2="250" y2="26" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" />
      
      <line x1="10" y1="94" x2="250" y2="94" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
      <line x1="10" y1="112" x2="250" y2="112" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" />

      <!-- Central Divider Trench -->
      <rect x="8" y="56" width="244" height="8" rx="2" fill="#E2E8F0" />
      
      <!-- Brand Silk Text -->
      <text x="110" y="62" fill="#94A3B8" font-size="6" font-weight="bold" font-family="sans-serif">ROBOVERSE 400</text>
    </g>
  `,

  led_red: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#FF3333' : '#B91C1C';
    const filter = isLit ? 'filter="drop-shadow(0 0 10px #FF3333)"' : '';
    return `
      <g class="robo-led">
        <!-- Leads -->
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
        
        <!-- LED Bulb Dome -->
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#991B1B" stroke-width="1.5" ${filter} />
        
        <!-- Base Rim Collar -->
        <rect x="4" y="34" width="32" height="4" rx="1.5" fill="#991B1B" />
        
        <!-- Specular Highlight -->
        <ellipse cx="14" cy="18" rx="3" ry="5" fill="rgba(255,255,255,0.6)" transform="rotate(-20 14 18)" />
      </g>
    `;
  },

  resistor: () => `
    <g class="robo-resistor">
      <!-- Metal Wires -->
      <line x1="0" y1="12" x2="15" y2="12" stroke="#94A3B8" stroke-width="2" />
      <line x1="45" y1="12" x2="60" y2="12" stroke="#94A3B8" stroke-width="2" />
      
      <!-- Ceramic Body -->
      <rect x="14" y="5" width="32" height="14" rx="4" fill="#D4B886" stroke="#B89B6C" stroke-width="1" />
      
      <!-- Color Bands (220 Ohm = Red, Red, Brown, Gold) -->
      <rect x="18" y="5" width="3" height="14" fill="#EF4444" />
      <rect x="24" y="5" width="3" height="14" fill="#EF4444" />
      <rect x="30" y="5" width="3" height="14" fill="#78350F" />
      <rect x="38" y="5" width="3" height="14" fill="#F59E0B" />
    </g>
  `,

  pushbutton: () => `
    <g class="robo-pushbutton">
      <!-- Metallic Corner Pins -->
      <line x1="0" y1="10" x2="6" y2="10" stroke="#CBD5E1" stroke-width="3" />
      <line x1="38" y1="10" x2="44" y2="10" stroke="#CBD5E1" stroke-width="3" />
      <line x1="0" y1="34" x2="6" y2="34" stroke="#CBD5E1" stroke-width="3" />
      <line x1="38" y1="34" x2="44" y2="34" stroke="#CBD5E1" stroke-width="3" />
      
      <!-- Black Base Body -->
      <rect x="6" y="6" width="32" height="32" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
      
      <!-- Chrome Cap Rim -->
      <circle cx="22" cy="22" r="10" fill="#64748B" stroke="#94A3B8" stroke-width="1" />
      
      <!-- Button Plunger -->
      <circle cx="22" cy="22" r="7.5" fill="#0F172A" />
    </g>
  `,

  ultrasonic_sensor: () => `
    <g class="robo-ultrasonic">
      <!-- Blue PCB -->
      <rect x="0" y="0" width="90" height="50" rx="6" fill="#1D4ED8" stroke="#1E40AF" stroke-width="2" />
      
      <!-- Transducer Emitter (T) -->
      <circle cx="26" cy="22" r="15" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <circle cx="26" cy="22" r="10" fill="#CBD5E1" />
      <text x="23" y="25" fill="#475569" font-size="9" font-weight="bold">T</text>
      
      <!-- Transducer Receiver (R) -->
      <circle cx="64" cy="22" r="15" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <circle cx="64" cy="22" r="10" fill="#CBD5E1" />
      <text x="61" y="25" fill="#475569" font-size="9" font-weight="bold">R</text>

      <!-- Label -->
      <text x="32" y="44" fill="#FFFFFF" font-size="6" font-family="sans-serif" font-weight="bold">HC-SR04</text>
    </g>
  `,
};
