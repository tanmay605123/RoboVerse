/**
 * RoboVerse Original Component Vector Artworks (SVG renderers)
 * 100% original designs, clean styling, top-down perspective, high contrast pins
 * Covers all 70+ components in the RoboVerse hardware library.
 */

export interface SvgRenderOptions {
  state?: Record<string, any>;
  showLabels?: boolean;
  highlightPinId?: string | null;
}

export const COMPONENT_SVG_RENDERERS: Record<string, (options?: SvgRenderOptions) => string> = {
  // ==================== 1. MICROCONTROLLERS ====================
  arduino_uno: () => `
    <g class="robo-arduino-uno">
      <rect x="0" y="0" width="220" height="160" rx="10" fill="#00878F" stroke="#00656B" stroke-width="2" />
      <rect x="6" y="6" width="208" height="148" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <circle cx="16" cy="16" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="16" cy="144" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="170" cy="144" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <circle cx="170" cy="30" r="4.5" fill="#E8ECF2" stroke="#64748B" stroke-width="1.5" />
      <rect x="-6" y="24" width="36" height="32" rx="4" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
      <rect x="-8" y="98" width="42" height="38" rx="3" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <circle cx="12" cy="117" r="6" fill="#64748B" />
      <rect x="70" y="70" width="75" height="28" rx="3" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
      <text x="86" y="88" fill="#94A3B8" font-size="8" font-family="monospace" font-weight="bold">ATMEGA328P</text>
      <rect x="42" y="66" width="18" height="10" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1" />
      <rect x="18" y="70" width="16" height="16" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
      <circle cx="26" cy="78" r="4.5" fill="#EF4444" />
      <text x="75" y="44" fill="#FFFFFF" font-size="14" font-weight="900" font-family="sans-serif">ROBO<tspan fill="#39FF6A">UNO</tspan></text>
      <rect x="8" y="10" width="204" height="14" rx="2" fill="#1E293B" />
      <rect x="24" y="136" width="188" height="14" rx="2" fill="#1E293B" />
    </g>
  `,

  arduino_nano: () => `
    <g class="robo-arduino-nano">
      <rect x="0" y="0" width="140" height="70" rx="6" fill="#007090" stroke="#004D63" stroke-width="2" />
      <rect x="4" y="4" width="132" height="62" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <rect x="-4" y="20" width="24" height="30" rx="2" fill="#CBD5E1" stroke="#64748B" />
      <rect x="45" y="18" width="34" height="34" rx="3" fill="#1E293B" />
      <text x="49" y="38" fill="#94A3B8" font-size="6" font-family="monospace">MEGA328</text>
      <circle cx="95" cy="35" r="5" fill="#EF4444" stroke="#CBD5E1" />
      <text x="90" y="58" fill="#FFFFFF" font-size="8" font-weight="bold">NANO V3</text>
      <rect x="10" y="6" width="120" height="8" rx="2" fill="#0F172A" />
      <rect x="10" y="56" width="120" height="8" rx="2" fill="#0F172A" />
    </g>
  `,

  arduino_mega: () => `
    <g class="robo-arduino-mega">
      <rect x="0" y="0" width="300" height="160" rx="10" fill="#005D84" stroke="#00405C" stroke-width="2" />
      <rect x="-6" y="24" width="36" height="32" rx="4" fill="#CBD5E1" />
      <rect x="-8" y="98" width="42" height="38" rx="3" fill="#1E293B" />
      <rect x="75" y="60" width="50" height="50" rx="4" fill="#1E293B" />
      <text x="80" y="88" fill="#94A3B8" font-size="7" font-family="monospace">MEGA2560</text>
      <text x="145" y="50" fill="#FFFFFF" font-size="16" font-weight="900">ROBO<tspan fill="#39FF6A">MEGA</tspan></text>
      <rect x="8" y="10" width="280" height="14" rx="2" fill="#1E293B" />
      <rect x="24" y="136" width="260" height="14" rx="2" fill="#1E293B" />
    </g>
  `,

  esp32: () => `
    <g class="robo-esp32">
      <rect x="0" y="0" width="160" height="85" rx="6" fill="#111827" stroke="#374151" stroke-width="2" />
      <rect x="90" y="12" width="60" height="60" rx="4" fill="#94A3B8" stroke="#CBD5E1" />
      <text x="96" y="45" fill="#0F172A" font-size="8" font-weight="900" font-family="monospace">ESP-WROOM</text>
      <rect x="-4" y="28" width="20" height="28" rx="2" fill="#CBD5E1" />
      <text x="25" y="48" fill="#39FF6A" font-size="10" font-weight="900">ESP32</text>
      <rect x="10" y="8" width="140" height="10" rx="2" fill="#1F2937" />
      <rect x="10" y="67" width="140" height="10" rx="2" fill="#1F2937" />
    </g>
  `,

  rpi_pico: () => `
    <g class="robo-rpi-pico">
      <rect x="0" y="0" width="150" height="70" rx="6" fill="#008744" stroke="#005A2E" stroke-width="2" />
      <rect x="55" y="20" width="30" height="30" rx="3" fill="#1E293B" />
      <text x="59" y="38" fill="#94A3B8" font-size="6" font-family="monospace">RP2040</text>
      <rect x="-4" y="22" width="22" height="26" rx="2" fill="#CBD5E1" />
      <text x="95" y="42" fill="#FFFFFF" font-size="9" font-weight="bold">PICO</text>
      <rect x="10" y="6" width="130" height="8" rx="2" fill="#0A3F1F" />
      <rect x="10" y="56" width="130" height="8" rx="2" fill="#0A3F1F" />
    </g>
  `,

  microbit: () => `
    <g class="robo-microbit">
      <rect x="0" y="0" width="150" height="120" rx="14" fill="#18181B" stroke="#27272A" stroke-width="2" />
      <circle cx="25" cy="55" r="10" fill="#DC2626" />
      <text x="22" y="58" fill="#FFFFFF" font-size="10" font-weight="bold">A</text>
      <circle cx="125" cy="55" r="10" fill="#DC2626" />
      <text x="122" y="58" fill="#FFFFFF" font-size="10" font-weight="bold">B</text>
      <rect x="50" y="35" width="50" height="50" fill="#09090B" rx="4" />
      <g fill="#EF4444">
        <circle cx="58" cy="43" r="2.5"/><circle cx="66" cy="43" r="2.5"/><circle cx="74" cy="43" r="2.5"/><circle cx="82" cy="43" r="2.5"/><circle cx="90" cy="43" r="2.5"/>
        <circle cx="58" cy="51" r="2.5"/><circle cx="66" cy="51" r="2.5"/><circle cx="74" cy="51" r="2.5"/><circle cx="82" cy="51" r="2.5"/><circle cx="90" cy="51" r="2.5"/>
        <circle cx="58" cy="59" r="2.5"/><circle cx="66" cy="59" r="2.5"/><circle cx="74" cy="59" r="2.5"/><circle cx="82" cy="59" r="2.5"/><circle cx="90" cy="59" r="2.5"/>
        <circle cx="58" cy="67" r="2.5"/><circle cx="66" cy="67" r="2.5"/><circle cx="74" cy="67" r="2.5"/><circle cx="82" cy="67" r="2.5"/><circle cx="90" cy="67" r="2.5"/>
        <circle cx="58" cy="75" r="2.5"/><circle cx="66" cy="75" r="2.5"/><circle cx="74" cy="75" r="2.5"/><circle cx="82" cy="75" r="2.5"/><circle cx="90" cy="75" r="2.5"/>
      </g>
      <rect x="15" y="105" width="120" height="15" fill="#D4AF37" rx="2" />
    </g>
  `,

  // ==================== 2. PROTOTYPING & POWER ====================
  breadboard_small: () => `
    <g class="robo-breadboard">
      <rect x="0" y="0" width="260" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      <line x1="10" y1="8" x2="250" y2="8" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
      <line x1="10" y1="26" x2="250" y2="26" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" />
      <line x1="10" y1="94" x2="250" y2="94" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
      <line x1="10" y1="112" x2="250" y2="112" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" />
      <rect x="8" y="56" width="244" height="8" rx="2" fill="#E2E8F0" />
      <text x="110" y="62" fill="#94A3B8" font-size="6" font-weight="bold">ROBOVERSE 400</text>
    </g>
  `,

  breadboard_large: () => `
    <g class="robo-breadboard-large">
      <rect x="0" y="0" width="380" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      <line x1="10" y1="8" x2="370" y2="8" stroke="#EF4444" stroke-width="2" />
      <line x1="10" y1="26" x2="370" y2="26" stroke="#3B82F6" stroke-width="2" />
      <line x1="10" y1="94" x2="370" y2="94" stroke="#EF4444" stroke-width="2" />
      <line x1="10" y1="112" x2="370" y2="112" stroke="#3B82F6" stroke-width="2" />
      <rect x="8" y="56" width="364" height="8" rx="2" fill="#E2E8F0" />
      <text x="160" y="62" fill="#94A3B8" font-size="7" font-weight="bold">ROBOVERSE 830 TIE</text>
    </g>
  `,

  power_supply_module: () => `
    <g class="robo-mb102">
      <rect x="0" y="0" width="90" height="70" rx="5" fill="#1B2A1E" stroke="#2D4A32" stroke-width="2" />
      <rect x="8" y="10" width="18" height="24" rx="2" fill="#CBD5E1" />
      <rect x="8" y="40" width="20" height="20" rx="2" fill="#111827" />
      <circle cx="18" cy="50" r="5" fill="#EF4444" />
      <text x="35" y="38" fill="#39FF6A" font-size="8" font-weight="bold">MB102 5V/3.3V</text>
    </g>
  `,

  // ==================== 3. PASSIVES & SEMICONDUCTORS ====================
  resistor: () => `
    <g class="robo-resistor">
      <line x1="0" y1="12" x2="15" y2="12" stroke="#94A3B8" stroke-width="2" />
      <line x1="45" y1="12" x2="60" y2="12" stroke="#94A3B8" stroke-width="2" />
      <rect x="14" y="5" width="32" height="14" rx="4" fill="#D4B886" stroke="#B89B6C" stroke-width="1" />
      <rect x="18" y="5" width="3" height="14" fill="#EF4444" />
      <rect x="24" y="5" width="3" height="14" fill="#EF4444" />
      <rect x="30" y="5" width="3" height="14" fill="#78350F" />
      <rect x="38" y="5" width="3" height="14" fill="#F59E0B" />
    </g>
  `,

  potentiometer: () => `
    <g class="robo-potentiometer">
      <rect x="5" y="5" width="40" height="40" rx="6" fill="#1D4ED8" stroke="#1E40AF" stroke-width="2" />
      <circle cx="25" cy="25" r="15" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <line x1="25" y1="25" x2="25" y2="14" stroke="#0F172A" stroke-width="3" stroke-linecap="round" />
      <text x="18" y="40" fill="#FFFFFF" font-size="6" font-weight="bold">10K</text>
    </g>
  `,

  capacitor_ceramic: () => `
    <g class="robo-cap-ceramic">
      <line x1="10" y1="18" x2="10" y2="25" stroke="#94A3B8" stroke-width="2" />
      <line x1="25" y1="18" x2="25" y2="25" stroke="#94A3B8" stroke-width="2" />
      <circle cx="17.5" cy="12" r="10" fill="#D97706" stroke="#B45309" stroke-width="1.5" />
      <text x="12" y="14" fill="#FFFFFF" font-size="6" font-weight="bold">104</text>
    </g>
  `,

  capacitor_electrolytic: () => `
    <g class="robo-cap-electro">
      <circle cx="17.5" cy="17.5" r="14" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <path d="M 6 12 A 14 14 0 0 1 12 6 L 15 15 Z" fill="#94A3B8" />
      <text x="13" y="21" fill="#FFFFFF" font-size="7" font-weight="bold">100µ</text>
    </g>
  `,

  diode: () => `
    <g class="robo-diode">
      <line x1="0" y1="10" x2="12" y2="10" stroke="#94A3B8" stroke-width="2" />
      <line x1="38" y1="10" x2="50" y2="10" stroke="#94A3B8" stroke-width="2" />
      <rect x="12" y="4" width="26" height="12" rx="2" fill="#111827" />
      <rect x="32" y="4" width="4" height="12" fill="#E2E8F0" />
    </g>
  `,

  transistor: () => `
    <g class="robo-transistor">
      <path d="M 8 28 A 12 12 0 0 1 28 28 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
      <text x="11" y="24" fill="#94A3B8" font-size="5" font-family="monospace">2N2222</text>
      <line x1="10" y1="28" x2="10" y2="35" stroke="#94A3B8" stroke-width="2" />
      <line x1="18" y1="28" x2="18" y2="35" stroke="#94A3B8" stroke-width="2" />
      <line x1="26" y1="28" x2="26" y2="35" stroke="#94A3B8" stroke-width="2" />
    </g>
  `,

  transistor_tip120: () => `
    <g class="robo-tip120">
      <rect x="6" y="6" width="28" height="28" rx="2" fill="#1F2937" stroke="#111827" stroke-width="1.5" />
      <rect x="10" y="2" width="20" height="6" fill="#94A3B8" />
      <text x="9" y="22" fill="#E5E7EB" font-size="6" font-family="monospace">TIP120</text>
    </g>
  `,

  mosfet: () => `
    <g class="robo-mosfet">
      <rect x="6" y="6" width="28" height="28" rx="2" fill="#1F2937" stroke="#111827" stroke-width="1.5" />
      <rect x="10" y="2" width="20" height="6" fill="#CBD5E1" />
      <text x="7" y="22" fill="#E5E7EB" font-size="5.5" font-family="monospace">IRFZ44N</text>
    </g>
  `,

  pushbutton: () => `
    <g class="robo-pushbutton">
      <line x1="0" y1="10" x2="6" y2="10" stroke="#CBD5E1" stroke-width="3" />
      <line x1="34" y1="10" x2="40" y2="10" stroke="#CBD5E1" stroke-width="3" />
      <line x1="0" y1="30" x2="6" y2="30" stroke="#CBD5E1" stroke-width="3" />
      <line x1="34" y1="30" x2="40" y2="30" stroke="#CBD5E1" stroke-width="3" />
      <rect x="6" y="6" width="28" height="28" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
      <circle cx="20" cy="20" r="9" fill="#475569" stroke="#94A3B8" stroke-width="1" />
      <circle cx="20" cy="20" r="6.5" fill="#0F172A" />
    </g>
  `,

  slideswitch: () => `
    <g class="robo-slideswitch">
      <rect x="4" y="4" width="36" height="16" rx="3" fill="#94A3B8" stroke="#64748B" stroke-width="1.5" />
      <rect x="10" y="2" width="10" height="20" rx="2" fill="#0F172A" />
    </g>
  `,

  dip_switch: () => `
    <g class="robo-dip-switch">
      <rect x="4" y="4" width="42" height="32" rx="3" fill="#DC2626" stroke="#B91C1C" stroke-width="1.5" />
      <rect x="10" y="10" width="6" height="18" fill="#FFFFFF" rx="1" />
      <rect x="18" y="10" width="6" height="18" fill="#FFFFFF" rx="1" />
      <rect x="26" y="10" width="6" height="18" fill="#FFFFFF" rx="1" />
      <rect x="34" y="10" width="6" height="18" fill="#FFFFFF" rx="1" />
    </g>
  `,

  // ==================== 4. LEDS & DISPLAYS ====================
  led_red: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#FF3333' : '#B91C1C';
    const filter = isLit ? 'filter="drop-shadow(0 0 8px #FF3333)"' : '';
    return `
      <g class="robo-led">
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#991B1B" stroke-width="1.5" ${filter} />
        <rect x="4" y="34" width="32" height="4" rx="1.5" fill="#991B1B" />
        <ellipse cx="14" cy="18" rx="3" ry="5" fill="rgba(255,255,255,0.6)" transform="rotate(-20 14 18)" />
      </g>
    `;
  },

  led_green: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#39FF6A' : '#15803D';
    const filter = isLit ? 'filter="drop-shadow(0 0 8px #39FF6A)"' : '';
    return `
      <g class="robo-led">
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#166534" stroke-width="1.5" ${filter} />
        <rect x="4" y="34" width="32" height="4" rx="1.5" fill="#166534" />
      </g>
    `;
  },

  led_yellow: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#FDE047' : '#A16207';
    return `
      <g class="robo-led">
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#854D0E" stroke-width="1.5" />
      </g>
    `;
  },

  led_blue: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#38BDF8' : '#1D4ED8';
    return `
      <g class="robo-led">
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#1E40AF" stroke-width="1.5" />
      </g>
    `;
  },

  led_white: (opts) => {
    const isLit = opts?.state?.lit ?? false;
    const glowFill = isLit ? '#FFFFFF' : '#94A3B8';
    return `
      <g class="robo-led">
        <line x1="12" y1="36" x2="12" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <line x1="28" y1="36" x2="28" y2="55" stroke="#94A3B8" stroke-width="2.5" />
        <path d="M 6 36 L 6 22 A 14 14 0 0 1 34 22 L 34 36 Z" fill="${glowFill}" stroke="#64748B" stroke-width="1.5" />
      </g>
    `;
  },

  led_rgb: () => `
    <g class="robo-led-rgb">
      <line x1="10" y1="36" x2="10" y2="60" stroke="#EF4444" stroke-width="2" />
      <line x1="20" y1="36" x2="20" y2="60" stroke="#0F172A" stroke-width="2" />
      <line x1="30" y1="36" x2="30" y2="60" stroke="#3B82F6" stroke-width="2" />
      <line x1="40" y1="36" x2="40" y2="60" stroke="#10B981" stroke-width="2" />
      <path d="M 8 36 L 8 20 A 17 17 0 0 1 42 20 L 42 36 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" />
      <circle cx="25" cy="24" r="6" fill="#39FF6A" opacity="0.6" />
    </g>
  `,

  neopixel_strip: () => `
    <g class="robo-neopixel">
      <rect x="0" y="0" width="120" height="30" rx="3" fill="#0F172A" stroke="#334155" />
      ${[15, 28, 41, 54, 67, 80, 93, 106].map((cx) => `<rect x="${cx - 4}" y="11" width="8" height="8" rx="1.5" fill="#E2E8F0" stroke="#64748B"/><circle cx="${cx}" cy="15" r="2.5" fill="#39FF6A"/>`).join('')}
    </g>
  `,

  lcd_16x2: () => `
    <g class="robo-lcd">
      <rect x="0" y="0" width="180" height="70" rx="6" fill="#0284C7" stroke="#0369A1" stroke-width="2" />
      <rect x="25" y="14" width="130" height="42" rx="3" fill="#0C4A6E" />
      <rect x="30" y="18" width="120" height="34" rx="2" fill="#38BDF8" opacity="0.85" />
      <text x="35" y="32" fill="#082F49" font-family="monospace" font-size="8" font-weight="bold">RoboVerse Lab v2</text>
      <text x="35" y="44" fill="#082F49" font-family="monospace" font-size="8">16x2 I2C Display</text>
    </g>
  `,

  oled_096: () => `
    <g class="robo-oled">
      <rect x="0" y="0" width="70" height="70" rx="6" fill="#0F172A" stroke="#334155" stroke-width="2" />
      <rect x="8" y="16" width="54" height="46" rx="2" fill="#020617" />
      <text x="14" y="35" fill="#38BDF8" font-size="7" font-family="monospace" font-weight="bold">SSD1306</text>
      <text x="14" y="48" fill="#FFFFFF" font-size="6" font-family="monospace">128x64 OLED</text>
    </g>
  `,

  seven_segment: () => `
    <g class="robo-seven-seg">
      <rect x="0" y="0" width="60" height="80" rx="6" fill="#111827" stroke="#374151" stroke-width="2" />
      <text x="18" y="55" fill="#EF4444" font-size="46" font-family="monospace" font-weight="bold">8</text>
      <circle cx="48" cy="62" r="3" fill="#EF4444" />
    </g>
  `,

  tm1637_display: () => `
    <g class="robo-tm1637">
      <rect x="0" y="0" width="120" height="50" rx="5" fill="#1E293B" stroke="#0F172A" />
      <text x="15" y="36" fill="#EF4444" font-size="28" font-family="monospace" font-weight="bold">12:34</text>
    </g>
  `,

  // ==================== 5. ACTUATORS & MOTORS ====================
  buzzer: () => `
    <g class="robo-buzzer">
      <circle cx="22" cy="22" r="18" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <circle cx="22" cy="22" r="6" fill="#0F172A" />
      <text x="17" y="14" fill="#E2E8F0" font-size="8" font-weight="bold">+</text>
    </g>
  `,

  servo_sg90: () => `
    <g class="robo-servo">
      <rect x="8" y="12" width="44" height="50" rx="4" fill="#0A84FF" stroke="#0066CC" stroke-width="1.5" />
      <circle cx="30" cy="24" r="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
      <rect x="27" y="6" width="6" height="24" rx="2" fill="#FFFFFF" />
      <text x="14" y="52" fill="#FFFFFF" font-size="8" font-weight="900">SG90</text>
    </g>
  `,

  servo_mg90s: () => `
    <g class="robo-servo-mg90s">
      <rect x="8" y="12" width="44" height="50" rx="4" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
      <circle cx="30" cy="24" r="12" fill="#D4AF37" stroke="#B8860B" stroke-width="1.5" />
      <text x="12" y="52" fill="#FACC15" font-size="7" font-weight="bold">MG90S</text>
    </g>
  `,

  servo_mg996r: () => `
    <g class="robo-servo-mg996r">
      <rect x="8" y="10" width="64" height="70" rx="5" fill="#0F172A" stroke="#1E293B" stroke-width="2" />
      <circle cx="40" cy="30" r="16" fill="#D4AF37" />
      <text x="18" y="65" fill="#EF4444" font-size="9" font-weight="bold">MG996R</text>
    </g>
  `,

  dc_gearmotor: () => `
    <g class="robo-dc-gearmotor">
      <rect x="10" y="8" width="55" height="34" rx="4" fill="#EAB308" stroke="#CA8A04" stroke-width="2" />
      <rect x="65" y="14" width="35" height="22" rx="2" fill="#94A3B8" stroke="#64748B" />
      <circle cx="37" cy="25" r="7" fill="#FFFFFF" />
      <rect x="34" y="22" width="6" height="6" fill="#0F172A" />
      <text x="16" y="38" fill="#713F12" font-size="6" font-weight="bold">1:48</text>
    </g>
  `,

  dc_motor_toy: () => `
    <g class="robo-dc-toy">
      <rect x="10" y="8" width="40" height="24" rx="3" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
      <rect x="50" y="17" width="8" height="6" fill="#64748B" />
    </g>
  `,

  l298n: () => `
    <g class="robo-l298n">
      <rect x="0" y="0" width="110" height="110" rx="8" fill="#B91C1C" stroke="#991B1B" stroke-width="2" />
      <rect x="25" y="20" width="60" height="30" rx="3" fill="#1E293B" />
      <rect x="30" y="8" width="50" height="16" fill="#475569" />
      <text x="36" y="40" fill="#FFFFFF" font-size="10" font-weight="bold">L298N</text>
      <rect x="8" y="82" width="22" height="18" fill="#059669" rx="2" />
      <rect x="80" y="82" width="22" height="18" fill="#059669" rx="2" />
    </g>
  `,

  l293d: () => `
    <g class="robo-l293d">
      <rect x="4" y="4" width="62" height="26" rx="3" fill="#111827" stroke="#374151" stroke-width="1.5" />
      <circle cx="8" cy="17" r="3" fill="#374151" />
      <text x="18" y="20" fill="#9CA3AF" font-size="8" font-family="monospace" font-weight="bold">L293D</text>
    </g>
  `,

  stepper_motor: () => `
    <g class="robo-stepper-28byj">
      <circle cx="45" cy="35" r="28" fill="#0284C7" stroke="#0369A1" stroke-width="2" />
      <circle cx="45" cy="35" r="12" fill="#D4AF37" />
      <text x="25" y="38" fill="#FFFFFF" font-size="7" font-weight="bold">28BYJ-48</text>
    </g>
  `,

  stepper_nema17: () => `
    <g class="robo-nema17">
      <rect x="6" y="6" width="68" height="68" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2" />
      <circle cx="40" cy="40" r="18" fill="#CBD5E1" stroke="#64748B" />
      <circle cx="40" cy="40" r="5" fill="#475569" />
      <text x="18" y="22" fill="#94A3B8" font-size="7" font-weight="bold">NEMA 17</text>
    </g>
  `,

  bldc_motor: () => `
    <g class="robo-bldc">
      <circle cx="32" cy="32" r="26" fill="#EAB308" stroke="#CA8A04" stroke-width="2" />
      <circle cx="32" cy="32" r="16" fill="#1E293B" />
      <circle cx="32" cy="32" r="4" fill="#E2E8F0" />
      <text x="18" y="35" fill="#FFFFFF" font-size="6" font-weight="bold">1000KV</text>
    </g>
  `,

  esc_module: () => `
    <g class="robo-esc">
      <rect x="4" y="4" width="72" height="36" rx="4" fill="#0F172A" stroke="#1E293B" stroke-width="1.5" />
      <text x="18" y="25" fill="#39FF6A" font-size="10" font-weight="900">ESC 30A</text>
    </g>
  `,

  propeller: () => `
    <g class="robo-propeller">
      <ellipse cx="70" cy="17" rx="65" ry="8" fill="#EF4444" opacity="0.9" />
      <circle cx="70" cy="17" r="7" fill="#0F172A" />
    </g>
  `,

  relay_1ch: () => `
    <g class="robo-relay-1ch">
      <rect x="0" y="0" width="70" height="50" rx="5" fill="#1D4ED8" stroke="#1E40AF" stroke-width="1.5" />
      <rect x="16" y="8" width="38" height="34" rx="3" fill="#2563EB" />
      <text x="22" y="28" fill="#FFFFFF" font-size="7" font-weight="bold">SONGLE</text>
      <text x="22" y="36" fill="#93C5FD" font-size="6">5V RELAY</text>
    </g>
  `,

  relay_2ch: () => `
    <g class="robo-relay-2ch">
      <rect x="0" y="0" width="85" height="70" rx="5" fill="#1E40AF" stroke="#1D4ED8" stroke-width="1.5" />
      <rect x="25" y="8" width="34" height="25" rx="2" fill="#2563EB" />
      <rect x="25" y="38" width="34" height="25" rx="2" fill="#2563EB" />
    </g>
  `,

  // ==================== 6. SENSORS ====================
  ultrasonic: () => `
    <g class="robo-ultrasonic">
      <rect x="0" y="0" width="90" height="50" rx="6" fill="#1D4ED8" stroke="#1E40AF" stroke-width="2" />
      <circle cx="26" cy="22" r="15" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <circle cx="64" cy="22" r="15" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <text x="32" y="44" fill="#FFFFFF" font-size="6" font-family="sans-serif" font-weight="bold">HC-SR04</text>
    </g>
  `,

  ir_obstacle: () => `
    <g class="robo-ir-obs">
      <rect x="0" y="0" width="60" height="40" rx="4" fill="#047857" stroke="#065F46" />
      <circle cx="15" cy="12" r="5" fill="#111827" />
      <circle cx="15" cy="26" r="5" fill="#38BDF8" />
      <text x="25" y="22" fill="#FFFFFF" font-size="6">IR SENSOR</text>
    </g>
  `,

  ir_line_tracker: () => `
    <g class="robo-line-tracker">
      <rect x="0" y="0" width="140" height="40" rx="4" fill="#111827" stroke="#374151" />
      ${[20, 45, 70, 95, 120].map((x) => `<circle cx="${x}" cy="18" r="4" fill="#38BDF8"/>`).join('')}
      <text x="45" y="34" fill="#39FF6A" font-size="6" font-weight="bold">5-CH TRACKER</text>
    </g>
  `,

  pir_sensor: () => `
    <g class="robo-pir">
      <rect x="6" y="6" width="58" height="52" rx="4" fill="#065F46" stroke="#047857" />
      <circle cx="35" cy="32" r="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
      <text x="22" y="52" fill="#047857" font-size="6" font-weight="bold">HC-SR501</text>
    </g>
  `,

  dht11: () => `
    <g class="robo-dht11">
      <rect x="6" y="6" width="38" height="48" rx="4" fill="#0284C7" stroke="#0369A1" stroke-width="2" />
      <rect x="12" y="12" width="26" height="24" fill="#0369A1" rx="2" />
      <text x="14" y="44" fill="#FFFFFF" font-size="6" font-weight="bold">DHT11</text>
    </g>
  `,

  dht22: () => `
    <g class="robo-dht22">
      <rect x="6" y="6" width="38" height="52" rx="4" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2" />
      <rect x="12" y="12" width="26" height="28" fill="#E2E8F0" rx="2" />
      <text x="14" y="48" fill="#334155" font-size="6" font-weight="bold">DHT22</text>
    </g>
  `,

  ldr: () => `
    <g class="robo-ldr">
      <circle cx="17.5" cy="17.5" r="12" fill="#EA580C" stroke="#C2410C" stroke-width="1.5" />
      <path d="M 10 14 Q 17.5 10 25 14 Q 17.5 18 10 21 Q 17.5 25 25 21" stroke="#FFFFFF" fill="none" stroke-width="1.5" />
    </g>
  `,

  mpu6050: () => `
    <g class="robo-mpu6050">
      <rect x="0" y="0" width="60" height="50" rx="4" fill="#1E3A8A" stroke="#1E40AF" stroke-width="1.5" />
      <rect x="18" y="12" width="24" height="24" rx="2" fill="#111827" />
      <text x="14" y="44" fill="#93C5FD" font-size="6" font-family="monospace">MPU6050</text>
    </g>
  `,

  mq2_gas: () => `
    <g class="robo-mq2">
      <rect x="0" y="0" width="70" height="60" rx="4" fill="#047857" stroke="#065F46" />
      <circle cx="35" cy="30" r="16" fill="#94A3B8" stroke="#CBD5E1" stroke-width="2" />
      <text x="24" y="55" fill="#FFFFFF" font-size="6" font-weight="bold">MQ-2 GAS</text>
    </g>
  `,

  flame_sensor: () => `
    <g class="robo-flame">
      <rect x="0" y="0" width="60" height="40" rx="4" fill="#064E3B" />
      <circle cx="15" cy="20" r="6" fill="#111827" stroke="#EF4444" />
      <text x="24" y="24" fill="#FFFFFF" font-size="6">FLAME</text>
    </g>
  `,

  soil_sensor: () => `
    <g class="robo-soil">
      <rect x="10" y="8" width="30" height="25" rx="3" fill="#166534" />
      <rect x="12" y="33" width="8" height="48" fill="#D4AF37" rx="2" />
      <rect x="30" y="33" width="8" height="48" fill="#D4AF37" rx="2" />
    </g>
  `,

  tilt_sensor: () => `
    <g class="robo-tilt">
      <rect x="10" y="8" width="25" height="18" rx="9" fill="#D97706" stroke="#B45309" />
      <circle cx="22" cy="17" r="4" fill="#FACC15" />
    </g>
  `,

  flex_sensor: () => `
    <g class="robo-flex">
      <rect x="6" y="8" width="18" height="100" rx="3" fill="#334155" stroke="#1E293B" />
      <line x1="15" y1="15" x2="15" y2="95" stroke="#94A3B8" stroke-dasharray="3,3" stroke-width="2" />
    </g>
  `,

  gps_neo6m: () => `
    <g class="robo-gps">
      <rect x="0" y="0" width="70" height="60" rx="5" fill="#065F46" />
      <rect x="15" y="10" width="40" height="36" rx="3" fill="#E2E8F0" stroke="#94A3B8" />
      <circle cx="35" cy="28" r="4" fill="#B91C1C" />
      <text x="22" y="54" fill="#FFFFFF" font-size="6" font-weight="bold">NEO-6M</text>
    </g>
  `,

  // ==================== 7. POWER SOURCES ====================
  battery_9v: () => `
    <g class="robo-battery-9v">
      <rect x="8" y="15" width="44" height="68" rx="4" fill="#B45309" stroke="#78350F" stroke-width="2" />
      <circle cx="20" cy="10" r="5" fill="#CBD5E1" stroke="#64748B" />
      <circle cx="40" cy="10" r="4" fill="#94A3B8" stroke="#64748B" />
      <text x="18" y="55" fill="#FEF08A" font-size="12" font-weight="900">9V</text>
    </g>
  `,

  battery_aa_pack: () => `
    <g class="robo-battery-aa">
      <rect x="6" y="6" width="68" height="58" rx="4" fill="#111827" stroke="#374151" stroke-width="2" />
      <rect x="12" y="10" width="12" height="50" rx="2" fill="#D97706" />
      <rect x="26" y="10" width="12" height="50" rx="2" fill="#D97706" />
      <rect x="40" y="10" width="12" height="50" rx="2" fill="#D97706" />
      <rect x="54" y="10" width="12" height="50" rx="2" fill="#D97706" />
      <text x="24" y="40" fill="#FFFFFF" font-size="8" font-weight="bold">6V (4xAA)</text>
    </g>
  `,

  battery_cr2032: () => `
    <g class="robo-cr2032">
      <circle cx="22" cy="22" r="16" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2" />
      <text x="12" y="24" fill="#475569" font-size="6" font-weight="bold">CR2032</text>
    </g>
  `,

  battery_lipo: () => `
    <g class="robo-lipo">
      <rect x="6" y="6" width="98" height="38" rx="4" fill="#0369A1" stroke="#0284C7" stroke-width="2" />
      <text x="22" y="28" fill="#FFFFFF" font-size="10" font-weight="900">11.1V 3S LiPo</text>
    </g>
  `,

  // ==================== 8. MECHANICAL ====================
  chassis_2wd: () => `
    <g class="robo-chassis-2wd">
      <rect x="10" y="10" width="140" height="120" rx="15" fill="#0284C7" opacity="0.8" stroke="#0369A1" stroke-width="2" />
      <circle cx="80" cy="25" r="10" fill="#64748B" />
      <rect x="4" y="60" width="14" height="45" rx="3" fill="#0F172A" />
      <rect x="142" y="60" width="14" height="45" rx="3" fill="#0F172A" />
      <text x="45" y="80" fill="#FFFFFF" font-size="10" font-weight="900">2WD CHASSIS</text>
    </g>
  `,

  chassis_4wd: () => `
    <g class="robo-chassis-4wd">
      <rect x="10" y="10" width="160" height="140" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2" />
      <rect x="4" y="20" width="14" height="45" rx="3" fill="#0F172A" />
      <rect x="162" y="20" width="14" height="45" rx="3" fill="#0F172A" />
      <rect x="4" y="90" width="14" height="45" rx="3" fill="#0F172A" />
      <rect x="162" y="90" width="14" height="45" rx="3" fill="#0F172A" />
      <text x="55" y="85" fill="#39FF6A" font-size="12" font-weight="900">4WD ROVER</text>
    </g>
  `,

  robot_gripper: () => `
    <g class="robo-gripper">
      <rect x="25" y="35" width="40" height="35" rx="4" fill="#059669" stroke="#047857" stroke-width="2" />
      <path d="M 25 35 Q 10 15 15 5 L 22 5 Q 20 20 32 35 Z" fill="#047857" />
      <path d="M 65 35 Q 80 15 75 5 L 68 5 Q 70 20 58 35 Z" fill="#047857" />
      <circle cx="45" cy="52" r="8" fill="#1E293B" />
    </g>
  `,
};

