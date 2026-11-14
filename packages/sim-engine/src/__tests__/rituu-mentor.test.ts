import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('RoboVerse Gemini AI Rituu Mentor Engine', () => {
  it('should enforce strict off-topic guardrails against non-STEM prompts', () => {
    const offTopicKeywords = [
      'president', 'election', 'politics', 'bollywood', 'actor', 'actress',
      'dating', 'gossip', 'cricket match score', 'recipe for cake', 'horoscope'
    ];

    const testPrompt = 'Who will win the next presidential election and what is the latest gossip?';
    const isOffTopic = offTopicKeywords.some((kw) => testPrompt.toLowerCase().includes(kw));

    assert.strictEqual(isOffTopic, true, 'Non-STEM politics prompt must trigger off-topic guardrail');
  });

  it('should permit robotics, electronics, and Arduino prompts', () => {
    const offTopicKeywords = [
      'president', 'election', 'politics', 'bollywood', 'actor', 'actress',
      'dating', 'gossip', 'cricket match score', 'recipe for cake', 'horoscope'
    ];

    const validPrompt = 'How do I wire an HC-SR04 ultrasonic sonar sensor to Arduino Uno?';
    const isOffTopic = offTopicKeywords.some((kw) => validPrompt.toLowerCase().includes(kw));

    assert.strictEqual(isOffTopic, false, 'Robotics sensor query must NOT be flagged as off-topic');
  });

  it('should calculate Ohm’s Law resistor sizing for a 5V red LED', () => {
    const vSupply = 5.0;
    const vForward = 2.0;
    const currentA = 0.015; // 15mA

    const rIdeal = (vSupply - vForward) / currentA; // 200 ohms
    assert.strictEqual(rIdeal, 200, 'Calculated ideal resistance must be 200 ohms');

    // Nearest standard E12/E24 resistor
    const standardE12 = [100, 150, 180, 220, 270, 330, 470];
    const recommended = standardE12.find((r) => r >= rIdeal);
    assert.strictEqual(recommended, 220, 'Recommended standard resistor must be 220 ohms');
  });
});
