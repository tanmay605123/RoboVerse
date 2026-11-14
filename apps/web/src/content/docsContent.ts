export interface DocsSection {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  componentRows?: Array<{ component: string; use: string; access: string }>;
}

export const docsPlanRows = [
  { plan: 'Explorer Free', price: 'Free Forever', projects: '5', rituu: '20 questions / day', certificates: 'Not included' },
  { plan: 'Plus Maker', price: '₹299 / month or ₹2,499 / year', projects: 'Unlimited', rituu: '200 questions / day', certificates: 'Included' },
  { plan: 'Pro Innovator', price: '₹599 / month or ₹4,999 / year', projects: 'Unlimited', rituu: 'Unlimited', certificates: 'Included' },
  { plan: 'Institution Lab', price: '₹2,499 / month or ₹19,999 / year', projects: 'Unlimited', rituu: 'Unlimited', certificates: 'Included' },
];

export const docsSections: DocsSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    eyebrow: '01 / FIRST BOOT',
    summary: 'RoboVerse is a hands-on robotics workspace: Learn it. Build it. Simulate it.',
    paragraphs: [
      'Create a free account to save projects, follow guided lessons, ask Rituu questions, and receive a verifiable student ID. You can explore the public learning pages without signing in.',
      'The quick tour is organised around Classes, Circuit Lab, Robot Design Lab, Challenges, Rituu AI, Events, Shops, and the TechSavyyy Store. Start with a guided lesson, then open the workbench when you are ready to build.',
    ],
    steps: [
      'Open Circuit Lab and choose a starter circuit or a blank canvas.',
      'Place an Arduino Uno, an LED, and a 220Ω resistor from the component palette.',
      'Wire 5V to the resistor, the resistor to the LED anode, and the LED cathode to GND.',
      'Run the simulation, inspect the live readings, and correct any wiring warnings.',
      'Save the project with a clear name so you can return to it or share it later.',
    ],
  },
  {
    id: 'learning-paths',
    title: 'Learning Paths and Challenges',
    eyebrow: '02 / LEVEL UP',
    summary: 'Move from fundamentals to real robot systems through lessons, projects, and timed challenges.',
    paragraphs: [
      'Learning paths group lessons into a useful sequence. Your progress is tracked as you complete lessons and milestones, so you can pause and return without losing your place.',
      'Challenges are practical briefs with a target outcome, difficulty, and XP reward. The New section highlights recently published missions such as rover sensing, PID control, and smart lighting.',
    ],
    bullets: ['Rookie: circuits, components, and safe wiring.', 'Builder: sensors, motors, and structured code.', 'Engineer: control systems, debugging, and integration.', 'Innovator: open-ended robotics and capstone builds.'],
  },
  {
    id: 'circuit-simulator',
    title: '3D Circuit Designer and Simulator',
    eyebrow: '03 / BUILD LAB',
    summary: 'Design, wire, test, and share circuits in an interactive 3D workspace.',
    paragraphs: [
      'Drag parts from the palette onto the canvas, select a component to edit its properties, and use the wire tool to connect compatible pins. The schematic and 3D views help you understand both the electrical and physical layout.',
      'Run a simulation to see voltage, current, sensor, and serial readings. Save frequently; private projects and advanced tools depend on your plan. Use the project share action when you want a teammate or mentor to inspect your build.',
    ],
    componentRows: [
      { component: 'Arduino Uno R3', use: 'Microcontroller and digital/analog I/O', access: 'Free' },
      { component: 'LEDs and resistors', use: 'Indicators and current limiting', access: 'Free' },
      { component: 'Pushbutton and potentiometer', use: 'Inputs and adjustable signals', access: 'Free' },
      { component: 'HC-SR04 and LDR', use: 'Distance and light sensing', access: 'Free' },
      { component: 'Servo, DC motor, and L298N', use: 'Motion and motor control', access: 'Free / plan dependent' },
      { component: 'OLED, MPU6050, and Raspberry Pi', use: 'Displays, IMU, and advanced builds', access: 'Plan dependent' },
    ],
  },
  {
    id: 'rituu-ai',
    title: 'Rituu AI',
    eyebrow: '04 / MENTOR LINK',
    summary: 'Rituu is RoboVerse’s robotics and electronics mentor, focused on practical engineering help.',
    paragraphs: [
      'Rituu answers questions about circuits, embedded code, sensors, control systems, robotics, simulation, and debugging. It stays within that scope so answers remain useful and safe for the lab.',
      'Daily text and photo limits depend on your plan. If Rituu stops replying, check the usage meter and try again after the daily reset or review the plans page for a higher allowance.',
    ],
    bullets: ['Include the board, voltage, component values, and what you expected to happen.', 'Paste the smallest code sample that reproduces the issue.', 'Ask for one concrete outcome, such as “help me diagnose this LED not turning on.”'],
    steps: ['Why does my Arduino LED stay off when the pin is HIGH?', 'How should I debounce a pushbutton on an Uno?', 'Help me tune PID values for a two-wheel line follower.'],
  },
  {
    id: 'events-hackathons',
    title: 'Events and Hackathons',
    eyebrow: '05 / FIELD OPS',
    summary: 'Find robotics events, follow deadlines, and build teams around shared missions.',
    paragraphs: ['Events and Hackathons surfaces upcoming competitions, workshops, and local opportunities. Open an event to review its brief, eligibility, schedule, and submission requirements. Follow events you care about so they remain easy to find while you prepare.'],
  },
  {
    id: 'shops-store',
    title: 'Nearby Shops and TechSavyyy Store',
    eyebrow: '06 / HARDWARE',
    summary: 'Plan a build with local parts or order kits from the TechSavyyy Store.',
    paragraphs: ['Nearby Shops uses your city to show maker shops and electronics suppliers around you. Use the details view to check the address, hours, and available categories before travelling.', 'The TechSavyyy Store supports cart checkout, coupons, UPI or Razorpay payment flows, order status, and invoices. Shipping, delivery estimates, and return eligibility are shown with the relevant order or product. Keep the order number and contact support if a parcel is damaged or delayed.'],
  },
  {
    id: 'community',
    title: 'Community',
    eyebrow: '07 / SQUAD LINK',
    summary: 'Learn in public, share experiments, and help other builders make progress.',
    paragraphs: ['Ask specific, constructive questions and include enough context for someone else to reproduce the issue. Share what you tried, what changed, and any error message or measurement you observed.'],
    bullets: ['Be kind and assume good intent.', 'Do not share passwords, private keys, or another person’s personal information.', 'Credit original designs and label assumptions, simulations, and real-world test results.', 'Report harassment, unsafe instructions, spam, or copied work to the RoboVerse team.'],
  },
  {
    id: 'certificates',
    title: 'Certificates',
    eyebrow: '08 / VERIFIED OUTPUT',
    summary: 'Turn completed learning milestones into a certificate you can download and share.',
    paragraphs: ['Eligible courses and guided projects show certificate requirements in their progress view. Finish the required lessons or milestones, submit any requested work, and wait for grading or verification where applicable.', 'When issued, open Certificates from the sidebar to view, download, or share the verification link. A verifier can use the public verification page to check the certificate code and student ID.'],
  },
  {
    id: 'plans-pricing',
    title: 'Plans and Pricing',
    eyebrow: '09 / ACCESS TIERS',
    summary: 'Compare current access, quotas, project limits, and store benefits before upgrading.',
    paragraphs: ['Prices and limits below are read from RoboVerse’s shared plan configuration so this guide stays aligned with the Plans & Pricing page. Billing options and taxes are shown at checkout.'],
  },
  {
    id: 'contact',
    title: 'Contact',
    eyebrow: '10 / SUPPORT CHANNEL',
    summary: 'Need a human? The Help Center is the fastest route to the RoboVerse team.',
    paragraphs: ['For account, billing, simulator, store, or community questions, open the Help Center and search the FAQ first. You can also email the RoboVerse support team.'],
  },
];

