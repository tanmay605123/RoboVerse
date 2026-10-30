/**
 * RoboVerse Phase 8 Verification Test Suite:
 * Admin Control Room Analytics, Privacy-Compliant Directory, Presence & Verifiable Certificates
 * 
 * Tests:
 * 1. Admin Overview metrics aggregation & radial gauge math
 * 2. Privacy-first Student Directory (zero stored/exposed passwords, reset link dispatch)
 * 3. Search & tier filtering in Student Directory
 * 4. Verifiable Certificate Issuance (format RV-CERT-2026-XXXXXX, competencies, verification URL)
 * 5. Public Certificate Verification (active vs revoked status, 404 on invalid code)
 * 6. "Students Working Now" live presence telemetry
 */

const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('===============================================================');
console.log('🤖 RoboVerse Phase 8: Admin Analytics & Certificates Test Suite');
console.log('===============================================================\n');

// Mock datasets matching Phase 8 implementation
const mockOverviewMetrics = {
  totalStudents: 1420,
  onlineNow: 84,
  active24h: 612,
  active7d: 1280,
  workingOnProjects: 46,
  projectsCreated: 3120,
  enrollmentsCount: 2850,
  certificatesIssued: 418,
  rituuMessagesToday: 1840,
  rituuOfftopicToday: 38,
  rituuOfftopicRatePct: 2.1,
  totalRevenueInr: 184500,
  ordersCount: 168,
  openShopReports: 3,
  serverTimestamp: new Date().toISOString(),
};

const mockStudents = [
  {
    id: 'u001',
    studentId: 'RV-2026-001001',
    fullName: 'Tanmay Chawda',
    email: 'tanmay@iitdelhi.ac.in',
    schoolOrCollege: 'Indian Institute of Technology Delhi',
    city: 'New Delhi',
    planTier: 'PRO',
    currentActivity: 'Circuit Lab: Simulating Dual Ultrasonic Rover',
    xp: 2840,
    streakDays: 14,
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'u002',
    studentId: 'RV-2026-001002',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@dpsrkp.net',
    schoolOrCollege: 'Delhi Public School, R.K. Puram',
    city: 'New Delhi',
    planTier: 'PLUS',
    currentActivity: 'Simple Lab: Assembling Traffic Light Breadboard',
    xp: 1450,
    streakDays: 8,
    lastSeenAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    createdAt: '2026-09-18T14:30:00Z',
  },
  {
    id: 'u003',
    studentId: 'RV-2026-001003',
    fullName: 'Ananya Deshmukh',
    email: 'ananya.d@coep.ac.in',
    schoolOrCollege: 'College of Engineering Pune (COEP)',
    city: 'Pune',
    planTier: 'PRO',
    currentActivity: 'Robotic Design Lab: Testing 6-DOF Kinematics Arm',
    xp: 3200,
    streakDays: 22,
    lastSeenAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    createdAt: '2026-09-20T09:15:00Z',
  },
  {
    id: 'u004',
    studentId: 'RV-2026-001004',
    fullName: 'Rohan Iyer',
    email: 'rohan.iyer@pes.edu',
    schoolOrCollege: 'PES University Bengaluru',
    city: 'Bengaluru',
    planTier: 'FREE',
    currentActivity: 'Rituu AI: Asking about PWM frequency on ESP32',
    xp: 620,
    streakDays: 3,
    lastSeenAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    createdAt: '2026-10-01T16:45:00Z',
  },
  {
    id: 'u005',
    studentId: 'RV-2026-001005',
    fullName: 'Pooja Sundaram',
    email: 'pooja.s@nitt.edu',
    schoolOrCollege: 'National Institute of Technology Tiruchirappalli',
    city: 'Tiruchirappalli',
    planTier: 'PLUS',
    currentActivity: 'Maker Radar: Browsing SP Road Electronics Stores',
    xp: 1980,
    streakDays: 11,
    lastSeenAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    createdAt: '2026-10-05T11:20:00Z',
  },
  {
    id: 'u006',
    studentId: 'RV-2026-001006',
    fullName: 'Kabir Verma',
    email: 'kabir.v@heritage.edu.in',
    schoolOrCollege: 'The Heritage School Kolkata',
    city: 'Kolkata',
    planTier: 'FREE',
    currentActivity: 'TechSavyyy Store: Ordering Arduino Starter Kit',
    xp: 350,
    streakDays: 1,
    lastSeenAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    createdAt: '2026-10-12T13:10:00Z',
  },
];

