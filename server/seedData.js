import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import User from './models/User.js';
import Department from './models/Department.js';
import Event from './models/Event.js';
import Attendance from './models/Attendance.js';
import EventAttendance from './models/EventAttendance.js';

dotenv.config({ path: '.env.local' });

// Sample data arrays
const departments = [
  { name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Engineering' },
  { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
  { name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering' },
  { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' },
  { name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering' },
  { name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
  { name: 'Physics', code: 'PHY', description: 'Department of Physics' }
];

const firstNames = [
  'Aayush', 'Priya', 'Rahul', 'Sneha', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 
  'Vikram', 'Ishita', 'Karan', 'Pooja', 'Siddharth', 'Meera', 'Aman', 'Riya',
  'Nikhil', 'Shruti', 'Akash', 'Divya', 'Harsh', 'Nisha', 'Varun', 'Shreya',
  'Raj', 'Sakshi', 'Dev', 'Tanya', 'Manish', 'Kriti'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Agarwal', 'Gupta', 'Verma', 'Yadav',
  'Joshi', 'Shah', 'Mehta', 'Chopra', 'Malhotra', 'Bansal', 'Jain', 'Saxena',
  'Mishra', 'Pandey', 'Srivastava', 'Tiwari'
];

const eventNames = [
  'Tech Symposium 2024', 'Annual Cultural Fest', 'Career Fair', 'Hackathon Weekend',
  'Research Conference', 'Sports Day', 'Alumni Meet', 'Workshop on AI/ML',
  'Entrepreneurship Summit', 'Art & Design Exhibition', 'Science Fair',
  'Industry Connect', 'Student Orientation', 'Faculty Development Program',
  'Innovation Challenge', 'Literary Fest', 'Photography Contest', 'Coding Competition'
];

const locations = [
  'Auditorium A', 'Conference Hall B', 'Main Auditorium', 'Seminar Hall 1',
  'Lab Complex', 'Sports Ground', 'Open Air Theatre', 'Library Hall',
  'Cafeteria', 'Computer Lab 1', 'Physics Lab', 'Chemistry Lab',
  'Multipurpose Hall', 'Lecture Hall 101', 'Workshop Area'
];

// Helper functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomDateInRange = (daysBack = 30, daysFuture = 30) => {
  const today = new Date();
  const start = new Date(today.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  const end = new Date(today.getTime() + (daysFuture * 24 * 60 * 60 * 1000));
  return getRandomDate(start, end);
};

const generateEmail = (firstName, lastName, index) => {
  const domains = ['college.edu', 'university.edu', 'student.edu', 'faculty.edu'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${getRandomElement(domains)}`;
};

const generateRegistrationId = (role, index) => {
  if (role === 'student') return `STU${String(index).padStart(4, '0')}`;
  if (role === 'faculty') return `FAC${String(index).padStart(3, '0')}`;
  if (role === 'admin') return `ADM${String(index).padStart(2, '0')}`;
  return null;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Event.deleteMany({});
    await Attendance.deleteMany({});
    await EventAttendance.deleteMany({});
    console.log('🗑️  Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Seed departments
const seedDepartments = async () => {
  try {
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);
    return createdDepartments;
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    return [];
  }
};

// Seed users
const seedUsers = async (departmentIds) => {
  try {
    const users = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Hardcoded passwords for specific users
    const studentPassword = await bcrypt.hash('facestudent123', salt);
    const facultyPassword = await bcrypt.hash('facultyface123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    let userIndex = 1;

    // Create hardcoded admin user first
    users.push({
      name: "Admin User",
      email: "admin@college.edu",
      password: adminPassword,
      role: 'admin',
      department: getRandomElement(departmentIds),
      registrationId: "ADMIN123",
      faceData: [],
      isActive: true
    });

    // Create hardcoded faculty user
    users.push({
      name: "Dr. Faculty User",
      email: "facultyfacerecognition@gmail.com",
      password: facultyPassword,
      role: 'faculty',
      department: getRandomElement(departmentIds),
      registrationId: "FAC001",
      faceData: [{
        imageId: `face_${Date.now()}_faculty`,
        imageUrl: `https://via.placeholder.com/300x300?text=Faculty+User`,
        imageKit_id: `imagekit_${Date.now()}_faculty`,
        createdAt: getRandomDateInRange(60, 0)
      }],
      isActive: true
    });

    // Create hardcoded student user
    users.push({
      name: "Student User",
      email: "facerecognition@gmail.com",
      password: studentPassword,
      role: 'student',
      department: getRandomElement(departmentIds),
      registrationId: "STU0001",
      faceData: [{
        imageId: `face_${Date.now()}_student`,
        imageUrl: `https://via.placeholder.com/300x300?text=Student+User`,
        imageKit_id: `imagekit_${Date.now()}_student`,
        createdAt: getRandomDateInRange(90, 0)
      }],
      isActive: true
    });

    // Create additional admin users
    for (let i = 0; i < 2; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      users.push({
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, userIndex++),
        password: hashedPassword,
        role: 'admin',
        department: getRandomElement(departmentIds),
        registrationId: generateRegistrationId('admin', i + 2),
        faceData: [],
        isActive: true
      });
    }

    // Create faculty users
    for (let i = 0; i < 14; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      users.push({
        name: `Dr. ${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, userIndex++),
        password: hashedPassword,
        role: 'faculty',
        department: getRandomElement(departmentIds),
        registrationId: generateRegistrationId('faculty', i + 2),
        faceData: Math.random() > 0.3 ? [{
          imageId: `face_${Date.now()}_${i}`,
          imageUrl: `https://via.placeholder.com/300x300?text=Face+${i}`,
          imageKit_id: `imagekit_${Date.now()}_${i}`,
          createdAt: getRandomDateInRange(60, 0)
        }] : [],
        isActive: true
      });
    }

    // Create student users
    for (let i = 0; i < 99; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      users.push({
        name: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName, userIndex++),
        password: hashedPassword,
        role: 'student',
        department: getRandomElement(departmentIds),
        registrationId: generateRegistrationId('student', i + 2),
        faceData: Math.random() > 0.2 ? [{
          imageId: `face_${Date.now()}_${i}`,
          imageUrl: `https://via.placeholder.com/300x300?text=Face+${i}`,
          imageKit_id: `imagekit_${Date.now()}_${i}`,
          createdAt: getRandomDateInRange(90, 0)
        }] : [],
        isActive: Math.random() > 0.05 // 95% active users
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users (${users.filter(u => u.role === 'admin').length} admins, ${users.filter(u => u.role === 'faculty').length} faculty, ${users.filter(u => u.role === 'student').length} students)`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    return [];
  }
};

// Seed events
const seedEvents = async (departmentIds, userIds) => {
  try {
    const events = [];
    const organizers = userIds.filter(user => user.role === 'faculty' || user.role === 'admin');

    for (let i = 0; i < 25; i++) {
      const startDate = getRandomDateInRange(60, 30);
      const endDate = new Date(startDate.getTime() + (Math.random() * 5 + 1) * 24 * 60 * 60 * 1000); // 1-6 days duration
      const attendeeType = getRandomElement(['all', 'department', 'specific']);
      
      let eligibleDepartments = [];
      let eligibleUsers = [];
      
      if (attendeeType === 'department') {
        eligibleDepartments = [getRandomElement(departmentIds)];
      } else if (attendeeType === 'specific') {
        const numUsers = Math.floor(Math.random() * 20) + 10; // 10-30 specific users
        eligibleUsers = userIds
          .filter(u => u.role === 'student')
          .sort(() => 0.5 - Math.random())
          .slice(0, numUsers)
          .map(u => u._id);
      }

      events.push({
        name: getRandomElement(eventNames),
        description: `This is a detailed description for ${getRandomElement(eventNames)}. Join us for an amazing experience with learning opportunities and networking.`,
        startDate,
        endDate,
        location: getRandomElement(locations),
        department: getRandomElement(departmentIds),
        organizer: getRandomElement(organizers)._id,
        attendeeType,
        eligibleDepartments,
        eligibleUsers,
        qrCodeData: {
          value: `event_${Date.now()}_${i}`,
          expiresAt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Expires 1 day after event
          isActive: Math.random() > 0.3
        },
        maxAttendees: Math.floor(Math.random() * 200) + 50, // 50-250 attendees
        registrationDeadline: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before event
        isActive: Math.random() > 0.1 // 90% active events
      });
    }

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);
    return createdEvents;
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    return [];
  }
};

// Seed attendance records
const seedAttendance = async (userIds) => {
  try {
    const attendanceRecords = [];
    const students = userIds.filter(user => user.role === 'student' && user.isActive);
    const faculty = userIds.filter(user => user.role === 'faculty' && user.isActive);
    const allActiveUsers = [...students, ...faculty];

    // Generate attendance for the last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Random number of users attend each day (70-90% attendance rate)
      const attendingUsers = allActiveUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(allActiveUsers.length * (0.7 + Math.random() * 0.2)));

      for (const user of attendingUsers) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.random() * 2, Math.random() * 60); // 8-10 AM check-in

        const hasCheckOut = Math.random() > 0.1; // 90% have check-out
        const checkOutTime = hasCheckOut ? new Date(checkInTime.getTime() + (6 + Math.random() * 4) * 60 * 60 * 1000) : null; // 6-10 hours later

        attendanceRecords.push({
          user: user._id,
          date: new Date(date.setHours(0, 0, 0, 0)), // Start of day
          checkIn: {
            time: checkInTime,
            imageUrl: `https://via.placeholder.com/200x200?text=CheckIn+${user.name.split(' ')[0]}`,
            confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
            method: getRandomElement(['face_recognition', 'qr_code', 'manual']),
            location: getRandomElement(['Main Gate', 'Side Entrance', 'Faculty Block']),
            verified: Math.random() > 0.05 // 95% verified
          },
          checkOut: hasCheckOut ? {
            time: checkOutTime,
            imageUrl: `https://via.placeholder.com/200x200?text=CheckOut+${user.name.split(' ')[0]}`,
            confidence: 0.85 + Math.random() * 0.14,
            method: getRandomElement(['face_recognition', 'qr_code', 'manual']),
            location: getRandomElement(['Main Gate', 'Side Entrance', 'Faculty Block']),
            verified: Math.random() > 0.05
          } : null,
          totalHours: hasCheckOut ? Math.round(((checkOutTime - checkInTime) / (1000 * 60 * 60)) * 100) / 100 : null,
          status: Math.random() > 0.95 ? getRandomElement(['late', 'half-day', 'early-checkout']) : 'present',
          notes: Math.random() > 0.8 ? getRandomElement(['Late arrival', 'Early departure', 'Half day', 'Official work']) : null
        });
      }
    }

    const createdAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${createdAttendance.length} attendance records`);
    return createdAttendance;
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    return [];
  }
};

// Seed event attendance
const seedEventAttendance = async (eventIds, userIds) => {
  try {
    const eventAttendanceRecords = [];
    const activeUsers = userIds.filter(user => user.isActive);

    for (const event of eventIds) {
      // Determine eligible users based on event type
      let eligibleUsers = activeUsers;
      
      if (event.attendeeType === 'department') {
        eligibleUsers = activeUsers.filter(user => 
          event.eligibleDepartments.some(deptId => deptId.equals(user.department))
        );
      } else if (event.attendeeType === 'specific') {
        eligibleUsers = activeUsers.filter(user => 
          event.eligibleUsers.some(userId => userId.equals(user._id))
        );
      }

      // Random attendance rate for each event (40-80%)
      const attendanceRate = 0.4 + Math.random() * 0.4;
      const attendingUsers = eligibleUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(eligibleUsers.length * attendanceRate));

      for (const user of attendingUsers) {
        // Random check-in time during event duration
        const eventDuration = event.endDate - event.startDate;
        const checkedInAt = new Date(event.startDate.getTime() + Math.random() * eventDuration);
        
        eventAttendanceRecords.push({
          event: event._id,
          user: user._id,
          checkedInAt,
          checkedInBy: getRandomElement(userIds.filter(u => u.role === 'faculty' || u.role === 'admin'))._id,
          verified: Math.random() > 0.05, // 95% verified
          notes: Math.random() > 0.7 ? getRandomElement([
            'Excellent participation',
            'Active in discussions',
            'Left early',
            'Joined late',
            'Outstanding contribution'
          ]) : null
        });
      }
    }

    const createdEventAttendance = await EventAttendance.insertMany(eventAttendanceRecords);
    console.log(`✅ Created ${createdEventAttendance.length} event attendance records`);
    return createdEventAttendance;
  } catch (error) {
    console.error('❌ Error seeding event attendance:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearData();

    console.log('\n📊 Seeding data...');
    
    const createdDepartments = await seedDepartments();
    const departmentIds = createdDepartments.map(dept => dept._id);

    const createdUsers = await seedUsers(departmentIds);
    const userIds = createdUsers;

    const createdEvents = await seedEvents(departmentIds, userIds);
    const eventIds = createdEvents;

    await seedAttendance(userIds);
    await seedEventAttendance(eventIds, userIds);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Departments: ${createdDepartments.length}`);
    console.log(`   • Users: ${createdUsers.length}`);
    console.log(`   • Events: ${createdEvents.length}`);
    console.log(`   • Attendance Records: ${await Attendance.countDocuments()}`);
    console.log(`   • Event Attendance Records: ${await EventAttendance.countDocuments()}`);

    console.log('\n🔐 Hardcoded Login Credentials:');
    console.log('==========================================');
    console.log('👑 ADMIN LOGIN:');
    console.log('   Email: admin@college.edu');
    console.log('   Password: admin123');
    console.log('   Registration ID: ADMIN123');
    
    console.log('\n👨‍🏫 FACULTY LOGIN:');
    console.log('   Email: facultyfacerecognition@gmail.com');
    console.log('   Password: facultyface123');
    console.log('   Registration ID: FAC001');
    
    console.log('\n�‍🎓 STUDENT LOGIN:');
    console.log('   Email: facerecognition@gmail.com');
    console.log('   Password: facestudent123');
    console.log('   Registration ID: STU0001');
    console.log('==========================================');

    console.log('\n🔐 Default Login Credentials for other users:');
    console.log('   Email: Any generated email (check console output)');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
