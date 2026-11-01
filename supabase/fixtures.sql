-- =====================================================================
-- RoboVerse Development & Test Fixtures ONLY
-- File: supabase/fixtures.sql
-- NOT executed in production. Only for local development & staging tests.
-- =====================================================================

-- 1. Sample Maker Shops (Dev/Testing Coordinates)
INSERT INTO public.shops (name, phone, address, city, state, pincode, location, opening_hours, verified_status, rating, categories)
VALUES
(
  'SP Road Robotics & Electronics Hub',
  '+91 80 2223 8899',
  '#42, Sadar Patrappa Road, Near City Market',
  'Bengaluru',
  'Karnataka',
  '560002',
  ST_SetSRID(ST_MakePoint(77.5833, 12.9644), 4326)::geography,
  '10:00 AM - 8:30 PM (Mon-Sat)',
  'verified',
  4.9,
  ARRAY['Arduino', 'Sensors', 'BLDC Motors', 'Chassis', 'LiPo Batteries']
),
(
  'Lajpat Rai Market Electronics Emporium',
  '+91 11 2386 1122',
  'Shop 118, Old Lajpat Rai Market, Chandni Chowk',
  'Delhi',
  'Delhi',
  '110006',
  ST_SetSRID(ST_MakePoint(77.2355, 28.6562), 4326)::geography,
  '10:30 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.8,
  ARRAY['Microcontrollers', 'Soldering Kits', 'Sensors', 'Relays', 'Displays']
),
(
  'Lamington Road Tech Components Center',
  '+91 22 2387 4455',
  'Dr. Dadasaheb Bhadkamkar Marg, Grant Road East',
  'Mumbai',
  'Maharashtra',
  '400007',
  ST_SetSRID(ST_MakePoint(72.8164, 18.9616), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.7,
  ARRAY['Robotics Kits', 'Raspberry Pi', 'Motors', 'Tools', 'ESP32']
),
(
  'Gujarati Galli Maker Spares Hub',
  '+91 40 2475 9933',
  'Gujarati Galli, Bank Street, Koti',
  'Hyderabad',
  'Telangana',
  '500095',
  ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.6,
  ARRAY['Sensors', 'Breadboards', 'Batteries', 'Arduino', 'Wires']
),
(
  'Budhwar Peth Robotics & Electronic Store',
  '+91 20 2445 6677',
  'Appa Balwant Chowk, Budhwar Peth',
  'Pune',
  'Maharashtra',
  '411002',
  ST_SetSRID(ST_MakePoint(73.8562, 18.5167), 4326)::geography,
  '10:00 AM - 8:00 PM (Mon-Sat)',
  'verified',
  4.7,
  ARRAY['Servos', 'Microcontrollers', 'Sensors', 'Drone Parts', 'Tools']
)
ON CONFLICT DO NOTHING;

-- 2. Dev Mock Hackathons
INSERT INTO public.hackathons (id, slug, title, tagline, description, start_date, end_date, prize_pool_inr, is_active, max_team_size, tracks)
VALUES
(
  'hack_national_stem_2026',
  'national-stem-robotics-2026',
  'All-India Autonomous Rover & Drone Hackathon 2026',
  'Design, simulate and build autonomous rovers competing in real-time obstacle arenas.',
  'Compete with over 5,000 makers across India in navigation, computer vision, and ROS simulation.',
  '2026-11-15T09:00:00Z',
  '2026-11-20T18:00:00Z',
  250000.00,
  true,
  4,
  '[
    {"name": "Autonomous Navigation (MNA + Sonar)", "prize_inr": 100000},
    {"name": "Drone Aerodynamics & Betaflight", "prize_inr": 75000},
    {"name": "Bionic Manipulators & Kinematics", "prize_inr": 75000}
  ]'::jsonb
),
(
  'hack_iot_automation_2026',
  'iot-automation-hackathon-2026',
  'Smart Campus IoT & Environmental Telemetry Sprint',
  'Build ESP32 and LoRa sensor nodes streaming live telemetry to dashboards.',
  'Focus on low-power sensor arrays, battery optimization, and agricultural telemetry.',
  '2026-12-01T10:00:00Z',
  '2026-12-05T20:00:00Z',
  150000.00,
  true,
  3,
  '[
    {"name": "Smart Campus Energy Management", "prize_inr": 75000},
    {"name": "Precision Agriculture & Soil Sensing", "prize_inr": 75000}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
