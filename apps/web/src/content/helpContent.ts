export interface HelpCategory { id: string; title: string; description: string; icon: string; }
export interface HelpFaq { id: string; category: string; question: string; answer: string; }

export const helpCategories: HelpCategory[] = [
  { id: 'account', title: 'Account and Login', description: 'Sign in, passwords, profiles, and student IDs.', icon: 'user' },
  { id: 'billing', title: 'Billing and Subscriptions', description: 'Plans, invoices, upgrades, and cancellations.', icon: 'credit-card' },
  { id: 'simulator', title: 'Simulator Issues', description: 'Loading, performance, wiring, and saved projects.', icon: 'cpu' },
  { id: 'store', title: 'Store Orders', description: 'Orders, shipping, returns, and invoices.', icon: 'shopping-bag' },
  { id: 'rituu', title: 'Rituu AI', description: 'Quotas, prompts, photos, and robotics help.', icon: 'sparkles' },
  { id: 'community', title: 'Community', description: 'Guidelines, reports, and getting help.', icon: 'users' },
];

export const helpFaqs: HelpFaq[] = [
  { id: 'free', category: 'billing', question: 'Is RoboVerse free to use?', answer: 'Yes. Explorer Free is available at ₹0 and includes guided lessons, a starter component library, five saved simulation projects, and a daily Rituu allowance. Paid plans add more projects, lessons, tools, and support.' },
  { id: 'hardware', category: 'simulator', question: 'Do I need any hardware to start?', answer: 'No. You can learn and simulate circuits in the browser. Hardware becomes useful when you want to test a physical build, but it is not required for the first lessons.' },
  { id: 'support', category: 'account', question: 'Which browsers and devices are supported?', answer: 'Use a current version of Chrome, Edge, Safari, or Firefox on a laptop, desktop, or modern tablet. A larger screen and hardware acceleration provide the best 3D simulator experience.' },
  { id: 'quota', category: 'rituu', question: 'Why did Rituu stop replying?', answer: 'You may have reached the daily message or photo-analysis allowance for your plan. Check the usage meter, wait for the daily reset, or review Plans & Pricing for a higher allowance.' },
  { id: 'slow', category: 'simulator', question: 'The 3D simulator is slow or not loading. What can I do?', answer: 'Follow the troubleshooting checklist below: update your browser, enable hardware acceleration, close heavy tabs, clear the site cache, and try another supported browser. If the issue remains, send the device, browser version, and project link to support.' },
  { id: 'missing-project', category: 'simulator', question: 'My saved project is missing.', answer: 'Confirm that you are signed in with the same account, then refresh the Projects view. If it is still missing, note the project name and approximate save time and contact support so the team can check the record.' },
  { id: 'reset', category: 'account', question: 'How do I reset my password?', answer: 'Open the login page and choose Forgot password. Enter your account email, follow the reset link, and choose a new password that includes uppercase, lowercase, a number, and a special character.' },
  { id: 'upgrade', category: 'billing', question: 'How do I upgrade or cancel my plan?', answer: 'Open Plans & Pricing, select the plan and billing cycle, and continue to checkout. For cancellation or billing corrections, contact support with the account email and invoice or order number.' },
  { id: 'order', category: 'store', question: 'How do I track or return a TechSavyyy Store order?', answer: 'Open Store Orders from your account and select the order to view its status and invoice. For a return, contact support with the order number and reason; eligibility depends on the item and its condition.' },
  { id: 'certificate', category: 'account', question: 'How do I get my certificate?', answer: 'Complete the course or project requirements shown in the progress view. Once issued, open Certificates to download the file or copy the public verification link.' },
  { id: 'report-content', category: 'community', question: 'How do I report inappropriate content in the community?', answer: 'Use the report action on the post or message when available, or email support with the link, a short explanation, and the reason it needs review. Do not repost harmful content in the report.' },
  { id: 'delete', category: 'account', question: 'How do I delete my account?', answer: 'Open Settings and use the privacy or account deletion option. Account deletion is permanent; export anything you need first. If you cannot access the account, contact support from the account email.' },
];