// ==================== CANONICAL REGISTRY MAPPINGS (Exact 1:1 IDs) ====================
COMPONENT_SVG_RENDERERS['resistor_220'] = () => `
  <g class="robo-resistor-220">
    <line x1="0" y1="12" x2="14" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <line x1="46" y1="12" x2="60" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <rect x="14" y="5" width="32" height="14" rx="4" fill="#E2D4B7" stroke="#C5B28B" stroke-width="1.2" />
    <rect x="20" y="5" width="3" height="14" fill="#DC2626" />
    <rect x="25" y="5" width="3" height="14" fill="#DC2626" />
    <rect x="30" y="5" width="3" height="14" fill="#78350F" />
    <rect x="37" y="5" width="3" height="14" fill="#EAB308" />
  </g>
`;

COMPONENT_SVG_RENDERERS['resistor_1k'] = () => `
  <g class="robo-resistor-1k">
    <line x1="0" y1="12" x2="14" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <line x1="46" y1="12" x2="60" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <rect x="14" y="5" width="32" height="14" rx="4" fill="#E2D4B7" stroke="#C5B28B" stroke-width="1.2" />
    <rect x="20" y="5" width="3" height="14" fill="#78350F" />
    <rect x="25" y="5" width="3" height="14" fill="#111827" />
    <rect x="30" y="5" width="3" height="14" fill="#DC2626" />
    <rect x="37" y="5" width="3" height="14" fill="#EAB308" />
  </g>
`;

