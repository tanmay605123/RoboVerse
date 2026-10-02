'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Do I need physical robotics hardware to start learning?',
    a: 'Not at all! RoboVerse features a full browser-based 3D workbench and electrical simulator. You can wire breadboards, write Arduino C++ code, and test sensors and motors virtually. When you are ready to build the physical robot, you can order verified parts in 1 click from TechSavyyy.',
  },
  {
    q: 'How does Rituu AI assist with circuit errors and photo uploads?',
    a: 'Rituu is powered by Claude Vision and restricted exclusively to robotics and circuits. Take a clear photo of your real breadboard, Arduino, or wiring nest and upload it. Rituu identifies misplaced wires, blown resistors, missing ground connections, and gives step-by-step fix instructions.',
  },
  {
    q: 'What is the Digital Student ID & Learning Passport?',
    a: 'Every student receives a unique Student ID (e.g. RV-2026-000101) with a 3D flip card and verifiable QR code. Your Learning Passport automatically charts your skill radar across Electronics, Arduino, Mechanics, IoT, and ML, providing proof of competence for college admissions and competitions.',
  },
  {
    q: 'Are all prices inclusive of taxes? What is the refund policy?',
    a: 'Yes, all prices displayed include 18% GST (Tax invoices are generated instantly). We also offer a strict 7-day 100% money-back guarantee on your first paid subscription if you are not fully satisfied.',
  },
  {
    q: 'Can schools, colleges, and Atal Tinkering Labs (ATLs) use RoboVerse?',
    a: 'Yes! Our Institution Plan (₹499/student/year) provides a dedicated Teacher Dashboard, batch assignment distribution, auto-grading, and bulk Student IDs. We also offer teachers a 3-month free classroom trial.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-[#06100C]/80 border-t border-robo-borderSubtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-teal text-xs font-mono mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>COMMON INQUIRIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl glass-panel border border-robo-borderSubtle overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-base hover:text-robo-neon transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-robo-teal shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-robo-neon' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-robo-textSecondary leading-relaxed border-t border-robo-borderSubtle/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
