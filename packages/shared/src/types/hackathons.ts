export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  city: string;
  state: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  level: string;
  prizePoolInr: number;
  registrationDeadline: string;
  eventDate: string;
  url: string;
  description: string;
  isCurated: boolean;
  teamSizeMax: number;
  tracks: string[];
  judgingCriteria: string[];
}

export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  teamName: string;
  captainUserId: string;
  captainName: string;
  captainStudentId: string;
  projectTitle: string;
  projectDescription: string;
  circuitProjectId?: string;
  robotDesignId?: string;
  videoDemoUrl?: string;
  githubUrl?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'winner';
  submittedAt: string;
}

export interface TeamMatchingEntry {
  id: string;
  hackathonId: string;
  userId: string;
  studentId: string;
  name: string;
  skills: string[];
  preferredRole: string;
  message: string;
  city: string;
  createdAt: string;
}

export const OFFICIAL_HACKATHONS: Hackathon[] = [
  {
    id: 'hack_sih_robotics_2026',
    title: 'Smart India Autonomous Rover Challenge 2026',
    organizer: 'Ministry of Education & RoboVerse',
    city: 'Delhi',
    state: 'Delhi',
    mode: 'HYBRID',
    level: 'National Grand Finale',
    prizePoolInr: 1500000,
    registrationDeadline: '2026-12-05T23:59:59Z',
    eventDate: '2026-12-20T09:00:00Z',
    url: 'https://roboverse.tech/hackathons/sih-2026',
    description: 'Build an autonomous Mars-style search and rescue ground rover with obstacle avoidance, GPS navigation, and ultrasonic telemetry using RoboVerse 3D Workbench.',
    isCurated: true,
    teamSizeMax: 4,
    tracks: ['Autonomous Navigation', 'Disaster Robotics', 'Sensor Fusion'],
    judgingCriteria: ['Circuit Reliability', 'Autonomous Algorithm', 'Speed & Safety', 'Code Quality'],
  },
  {
    id: 'hack_techfest_robowars_2026',
    title: 'IIT Bombay Techfest Robowars & Arena Challenge',
    organizer: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    mode: 'OFFLINE',
    level: 'Inter-Collegiate Championship',
    prizePoolInr: 800000,
    registrationDeadline: '2026-11-28T23:59:59Z',
    eventDate: '2026-12-14T09:00:00Z',
    url: 'https://techfest.org/robowars',
    description: 'The premier collegiate combat and obstacle clearing robotics event. Design custom 4WD combat robots with high-torque gear motors and weapon actuators.',
    isCurated: true,
    teamSizeMax: 5,
    tracks: ['Combat Mechanics', 'Kinematic Durability', 'Power Distribution'],
    judgingCriteria: ['Mechanical Strength', 'Motor Torque Management', 'Driver Reflex & Telemetry'],
  },
  {
    id: 'hack_drone_derby_2026',
    title: 'National UAV Drone Derby & Obstacle Grand Prix',
    organizer: 'Karnataka Innovation Council & DGCA',
    city: 'Bengaluru',
    state: 'Karnataka',
    mode: 'OFFLINE',
    level: 'Advanced UAV Aeronautics',
    prizePoolInr: 1200000,
    registrationDeadline: '2026-12-10T23:59:59Z',
    eventDate: '2026-12-28T09:00:00Z',
    url: 'https://bengaluru-tech.org/drone-derby',
    description: 'Fly quadcopters through 3D ring gates, waypoint corridors, and live optical tracking arenas. Test autonomous fail-safes and PID stability.',
    isCurated: true,
    teamSizeMax: 4,
    tracks: ['Autonomous Waypoint Navigation', 'Computer Vision Tracking', 'Aerodynamic Efficiency'],
    judgingCriteria: ['Lap Time', 'Gate Precision', 'Fail-safe Response', 'Battery Telemetry'],
  },
  {
    id: 'hack_robocup_junior_2026',
    title: 'RoboCup Junior Asia-Pacific Qualifier',
    organizer: 'RoboCup Federation India',
    city: 'Pune',
    state: 'Maharashtra',
    mode: 'HYBRID',
    level: 'High School & College Junior',
    prizePoolInr: 600000,
    registrationDeadline: '2026-12-01T23:59:59Z',
    eventDate: '2026-12-18T10:00:00Z',
    url: 'https://robocup.org.in',
    description: 'Line following rescue mission and 2-on-2 soccer robots. Program microcontrollers with infrared tracking and obstacle evasion.',
    isCurated: true,
    teamSizeMax: 3,
    tracks: ['Line Tracking Rescue', 'Robot Soccer', 'Open Innovation'],
    judgingCriteria: ['Line Tracking Smoothness', 'Sensor Interfacing', 'Autonomous Decision Tree'],
  },
  {
    id: 'hack_virtual_rover_sprint',
    title: 'Virtual 3D Robotics Arena Spring Sprint',
    organizer: 'RoboVerse Global Community',
    city: 'Online',
    state: 'Global',
    mode: 'ONLINE',
    level: 'Open Track',
    prizePoolInr: 500000,
    registrationDeadline: '2026-12-15T23:59:59Z',
    eventDate: '2026-12-22T00:00:00Z',
    url: 'https://roboverse.tech/virtual-arena',
    description: '100% online hackathon inside the RoboVerse 3D Simulation Engine. Submit your circuit schematics and C++ firmware to complete virtual courses.',
    isCurated: true,
    teamSizeMax: 2,
    tracks: ['Virtual Rover Simulation', 'Arduino Firmware Optimization', 'Low-power Design'],
    judgingCriteria: ['Physics Simulation Score', 'Execution Time', 'Component Efficiency'],
  },
];