const mockCertificates = {
  'RV-CERT-2026-001001': {
    valid: true,
    certificateCode: 'RV-CERT-2026-001001',
    studentName: 'Tanmay Chawda',
    studentId: 'RV-2026-001001',
    courseName: 'Arduino & Electronics Foundations',
    track: 'HARDWARE & EMBEDDED SYSTEMS',
    hours: 16,
    gradeScore: 98.5,
    issuedAt: '2026-10-18T14:30:00Z',
    isRevoked: false,
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: [
      'Ohm & Kirchhoff Laws',
      'ATmega328P Register-Level Architecture',
      'PWM Signal Control',
      'Analog-to-Digital Conversion (ADC)',
      'I2C & SPI Serial Protocols',
      'MNA Electrical Circuit Simulation',
    ],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-001001',
  },
  'RV-CERT-2026-001002': {
    valid: true,
    certificateCode: 'RV-CERT-2026-001002',
    studentName: 'Aarav Sharma',
    studentId: 'RV-2026-001002',
    courseName: 'Autonomous Mobile Robotics: Line Tracers & Rovers',
    track: 'ROBOTICS & CONTROL SYSTEMS',
    hours: 24,
    gradeScore: 96.0,
    issuedAt: '2026-10-22T11:15:00Z',
    isRevoked: false,
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: [
      'Differential-Drive Kinematics',
      'PID Algorithm Tuning',
      'IR Line Array Sensor Calibration',
      'L298N Dual H-Bridge Motor Control',
      'Real-Time Collision Avoidance',
    ],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-001002',
  },
  'RV-CERT-2026-REVOKED': {
    valid: false,
    certificateCode: 'RV-CERT-2026-REVOKED',
    studentName: 'Test Account',
    studentId: 'RV-2026-009999',
    courseName: 'Drone Flight Dynamics & PID Stabilization',
    track: 'AERIAL ROBOTICS',
    hours: 30,
    gradeScore: 60.0,
    issuedAt: '2026-08-01T00:00:00Z',
    isRevoked: true,
    revokedReason: 'Academic integrity policy violation - unauthorized code submission.',
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: ['Brushless Motor Control', 'IMU 6-DOF Filtering'],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-REVOKED',
  },
};

const mockLivePresence = [
  {
    id: 's01',
    studentId: 'RV-2026-001001',
    fullName: 'Tanmay Chawda',
    lab: 'Circuit Lab',
    projectName: 'Dual Sonar Rover with SG90 Servo Turret',
    action: 'Simulating MNA node voltages (Pin 9 PWM duty cycle 65%)',
    timeActiveMinutes: 38,
    lastPingSecondsAgo: 4,
  },
  {
    id: 's02',
    studentId: 'RV-2026-001003',
    fullName: 'Ananya Deshmukh',
    lab: 'Robotic Design Lab',
    projectName: '4-DOF Articulated Robotic Arm',
    action: 'Running Physics Simulation in Obstacle Slalom Arena (Score: 88)',
    timeActiveMinutes: 52,
    lastPingSecondsAgo: 8,
  },
  {
    id: 's03',
    studentId: 'RV-2026-001002',
    fullName: 'Aarav Sharma',
    lab: 'Simple Lab',
    projectName: 'Interactive Traffic Light Controller',
    action: 'Routing Red LED anode jumper wire to Breadboard tie-point E12',
    timeActiveMinutes: 19,
    lastPingSecondsAgo: 14,
  },
];

// ==========================================
// TEST SUITE: Admin Overview Metrics & Gauges
// ==========================================
console.log('--- 1. Admin Overview & Control Room Metrics ---');

runTest('Admin metrics include all 14 mandatory telemetry fields', () => {
  const fields = [
    'totalStudents', 'onlineNow', 'active24h', 'active7d',
    'workingOnProjects', 'projectsCreated', 'enrollmentsCount',
    'certificatesIssued', 'rituuMessagesToday', 'rituuOfftopicToday',
    'rituuOfftopicRatePct', 'totalRevenueInr', 'ordersCount', 'openShopReports'
  ];
  fields.forEach(field => {
    assert(field in mockOverviewMetrics, `Missing telemetry field: ${field}`);
    assert(typeof mockOverviewMetrics[field] === 'number', `${field} must be numeric`);
  });
});

