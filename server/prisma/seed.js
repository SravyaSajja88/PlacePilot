import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Mehta', 'Sneha Iyer', 'Kiran Rao',
  'Ananya Singh', 'Vikram Nair', 'Deepika Reddy', 'Arjun Kumar', 'Pooja Desai',
  'Siddharth Joshi', 'Kavya Menon', 'Rahul Verma', 'Divya Pillai', 'Aditya Shah',
  'Shreya Gupta', 'Nikhil Bose', 'Meera Krishnan', 'Harsh Agarwal', 'Riya Malhotra',
  'Tushar Jain', 'Swati Saxena', 'Varun Pandey', 'Ishita Tiwari', 'Manish Choudhary',
];

async function main() {
  console.log('Seeding PlacePilot database...\n');

  // ── Clean slate ───────────────────────────────
  await prisma.applicationEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.drive.deleteMany();
  await prisma.student.deleteMany();
  await prisma.officer.deleteMany();
  await prisma.placementPolicy.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // ── Placement Policy ──────────────────────────
  await prisma.placementPolicy.create({
    data: { oneOfferLock: true },
  });
  console.log('Created placement policy (one-offer lock: ON)');

  // ── Officer account ───────────────────────────
  const officerPassword = await bcrypt.hash('officer@123', 10);
  const officerUser = await prisma.user.create({
    data: {
      email: 'officer@placepilot.com',
      password: officerPassword,
      role: 'OFFICER',
      officer: {
        create: {
          name: 'Placement Officer',
          employeeId: 'EMP-001',
        },
      },
    },
  });
  console.log('Created officer account: officer@placepilot.com / officer@123');

  // ── 6 Drives ──────────────────────────────────
  const drives = await Promise.all([
    prisma.drive.create({
      data: {
        companyName: 'Google',
        roleName: 'Software Engineer',
        ctcMin: 18,
        ctcMax: 24,
        location: 'Bangalore',
        jobType: 'HYBRID',
        description: 'Join Google\'s engineering team working on large-scale distributed systems. You\'ll design, build, and maintain core infrastructure that powers Google\'s products.',
        status: 'ACTIVE',
        minCgpa: 8.0,
        allowedBranches: ['CSE', 'IT', 'ECE'],
        maxBacklogs: 0,
        allowedYears: [4]
      },
    }),
    prisma.drive.create({
      data: {
        companyName: 'Infosys',
        roleName: 'Systems Engineer',
        ctcMin: 3.6,
        ctcMax: 4.5,
        location: 'Pune',
        jobType: 'ON_SITE',
        description: 'Infosys Systems Engineer role for fresh graduates. Work on enterprise software solutions across multiple industry verticals.',
        status: 'ACTIVE',
        minCgpa: 6.0,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH'],
        maxBacklogs: 2,
        allowedYears: [3, 4]
      },
    }),
    prisma.drive.create({
      data: {
        companyName: 'Amazon',
        roleName: 'SDE-1',
        ctcMin: 12,
        ctcMax: 16,
        location: 'Hyderabad',
        jobType: 'HYBRID',
        description: 'Amazon SDE-1 position focused on building highly scalable services. Ownership from day one — you design, build, and operate what you create.',
        status: 'ACTIVE',
        minCgpa: 7.5,
        allowedBranches: ['CSE', 'IT'],
        maxBacklogs: 0,
        allowedYears: [4]
      },
    }),
    prisma.drive.create({
      data: {
        companyName: 'TCS',
        roleName: 'Assistant Systems Engineer',
        ctcMin: 3.36,
        ctcMax: 3.36,
        location: 'Chennai',
        jobType: 'ON_SITE',
        description: 'TCS ASE role for mass hiring. Work with global clients across industries. Excellent learning programs and career growth paths available.',
        status: 'ACTIVE',
        minCgpa: 5.5,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
        maxBacklogs: 3,
        allowedYears: [3, 4]
      },
    }),
    prisma.drive.create({
      data: {
        companyName: 'Flipkart',
        roleName: 'Software Development Engineer',
        ctcMin: 10,
        ctcMax: 14,
        location: 'Bangalore',
        jobType: 'REMOTE',
        description: 'Flipkart SDE role working on India\'s largest e-commerce platform. High-traffic systems, interesting engineering challenges.',
        status: 'ACTIVE',
        minCgpa: 7.0,
        allowedBranches: ['CSE', 'IT', 'ECE'],
        maxBacklogs: 1,
        allowedYears: [4]
      },
    }),
    prisma.drive.create({
      data: {
        companyName: 'Wipro',
        roleName: 'Project Engineer',
        ctcMin: 3.5,
        ctcMax: 4.0,
        location: 'Multiple Cities',
        jobType: 'ON_SITE',
        description: 'Wipro Project Engineer for fresh graduates. Work on IT services for global clients. Strong mentorship and training programs.',
        status: 'CLOSED',
        minCgpa: 6.0,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EEE'],
        maxBacklogs: 2,
        allowedYears: [3, 4]
      },
    }),
  ]);
  console.log(`Created ${drives.length} drives (5 active, 1 closed)`);

  // ── 25 Students ───────────────────────────────
  const studentPassword = await bcrypt.hash('student@123', 10);
  const studentRecords = [];

  const branchYearCgpaData = [
    // Well-qualified for Google
    { branch: 'CSE', year: 4, cgpa: 9.1, activeBacklogs: 0 },
    { branch: 'IT', year: 4, cgpa: 8.7, activeBacklogs: 0 },
    { branch: 'ECE', year: 4, cgpa: 8.3, activeBacklogs: 0 },
    // Good for Amazon
    { branch: 'CSE', year: 4, cgpa: 7.8, activeBacklogs: 0 },
    { branch: 'IT', year: 4, cgpa: 7.5, activeBacklogs: 0 },
    // Eligible for Flipkart
    { branch: 'CSE', year: 4, cgpa: 7.2, activeBacklogs: 1 },
    { branch: 'ECE', year: 4, cgpa: 7.1, activeBacklogs: 0 },
    // Mid-tier — Infosys / TCS
    { branch: 'CSE', year: 4, cgpa: 6.5, activeBacklogs: 0 },
    { branch: 'MECH', year: 4, cgpa: 6.3, activeBacklogs: 1 },
    { branch: 'EEE', year: 4, cgpa: 6.0, activeBacklogs: 2 },
    // Low-tier — TCS only
    { branch: 'CIVIL', year: 4, cgpa: 5.8, activeBacklogs: 2 },
    { branch: 'CSE', year: 4, cgpa: 5.6, activeBacklogs: 3 },
    // Year 3 students
    { branch: 'CSE', year: 3, cgpa: 8.9, activeBacklogs: 0 },
    { branch: 'IT', year: 3, cgpa: 8.2, activeBacklogs: 0 },
    { branch: 'ECE', year: 3, cgpa: 7.6, activeBacklogs: 0 },
    { branch: 'CSE', year: 3, cgpa: 7.0, activeBacklogs: 1 },
    { branch: 'MECH', year: 3, cgpa: 6.4, activeBacklogs: 2 },
    { branch: 'EEE', year: 3, cgpa: 6.1, activeBacklogs: 0 },
    // Edge cases
    { branch: 'CSE', year: 4, cgpa: 5.4, activeBacklogs: 4 }, // barely ineligible everywhere
    { branch: 'CSE', year: 2, cgpa: 9.5, activeBacklogs: 0 }, // year not eligible
    { branch: 'CSE', year: 4, cgpa: 8.5, activeBacklogs: 0 },
    { branch: 'IT', year: 3, cgpa: 7.8, activeBacklogs: 0 },
    { branch: 'ECE', year: 4, cgpa: 7.3, activeBacklogs: 0 },
    { branch: 'CSE', year: 4, cgpa: 6.8, activeBacklogs: 1 },
    { branch: 'IT', year: 4, cgpa: 9.3, activeBacklogs: 0 },
  ];

  for (let i = 0; i < 25; i++) {
    const data = branchYearCgpaData[i];
    const user = await prisma.user.create({
      data: {
        email: `student${i + 1}@example.com`,
        password: studentPassword,
        role: 'STUDENT',
        student: {
          create: {
            name: NAMES[i],
            rollNo: `2021CS${String(i + 1).padStart(3, '0')}`,
            branch: data.branch,
            year: data.year,
            cgpa: data.cgpa,
            activeBacklogs: data.activeBacklogs,
            phone: `98765${String(43210 + i).padStart(5, '0')}`,
          },
        },
      },
      include: { student: true },
    });
    studentRecords.push(user.student);
  }
  console.log(`Created 25 student accounts (student1@example.com – student25@example.com / student@123)`);

  // ── Applications in all pipeline stages ───────
  const google = drives[0];
  const infosys = drives[1];
  const amazon = drives[2];
  const tcs = drives[3];
  const flipkart = drives[4];

  // Dummy resume URL for seeded applications
  const dummyResume = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf';

  // Helper to create application + events
  async function createApplicationAtStatus(studentId, driveId, finalStatus) {
    const pipeline = ['APPLIED', 'SHORTLISTED', 'TECHNICAL', 'HR', 'OFFER_MADE', 'OFFER_ACCEPTED'];
    const idx = pipeline.indexOf(finalStatus);
    const stages = idx >= 0 ? pipeline.slice(0, idx + 1) : ['APPLIED', finalStatus];

    const app = await prisma.application.create({
      data: { studentId, driveId, resumeUrl: dummyResume, currentStatus: finalStatus },
    });

    // Create audit events
    for (let i = 0; i < stages.length; i++) {
      await prisma.applicationEvent.create({
        data: {
          applicationId: app.id,
          fromStatus: stages[i],
          toStatus: stages[i],
          changedById: officerUser.id,
          note: i === 0 ? 'Initial application' : `Moved to ${stages[i]}`,
        },
      });
    }

    return app;
  }

  // Student 0 (Aarav, CSE, 9.1): Google → OFFER_ACCEPTED (placed)
  await createApplicationAtStatus(studentRecords[0].id, google.id, 'OFFER_ACCEPTED');
  await prisma.student.update({ where: { id: studentRecords[0].id }, data: { isPlaced: true } });

  // Student 1 (Priya, IT, 8.7): Amazon → OFFER_MADE
  await createApplicationAtStatus(studentRecords[1].id, amazon.id, 'OFFER_MADE');

  // Student 2 (Rohan, ECE, 8.3): Google → HR
  await createApplicationAtStatus(studentRecords[2].id, google.id, 'HR');

  // Student 3 (Sneha, CSE, 7.8): Amazon → TECHNICAL
  await createApplicationAtStatus(studentRecords[3].id, amazon.id, 'TECHNICAL');

  // Student 4 (Kiran, IT, 7.5): Flipkart → SHORTLISTED
  await createApplicationAtStatus(studentRecords[4].id, flipkart.id, 'SHORTLISTED');

  // Student 5 (Ananya): Flipkart → APPLIED
  await createApplicationAtStatus(studentRecords[5].id, flipkart.id, 'APPLIED');

  // Student 7 (Vikram, CSE, 6.5): Infosys → OFFER_ACCEPTED (placed)
  await createApplicationAtStatus(studentRecords[7].id, infosys.id, 'OFFER_ACCEPTED');
  await prisma.student.update({ where: { id: studentRecords[7].id }, data: { isPlaced: true } });

  // Student 8 (TCS): TCS → SHORTLISTED
  await createApplicationAtStatus(studentRecords[8].id, tcs.id, 'SHORTLISTED');

  // Student 9: TCS → REJECTED
  const rejApp = await prisma.application.create({
    data: { studentId: studentRecords[9].id, driveId: tcs.id, resumeUrl: dummyResume, currentStatus: 'REJECTED' },
  });
  await prisma.applicationEvent.create({
    data: { applicationId: rejApp.id, fromStatus: 'REJECTED', toStatus: 'REJECTED', changedById: officerUser.id, note: 'Initial application' },
  });
  await prisma.applicationEvent.create({
    data: { applicationId: rejApp.id, fromStatus: 'APPLIED', toStatus: 'REJECTED', changedById: officerUser.id, note: 'Did not clear aptitude test' },
  });

  // Student 20 (CSE, 8.5): Google → APPLIED, Amazon → SHORTLISTED
  await createApplicationAtStatus(studentRecords[20].id, google.id, 'APPLIED');
  await createApplicationAtStatus(studentRecords[20].id, amazon.id, 'SHORTLISTED');

  // Student 24 (IT, 9.3): Google → TECHNICAL, Flipkart → APPLIED
  await createApplicationAtStatus(studentRecords[24].id, google.id, 'TECHNICAL');
  await createApplicationAtStatus(studentRecords[24].id, flipkart.id, 'APPLIED');

  console.log('Created applications across all pipeline stages');
  console.log('\nSeed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Officer login : officer@placepilot.com / officer@123');
  console.log('Student login : student1@example.com / student@123');
  console.log('                   (student1 through student25 available)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