COMPONENT_SVG_RENDERERS['resistor_10k'] = () => `
  <g class="robo-resistor-10k">
    <line x1="0" y1="12" x2="14" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <line x1="46" y1="12" x2="60" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <rect x="14" y="5" width="32" height="14" rx="4" fill="#E2D4B7" stroke="#C5B28B" stroke-width="1.2" />
    <rect x="20" y="5" width="3" height="14" fill="#78350F" />
    <rect x="25" y="5" width="3" height="14" fill="#111827" />
    <rect x="30" y="5" width="3" height="14" fill="#EA580C" />
    <rect x="37" y="5" width="3" height="14" fill="#EAB308" />
  </g>
`;

COMPONENT_SVG_RENDERERS['resistor_4k7'] = () => `
  <g class="robo-resistor-4k7">
    <line x1="0" y1="12" x2="14" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <line x1="46" y1="12" x2="60" y2="12" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
    <rect x="14" y="5" width="32" height="14" rx="4" fill="#E2D4B7" stroke="#C5B28B" stroke-width="1.2" />
    <rect x="20" y="5" width="3" height="14" fill="#FACC15" />
    <rect x="25" y="5" width="3" height="14" fill="#7C3AED" />
    <rect x="30" y="5" width="3" height="14" fill="#DC2626" />
    <rect x="37" y="5" width="3" height="14" fill="#EAB308" />
  </g>
`;