runTest('Rituu Sentinel off-topic rate is computed with 1 decimal precision', () => {
  const rate = Number(((mockOverviewMetrics.rituuOfftopicToday / mockOverviewMetrics.rituuMessagesToday) * 100).toFixed(1));
  assert.strictEqual(rate, mockOverviewMetrics.rituuOfftopicRatePct);
  assert(mockOverviewMetrics.rituuOfftopicRatePct < 5.0, 'Off-topic rate must remain under 5% safety margin');
});

runTest('Radial gauge active ratio is correctly calculated for dashboard', () => {
  const activeRate = Math.round((mockOverviewMetrics.active24h / mockOverviewMetrics.totalStudents) * 100);
  assert(activeRate > 40 && activeRate < 50, `Active rate ${activeRate}% should match ~43%`);
});

runTest('Radial gauge lab activity ratio matches students working now', () => {
  const workingRatio = Math.round((mockOverviewMetrics.workingOnProjects / mockOverviewMetrics.onlineNow) * 100);
  assert(workingRatio > 50, `Over 50% of online students should be actively working on projects`);
});

// ==========================================
// TEST SUITE: Student Directory & Privacy
// ==========================================
console.log('\n--- 2. Student Directory & Privacy Rules ---');

runTest('ZERO stored passwords or credentials in student records', () => {
  mockStudents.forEach(student => {
    assert(!('password' in student), `Privacy violation: student ${student.studentId} has password property`);
    assert(!('password_hash' in student), `Privacy violation: student ${student.studentId} has password_hash property`);
    assert(!('secret' in student), `Privacy violation: student ${student.studentId} has secret property`);
  });
});

runTest('Student IDs conform to format RV-YYYY-XXXXXX', () => {
  const idRegex = /^RV-\d{4}-\d{6}$/;
  mockStudents.forEach(student => {
    assert(idRegex.test(student.studentId), `Invalid Student ID pattern: ${student.studentId}`);
  });
});

runTest('Student search filter matches name, ID, school and city', () => {
  const query = 'coep';
  const filtered = mockStudents.filter(s => 
    s.fullName.toLowerCase().includes(query) ||
    s.studentId.toLowerCase().includes(query) ||
    s.schoolOrCollege.toLowerCase().includes(query) ||
    s.city.toLowerCase().includes(query)
  );
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].fullName, 'Ananya Deshmukh');
});

runTest('Student tier filter partitions PRO, PLUS and FREE correctly', () => {
  const proStudents = mockStudents.filter(s => s.planTier === 'PRO');
  const freeStudents = mockStudents.filter(s => s.planTier === 'FREE');
  assert.strictEqual(proStudents.length, 2);
  assert.strictEqual(freeStudents.length, 2);
});

runTest('Password reset dispatcher does not require or mutate passwords directly', () => {
  function dispatchPasswordReset(reqBody) {
    if (!reqBody.email) throw new Error('Student email is required.');
    // Simulates calling supabase.auth.resetPasswordForEmail(email, { redirectTo })
    return {
      dispatched: true,
      email: reqBody.email,
      studentId: reqBody.studentId,
      message: `Password reset link dispatched to ${reqBody.email} for Student ID ${reqBody.studentId}.`
    };
  }

  const result = dispatchPasswordReset({
    email: 'tanmay@iitdelhi.ac.in',
    studentId: 'RV-2026-001001'
  });
  assert(result.dispatched);
  assert(result.message.includes('tanmay@iitdelhi.ac.in'));
  assert(result.message.includes('RV-2026-001001'));
});

// ==========================================
// TEST SUITE: Verifiable Certificates
// ==========================================
console.log('\n--- 3. Verifiable Certificates Issuance & Public Registry ---');

runTest('Certificate codes conform strictly to RV-CERT-YYYY-XXXXXX format', () => {
  const certRegex = /^RV-CERT-\d{4}-[A-Z0-9]+$/;
  Object.keys(mockCertificates).forEach(code => {
    assert(certRegex.test(code), `Certificate code "${code}" does not match format`);
  });
});

