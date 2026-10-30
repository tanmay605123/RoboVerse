/**
 * Gemini Function Calling Tool Declarations for RoboVerse Lab Integration
 */

export const RITUU_TOOL_DECLARATIONS = [
  {
    name: 'highlight_wiring_issue',
    description: 'Highlights a specific wire, pin, or component on the 3D circuit breadboard where an electrical or logical error is detected.',
    parameters: {
      type: 'object',
      properties: {
        component_id: {
          type: 'string',
          description: 'The unique ID of the component with the issue (e.g., "r_led", "mcu_1").',
        },
        pin_id: {
          type: 'string',
          description: 'The pin identifier on the component (e.g., "pin_13", "VCC", "GND").',
        },
        net_name: {
          type: 'string',
          description: 'The electrical net name (e.g., "NET_D13", "GND").',
        },
        reason: {
          type: 'string',
          description: 'Clear explanation of why this pin/connection is erroneous (e.g., "Short circuit to GND", "Missing current limiting resistor").',
        },
      },
      required: ['component_id', 'reason'],
    },
  },
  {
    name: 'propose_fix',
    description: 'Proposes an automated code patch or circuit adjustment that the student can review and click "Apply" to execute in the workspace.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Short descriptive title of the fix (e.g., "Add 220Ω resistor to Pin 13 LED", "Fix baud rate in Serial.begin").',
        },
        description: {
          type: 'string',
          description: 'Detailed explanation of what the fix will alter.',
        },
        code_patch: {
          type: 'string',
          description: 'Replacement Arduino C++ source code if this is a firmware fix.',
        },
      },
      required: ['title', 'description'],
    },
  },
  {
    name: 'load_sample_project',
    description: 'Opens a verified starter project or sample circuit assembly in the lab.',
    parameters: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          description: 'The identifier of the sample project (e.g., "tmpl_obstacle_car", "tmpl_line_follower", "sample_led_blink").',
        },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'find_parts',
    description: 'Searches the RoboVerse hardware catalog or TechSavyyy store for components needed by the student.',
    parameters: {
      type: 'object',
      properties: {
        component_type_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of component types to find (e.g., ["ultrasonic_hcsr04", "servo_sg90", "resistor_220"]).',
        },
      },
      required: ['component_type_ids'],
    },
  },
  {
    name: 'open_lesson',
    description: 'Opens an interactive beginner curriculum lesson or roadmap tutorial.',
    parameters: {
      type: 'object',
      properties: {
        lesson_id: {
          type: 'string',
          description: 'The ID of the lesson (e.g., "lesson_01_blink", "lesson_05_ultrasonic_radar").',
        },
      },
      required: ['lesson_id'],
    },
  },
];