COMPONENT_SVG_RENDERERS['diode_1n4007'] = COMPONENT_SVG_RENDERERS['diode'];
COMPONENT_SVG_RENDERERS['transistor_2n2222'] = COMPONENT_SVG_RENDERERS['transistor'];
COMPONENT_SVG_RENDERERS['mosfet_irfz44n'] = COMPONENT_SVG_RENDERERS['mosfet'];
COMPONENT_SVG_RENDERERS['dip_switch_4'] = COMPONENT_SVG_RENDERERS['dip_switch'];
COMPONENT_SVG_RENDERERS['led_strip_ws2812'] = COMPONENT_SVG_RENDERERS['neopixel_strip'];
COMPONENT_SVG_RENDERERS['lcd_16x2_i2c'] = COMPONENT_SVG_RENDERERS['lcd_16x2'];
COMPONENT_SVG_RENDERERS['oled_096_i2c'] = COMPONENT_SVG_RENDERERS['oled_096'];
COMPONENT_SVG_RENDERERS['seven_segment_1digit'] = COMPONENT_SVG_RENDERERS['seven_segment'];
COMPONENT_SVG_RENDERERS['seven_segment_4digit'] = COMPONENT_SVG_RENDERERS['tm1637_display'];
COMPONENT_SVG_RENDERERS['buzzer_active'] = COMPONENT_SVG_RENDERERS['buzzer'];
COMPONENT_SVG_RENDERERS['buzzer_piezo'] = COMPONENT_SVG_RENDERERS['buzzer'];
COMPONENT_SVG_RENDERERS['dc_motor_gear'] = COMPONENT_SVG_RENDERERS['dc_gearmotor'];
COMPONENT_SVG_RENDERERS['motor_driver_l298n'] = COMPONENT_SVG_RENDERERS['l298n'];
COMPONENT_SVG_RENDERERS['motor_driver_l293d'] = COMPONENT_SVG_RENDERERS['l293d'];
COMPONENT_SVG_RENDERERS['stepper_28byj48'] = COMPONENT_SVG_RENDERERS['stepper_motor'];
COMPONENT_SVG_RENDERERS['bldc_2212'] = COMPONENT_SVG_RENDERERS['bldc_motor'];
COMPONENT_SVG_RENDERERS['esc_30a'] = COMPONENT_SVG_RENDERERS['esc_module'];
COMPONENT_SVG_RENDERERS['propeller_1045'] = COMPONENT_SVG_RENDERERS['propeller'];
COMPONENT_SVG_RENDERERS['ultrasonic_hcsr04'] = COMPONENT_SVG_RENDERERS['ultrasonic'];
COMPONENT_SVG_RENDERERS['ir_line_array_5ch'] = COMPONENT_SVG_RENDERERS['ir_line_tracker'];
COMPONENT_SVG_RENDERERS['pir_motion'] = COMPONENT_SVG_RENDERERS['pir_sensor'];
COMPONENT_SVG_RENDERERS['ldr_photoresistor'] = COMPONENT_SVG_RENDERERS['ldr'];
COMPONENT_SVG_RENDERERS['soil_moisture'] = COMPONENT_SVG_RENDERERS['soil_sensor'];
COMPONENT_SVG_RENDERERS['battery_aa_pack_4'] = COMPONENT_SVG_RENDERERS['battery_aa_pack'];
COMPONENT_SVG_RENDERERS['battery_lipo_3s'] = COMPONENT_SVG_RENDERERS['battery_lipo'];

export function getComponentSvg(componentId: string, options?: SvgRenderOptions): string {
  const renderer = COMPONENT_SVG_RENDERERS[componentId];
  if (renderer) return renderer(options);
  return `<rect x="0" y="0" width="40" height="40" rx="4" fill="#1E293B" stroke="#39FF6A" stroke-width="1.5"/>`;
}