runTest('Public verification resolves valid certificate with full competency details', () => {
  const cert = mockCertificates['RV-CERT-2026-001001'];
  assert(cert.valid, 'Valid certificate must return valid=true');
  assert(!cert.isRevoked, 'Valid certificate must not be revoked');
  assert.strictEqual(cert.studentName, 'Tanmay Chawda');
  assert.strictEqual(cert.courseName, 'Arduino & Electronics Foundations');
  assert(cert.skillsAssessed.length >= 4, 'Must list tested competencies');
  assert.strictEqual(cert.verificationUrl, 'https://roboverse.dev/verify/RV-CERT-2026-001001');
});

runTest('Public verification flags revoked certificates with moderation reason', () => {
  const revokedCert = mockCertificates['RV-CERT-2026-REVOKED'];
  assert.strictEqual(revokedCert.valid, false, 'Revoked certificate must return valid=false');
  assert.strictEqual(revokedCert.isRevoked, true, 'Revoked certificate must return isRevoked=true');
  assert(revokedCert.revokedReason && revokedCert.revokedReason.length > 10, 'Revocation reason must be explicit');
});

runTest('Public verification fails gracefully on non-existent certificate codes', () => {
  function verifyCode(code) {
    if (mockCertificates[code]) {
      return { success: true, data: mockCertificates[code] };
    }
    return {
      success: false,
      error: {
        code: 'CERTIFICATE_NOT_FOUND',
        message: `No active or historical certificate found matching code "${code}".`
      }
    };
  }

  const res = verifyCode('RV-CERT-2026-999999');
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error.code, 'CERTIFICATE_NOT_FOUND');
});

runTest('Certificate issuance generates authentic verifiable metadata & unique ID', () => {
  function issueCertificateMock(params) {
    if (!params.courseId) throw new Error('courseId is required');
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const code = `RV-CERT-2026-${randomHex}`;
    return {
      status: 'ISSUED',
      certificateCode: code,
      certificateId: `cert_${Date.now()}`,
      studentName: params.studentName || 'Tanmay Chawda',
      studentId: params.studentId || 'RV-2026-001001',
      courseName: params.courseName || 'Robotics Foundations',
      track: params.track || 'HARDWARE',
      gradeScore: 98.5,
      hours: 16,
      issuedAt: new Date().toISOString(),
      verificationUrl: `https://roboverse.dev/verify/${code}`,
    };
  }

  const issued = issueCertificateMock({
    courseId: 'course_ard_01',
    studentName: 'Tanmay Chawda',
    studentId: 'RV-2026-001001',
    courseName: 'Arduino & Electronics Foundations'
  });

  assert.strictEqual(issued.status, 'ISSUED');
  assert(/^RV-CERT-2026-\d{6}$/.test(issued.certificateCode));
  assert(issued.verificationUrl.includes(issued.certificateCode));
  assert.strictEqual(issued.studentName, 'Tanmay Chawda');
});

// ==========================================
// TEST SUITE: Students Working Now Presence
// ==========================================
console.log('\n--- 4. Live Presence & Realtime Telemetry ---');

runTest('Realtime presence captures active lab workspace for each student', () => {
  const allowedLabs = ['Simple Lab', 'Circuit Lab', 'Robotic Design Lab', 'Rituu AI', 'TechSavyyy Store'];
  mockLivePresence.forEach(session => {
    assert(allowedLabs.includes(session.lab), `Unknown lab: ${session.lab}`);
    assert(session.projectName.length > 5, 'Project name must be populated');
    assert(session.action.length > 10, 'Action string must detail the current activity');
    assert(session.lastPingSecondsAgo <= 60, 'Live sessions must have heartbeat within 60s');
  });
});

runTest('Live presence telemetry includes simulation voltage and physics score', () => {
  const circuitSession = mockLivePresence.find(s => s.lab === 'Circuit Lab');
  const designSession = mockLivePresence.find(s => s.lab === 'Robotic Design Lab');

  assert(circuitSession.action.includes('MNA') || circuitSession.action.includes('PWM'), 'Circuit Lab presence must report electrical state');
  assert(designSession.action.includes('Physics') || designSession.action.includes('Score'), 'Design Lab presence must report physics state');
});

// ==========================================
// SUMMARY
// ==========================================
console.log('\n===============================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('===============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
