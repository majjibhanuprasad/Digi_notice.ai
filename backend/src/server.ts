import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import { connectMySQL } from './config/mysqlDb';
import apiRouter from './routes/api';
import { User, Notice, IDepartment, ICategory, INotice, IUser } from './models/Schemas';

import { 
  helmetSecurity, 
  corsFirewall, 
  payloadSanitizer, 
  generalApiLimiter 
} from './middleware/securityFirewall';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Firewall Middlewares
app.use(helmetSecurity);
app.use(corsFirewall);
app.use(express.json({ 
  limit: '2mb',
  verify: (req, _res, buf) => {
    const raw = buf.toString();
    if (raw.includes('"__proto__"') || raw.includes('"constructor"') || raw.includes('"prototype"') || raw.includes('\0')) {
      throw new Error('Firewall Block: Malformed or suspicious payload detected.');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(payloadSanitizer);

// General API Rate Limiting Firewall
app.use('/api', generalApiLimiter);

// Main API Router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', firewall: 'active', timestamp: new Date() });
});

// Seeding helper function
const seedData = async () => {
  try {
    const shouldSeedUsers = process.env.AUTO_SEED === 'true';
    const adminUser = await User.findOne({ role: 'SUPER_ADMIN' });
    if (shouldSeedUsers && !adminUser) {
      console.log('Seeding default campus user accounts (Super Admin, HODs, Students)...');
      // 1. Seed Users (passwords hashed)
      const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('password123', salt);

    const superAdmin = await User.create({
      _id: 'user_super_admin_01',
      name: 'Dr. Alok Verma',
      email: 'superadmin@college.edu',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      department: null,
      academicYear: null,
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      clubs: []
    });

    const branchesList = [
      { code: 'CSE', name: 'Prof. Ramesh K. (HOD, CSE)', email: 'cse.faculty@college.edu' },
      { code: 'CSM', name: 'Dr. Srinivas Rao (HOD, CSM)', email: 'csm.faculty@college.edu' },
      { code: 'CSD', name: 'Prof. Anirudh Sen (HOD, CSD)', email: 'csd.faculty@college.edu' },
      { code: 'ECE', name: 'Prof. Sunita Rao (HOD, ECE)', email: 'ece.faculty@college.edu' },
      { code: 'EEE', name: 'Dr. Vijay Kumar (HOD, EEE)', email: 'eee.faculty@college.edu' },
      { code: 'Mech', name: 'Prof. Balaji Naidu (HOD, Mech)', email: 'mech.faculty@college.edu' },
      { code: 'Civil', name: 'Dr. Madhavan Pillai (HOD, Civil)', email: 'civil.faculty@college.edu' },
      { code: 'IT', name: 'Prof. Swati Sharma (HOD, IT)', email: 'it.faculty@college.edu' },
      { code: 'Robotics', name: 'Dr. Arjun Mehta (HOD, Robotics)', email: 'robotics.faculty@college.edu' },
      { code: 'Chemical Engineering', name: 'Prof. K. R. Das (HOD, Chemical)', email: 'chemical.faculty@college.edu' },
      { code: 'Cyber Security', name: 'Dr. Neha Gupta (HOD, Cyber Security)', email: 'cyber.faculty@college.edu' },
      { code: 'Bio Technology', name: 'Prof. Shalini Varma (HOD, Biotech)', email: 'biotech.faculty@college.edu' },
      { code: 'Aero Space', name: 'Dr. Vivek Agnihotri (HOD, Aerospace)', email: 'aerospace.faculty@college.edu' },
      { code: 'Agricultural Engineering', name: 'Prof. Ramchandra Rao (HOD, Agri)', email: 'agri.faculty@college.edu' },
      { code: 'Mining Engineering', name: 'Dr. S. K. Bose (HOD, Mining)', email: 'mining.faculty@college.edu' }
    ];

    for (let i = 0; i < branchesList.length; i++) {
      const b = branchesList[i];
      await User.create({
        _id: `user_dept_admin_${b.code.toLowerCase().replace(/[^a-z0-9]/g, '')}_01`,
        name: b.name,
        email: b.email,
        password: superAdminPassword,
        role: 'DEPARTMENT_ADMIN',
        department: b.code,
        academicYear: null,
        profileImage: `https://images.unsplash.com/photo-${1544005313 + i * 1234}?w=150` || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        clubs: []
      });
    }

    const student1 = await User.create({
      _id: 'user_student_cse_4th_01',
      name: 'Abhinav Sharma',
      email: 'student1@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'CSE',
      academicYear: '4th Year',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      clubs: ['Coding Club', 'Placement Cell']
    });

    const student2 = await User.create({
      _id: 'user_student_cse_3rd_01',
      name: 'Bhavana Reddy',
      email: 'student2@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'CSE',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      clubs: ['Coding Club', 'Cultural Society']
    });

    const student3 = await User.create({
      _id: 'user_student_ece_4th_01',
      name: 'Chaitanya Kumar',
      email: 'student3@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'ECE',
      academicYear: '4th Year',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      clubs: ['Sports Club', 'Placement Cell']
    });

    const student4 = await User.create({
      _id: 'user_student_eee_2nd_01',
      name: 'Divya Patel',
      email: 'student4@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'EEE',
      academicYear: '2nd Year',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      clubs: ['Sports Club']
    });

    const student5 = await User.create({
      _id: 'user_student_civil_1st_01',
      name: 'Eshwar Prasad',
      email: 'student5@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Civil',
      academicYear: '1st Year',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      clubs: ['Cultural Society']
    });

    const studentCSM = await User.create({
      _id: 'user_student_csm_3rd_01',
      name: 'Aditya Sen',
      email: 'student.csm@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'CSM',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      clubs: ['Coding Club']
    });

    const studentCSD = await User.create({
      _id: 'user_student_csd_4th_01',
      name: 'Kavya Nair',
      email: 'student.csd@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'CSD',
      academicYear: '4th Year',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      clubs: ['Coding Club', 'Placement Cell']
    });

    const studentIT = await User.create({
      _id: 'user_student_it_3rd_01',
      name: 'Rahul Varma',
      email: 'student.it@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'IT',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      clubs: ['Coding Club']
    });

    const studentRobotics = await User.create({
      _id: 'user_student_robotics_2nd_01',
      name: 'Siddharth Roy',
      email: 'student.robotics@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Robotics',
      academicYear: '2nd Year',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      clubs: ['Sports Club']
    });

    const studentChemical = await User.create({
      _id: 'user_student_chemical_3rd_01',
      name: 'Ananya Goel',
      email: 'student.chemical@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Chemical Engineering',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clubs: []
    });

    const studentCyber = await User.create({
      _id: 'user_student_cyber_4th_01',
      name: 'Vikram Malhotra',
      email: 'student.cyber@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Cyber Security',
      academicYear: '4th Year',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      clubs: ['Coding Club', 'Placement Cell']
    });

    const studentBiotech = await User.create({
      _id: 'user_student_biotech_2nd_01',
      name: 'Priyanka Das',
      email: 'student.biotech@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Bio Technology',
      academicYear: '2nd Year',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      clubs: ['Cultural Society']
    });

    const studentAerospace = await User.create({
      _id: 'user_student_aerospace_3rd_01',
      name: 'Rohan Mehra',
      email: 'student.aerospace@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Aero Space',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150',
      clubs: []
    });

    const studentAgri = await User.create({
      _id: 'user_student_agri_1st_01',
      name: 'Harish Rao',
      email: 'student.agri@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Agricultural Engineering',
      academicYear: '1st Year',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      clubs: []
    });

    const studentMining = await User.create({
      _id: 'user_student_mining_4th_01',
      name: 'Pranav Joshi',
      email: 'student.mining@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Mining Engineering',
      academicYear: '4th Year',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      clubs: []
    });

    const studentMech = await User.create({
      _id: 'user_student_mech_3rd_01',
      name: 'Varun Dhawan',
      email: 'student.mech@college.edu',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Mech',
      academicYear: '3rd Year',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      clubs: ['Sports Club']
    });

      console.log('Demo user accounts seeded.');
    }

    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      console.log('Seeding default notice board announcements...');
      // 2. Seed Notices (at least 10 notices with various categories, priorities)
      const now = new Date();
    const futureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const notices: Omit<INotice, '_id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: '⚠️ EMERGENCY: College Closed Today due to Cyclone Warning',
        content: 'Dear Faculty and Students,\n\nIn view of the severe cyclone warning issued by the regional meteorological department and for the safety of our students and staff, the college administration has decided that all classes and administrative departments will remain closed today.\n\nOnline classes may be scheduled by respective HODs where feasible. Everyone is requested to stay indoors and follow safety instructions.\n\nEmergency Helpline: 040-23456789',
        summary: '🧠 AI Summary: College remains closed today due to severe cyclone warning. Stay safe and contact helpline for support.',
        category: 'Emergency',
        priority: 'CRITICAL',
        department: null, // All
        academicYears: [], // All years
        targetGroups: [],
        attachments: [],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(0.1),
        expiresAt: futureDate(1),
        views: 142,
        acknowledgements: 5
      },
      {
        title: '🎓 Campus Placement Drive: Infosys Hiring for Final Year Students',
        content: 'Dear final-year students (CSE & ECE),\n\nWe are pleased to announce that Infosys will be conducting a campus placement drive for the graduating batch. This drive is open for all final-year students with a CGPA of 7.0 and above and no active backlogs.\n\nDate: August 25, 2026\nVenue: Seminar Hall 1 & Online Testing Centers\nPosition: Systems Engineer\nPackage: INR 4.5 - 6.2 LPA\n\nEligible students must complete their registration via the link below. Resumes must be updated and uploaded in PDF format.\n\nGood luck!\nTraining & Placement Cell',
        summary: '🧠 AI Summary: Infosys is organizing a campus placement drive on August 25 for final-year CSE and ECE students. Registration deadline is August 22.',
        category: 'Placements',
        priority: 'HIGH',
        department: null, // Targeted via academic year + targeted departments
        academicYears: ['4th Year'],
        targetGroups: ['Placement Cell'],
        attachments: [{ type: 'pdf', name: 'Infosys_Drive_Syllabus.pdf', url: 'https://example.com/infosys-drive.pdf' }],
        createdBy: 'user_cse_admin_01',
        createdByName: 'Prof. Ramesh K. (HOD, CSE)',
        createdByDepartment: 'CSE',
        status: 'Published',
        publishAt: pastDate(2),
        expiresAt: futureDate(10),
        registrationLink: 'https://forms.college.edu/infosys-placement-2026',
        eventDate: futureDate(12),
        venue: 'Seminar Hall 1',
        views: 98,
        acknowledgements: 3
      },
      {
        title: '📝 Academic mid-Term Exam Timetable released',
        content: 'Dear Students,\n\nThe mid-term examination timetable for all branches (CSE, ECE, EEE, Civil, Mechanical) has been finalized and released. Exams are scheduled to begin from next Monday. Please review the detailed timetable attachment carefully.\n\nEnsure that you collect your hall tickets from the administrative section before Friday. No student will be allowed to sit for examinations without a valid hall ticket and ID card.\n\nController of Examinations',
        summary: '🧠 AI Summary: Academic mid-term exams begin next Monday. Collect hall tickets and ID cards from the admin section before Friday.',
        category: 'Exams',
        priority: 'HIGH',
        department: null,
        academicYears: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        targetGroups: [],
        attachments: [{ type: 'image', name: 'Midterm_Timetable_Aug2026.png', url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600' }],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(1),
        expiresAt: futureDate(7),
        views: 185,
        acknowledgements: 4
      },
      {
        title: '🚀 Technical Bootcamp: Web Development in React & TypeScript',
        content: 'Hello CSE and ECE students,\n\nThe Coding Club is organizing a hands-on technical workshop on "Modern Frontend Web Development with React and TypeScript". This bootcamp will cover building responsive, state-managed applications from scratch.\n\nDate: Saturday (August 22, 2026)\nTime: 9:00 AM - 4:00 PM\nVenue: Lab 3, CSE Block\n\nPrerequisites: Basic HTML, CSS, and Javascript. Please bring your own laptops. Certificates will be provided upon successful completion.',
        summary: '🧠 AI Summary: Coding Club hosts a Web Development bootcamp on React & TypeScript in Lab 3 on August 22 (9 AM - 4 PM). Bring your laptop.',
        category: 'Workshops',
        priority: 'NORMAL',
        department: 'CSE',
        academicYears: ['1st Year', '2nd Year', '3rd Year'],
        targetGroups: ['Coding Club'],
        attachments: [],
        createdBy: 'user_cse_admin_01',
        createdByName: 'Prof. Ramesh K. (HOD, CSE)',
        createdByDepartment: 'CSE',
        status: 'Published',
        publishAt: pastDate(3),
        expiresAt: futureDate(9),
        registrationLink: 'https://forms.college.edu/coding-bootcamp-react',
        eventDate: futureDate(9),
        venue: 'Lab 3, CSE Block',
        views: 75,
        acknowledgements: 0
      },
      {
        title: '🏏 Annual Inter-Departmental Cricket Championship',
        content: 'Dear Sports Enthusiasts,\n\nThe Department of Physical Education is hosting the Annual Cricket Tournament. All department teams are requested to submit their final squad lists signed by their respective HODs to the Sports Coordinator by Thursday.\n\nTournament starts: August 28, 2026\nVenue: College Sports Ground\nInaugural Match: CSE vs ECE\n\nLet the spirit of sportsmanship shine!\nDirector of Physical Education',
        summary: '🧠 AI Summary: Annual Inter-Department Cricket Tournament starts August 28. Squad lists must be submitted by Thursday to the Sports Coordinator.',
        category: 'Sports',
        priority: 'NORMAL',
        department: null,
        academicYears: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        targetGroups: ['Sports Club'],
        attachments: [],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(4),
        expiresAt: futureDate(15),
        eventDate: futureDate(15),
        venue: 'College Sports Ground',
        views: 52,
        acknowledgements: 0
      },
      {
        title: '🎨 Spring Cultural Fest 2026: Auditions for Music & Dance',
        content: 'Hi Everyone!\n\nAre you ready to showcase your talents? The Cultural Society is conducting auditions for the upcoming Spring Cultural Fest. Auditions are open for rock bands, classical singing, folk dance, contemporary dance, and theatrical plays.\n\nAudition Dates: August 23 & 24\nTime: 2:00 PM onwards\nVenue: Open Air Theater (OAT)\n\nScan the notice board QR to sign up for your slot. Let\'s make this fest memorable!',
        summary: '🧠 AI Summary: Cultural Society is hosting auditions for Music & Dance on August 23-24 at the Open Air Theater starting at 2:00 PM.',
        category: 'Cultural',
        priority: 'NORMAL',
        department: null,
        academicYears: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        targetGroups: ['Cultural Society'],
        attachments: [],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(2),
        expiresAt: futureDate(11),
        registrationLink: 'https://forms.college.edu/cultural-fest-auditions',
        eventDate: futureDate(10),
        venue: 'Open Air Theater',
        views: 64,
        acknowledgements: 0
      },
      {
        title: '📚 Library Timing Extended for Exam Preparation',
        content: 'Notice for all Students,\n\nTo assist students in preparing for the upcoming mid-term examinations, the central library hours will be extended. Effective today, the library will remain open until 10:00 PM on weekdays and 5:00 PM on Saturdays.\n\nStrict silence must be maintained. High-speed Wi-Fi and study cabins can be reserved at the counter.\n\nLibrarian',
        summary: '🧠 AI Summary: College central library hours are extended until 10:00 PM on weekdays and 5:00 PM on Saturdays for exam preparation.',
        category: 'General',
        priority: 'NORMAL',
        department: null,
        academicYears: [],
        targetGroups: [],
        attachments: [],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(5),
        expiresAt: futureDate(20),
        views: 89,
        acknowledgements: 0
      },
      {
        title: '💼 TCS NQT Campus Recruitment Drive 2026',
        content: 'Dear Final Year CSE Students,\n\nTata Consultancy Services (TCS) is hiring through the National Qualifier Test (NQT). Candidates who have registered for NQT are eligible to apply for this campus interview round.\n\nShortlist Interviews: August 30, 2026\nVenue: Block B, Placement Cabins\n\nPlease ensure you carry 3 copies of your resume, academic transcripts, and passport size photographs. Black formal dress code is mandatory.\n\nTraining & Placement Cell',
        summary: '🧠 AI Summary: TCS recruitment interviews are scheduled for August 30 in Block B. Bring resumes, transcripts, and dress in formals.',
        category: 'Placements',
        priority: 'HIGH',
        department: 'CSE',
        academicYears: ['4th Year'],
        targetGroups: ['Placement Cell'],
        attachments: [],
        createdBy: 'user_cse_admin_01',
        createdByName: 'Prof. Ramesh K. (HOD, CSE)',
        createdByDepartment: 'CSE',
        status: 'Published',
        publishAt: pastDate(3),
        expiresAt: futureDate(17),
        eventDate: futureDate(17),
        venue: 'Placement Cabins, Block B',
        views: 82,
        acknowledgements: 2
      },
      {
        title: '🤖 Workshop on Robotics & IoT Control Systems',
        content: 'Dear ECE and EEE Students,\n\nThe department of ECE is organizing a guest seminar and workshop on "IoT and Embedded Robotics Control". We will have guest lecturers from national research centers demonstrating sensor telemetry.\n\nDate: August 26, 2026\nVenue: ECE Lab 2\nOpen to ECE & EEE branch students of 2nd, 3rd, and 4th Year.',
        summary: '🧠 AI Summary: IoT and Embedded Robotics workshop is scheduled for August 26 at ECE Lab 2. Target audience: 2nd, 3rd, 4th year ECE & EEE.',
        category: 'Workshops',
        priority: 'NORMAL',
        department: 'ECE',
        academicYears: ['2nd Year', '3rd Year', '4th Year'],
        targetGroups: [],
        attachments: [],
        createdBy: 'user_ece_admin_01',
        createdByName: 'Prof. Sunita Rao (HOD, ECE)',
        createdByDepartment: 'ECE',
        status: 'Published',
        publishAt: pastDate(1),
        expiresAt: futureDate(13),
        eventDate: futureDate(13),
        venue: 'ECE Lab 2',
        views: 45,
        acknowledgements: 0
      },
      {
        title: '🪪 Mandate: Wearing ID Cards inside the Campus',
        content: 'Strict Notice,\n\nIt has been observed that several students are not wearing their Identity Cards (ID Cards) while entering the college campus or inside labs and classrooms. This is a security risk and is strictly against college guidelines.\n\nEffective immediately, security guards and faculty have been authorized to restrict entry or levy minor fines on students failing to display their ID cards.\n\nDean Academics',
        summary: '🧠 AI Summary: All students must wear their college identity cards at all times on campus. Security will restrict entry for violators.',
        category: 'General',
        priority: 'NORMAL',
        department: null,
        academicYears: [],
        targetGroups: [],
        attachments: [],
        createdBy: 'user_super_admin_01',
        createdByName: 'Dr. Alok Verma',
        createdByDepartment: 'Admin',
        status: 'Published',
        publishAt: pastDate(7),
        expiresAt: futureDate(30),
        views: 110,
        acknowledgements: 1
      }
    ];

      for (const notice of notices) {
        await Notice.create(notice);
      }

      console.log('10 Notice announcements seeded successfully.');
    }

  } catch (e) {
    console.error('Error during data seeding:', e);
  }
};

// Firewall & Application Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.message && err.message.includes('CORS Firewall Block')) {
    return res.status(403).json({ error: 'CORS Block', message: err.message });
  }
  if (err && err.message && err.message.includes('Firewall Block')) {
    return res.status(400).json({ error: 'Firewall Block', message: err.message });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload Too Large', message: 'Request body exceeds 2MB limit.' });
  }
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message || 'An unexpected error occurred.' });
});

// Connect to DB and start
const startServer = async () => {
  const mysqlConnected = await connectMySQL();
  if (!mysqlConnected) {
    await connectDB();
  }
  await seedData();
  
  app.listen(PORT, () => {
    console.log(`🚀 DigiNotice AI Backend listening on port ${PORT}`);
  });
};

startServer();
