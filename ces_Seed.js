// seed-data.js
// Fixed version - Run this file to populate the database with test data
// Usage: node seed-data.js

const mongoose = require('mongoose');

// REPLACE WITH YOUR CONNECTION STRING
const MONGODB_URI = 'mongodb+srv://user1:Orange11!a@cluster0.a1cvf3x.mongodb.net/collegeDB?retryWrites=true&w=majority';

// Define schemas (must match exactly with main application)
const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        match: [/^S\d{5}$/, 'Invalid student ID format']
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    program: {
        type: String,
        required: true,
        enum: ['Web Development', 'Mobile Development', 'Data Science', 'Full Stack Development']
    },
    enrollmentDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^[A-Z]{4}\d{4}$/, 'Invalid course code format']
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 500 },
    credits: { type: Number, required: true, min: 1, max: 4 },
    instructor: { type: String, required: true, trim: true },
    maxStudents: { type: Number, default: 30, min: 1 },
    isOffered: { type: Boolean, default: true }
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: {
        type: String,
        required: true,
        enum: ['Fall 2024', 'Winter 2025', 'Spring 2025', 'Summer 2025']
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'In Progress', 'Withdrawn'],
        default: 'In Progress'
    },
    enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// Sample data
const sampleStudents = [
    {
        studentId: 'S10001',
        name: 'Alice Johnson',
        email: 'alice.johnson@college.com',
        program: 'Full Stack Development'
    },
    {
        studentId: 'S10002',
        name: 'Bob Smith',
        email: 'bob.smith@college.com',
        program: 'Web Development'
    },
    {
        studentId: 'S10003',
        name: 'Carol Davis',
        email: 'carol.davis@college.com',
        program: 'Mobile Development'
    },
    {
        studentId: 'S10004',
        name: 'David Wilson',
        email: 'david.wilson@college.com',
        program: 'Data Science'
    },
    {
        studentId: 'S10005',
        name: 'Emma Brown',
        email: 'emma.brown@college.com',
        program: 'Full Stack Development'
    },
    {
        studentId: 'S10006',
        name: 'Frank Miller',
        email: 'frank.miller@college.com',
        program: 'Web Development'
    },
    {
        studentId: 'S10007',
        name: 'Grace Lee',
        email: 'grace.lee@college.com',
        program: 'Mobile Development'
    },
    {
        studentId: 'S10008',
        name: 'Henry Taylor',
        email: 'henry.taylor@college.com',
        program: 'Data Science'
    }
];

const sampleCourses = [
    {
        courseCode: 'MADS4012',
        title: 'Full Stack Web Development',
        description: 'Learn to build modern web applications using Node.js, Express, and MongoDB.',
        credits: 3,
        instructor: 'Prof. Anderson',
        maxStudents: 25
    },
    {
        courseCode: 'COMP1001',
        title: 'Introduction to Programming',
        description: 'Fundamentals of programming using JavaScript.',
        credits: 3,
        instructor: 'Prof. Williams',
        maxStudents: 30
    },
    {
        courseCode: 'DATA2001',
        title: 'Database Management Systems',
        description: 'Study both SQL and NoSQL databases.',
        credits: 4,
        instructor: 'Prof. Davis',
        maxStudents: 20
    },
    {
        courseCode: 'WEBD3000',
        title: 'Advanced Frontend Development',
        description: 'Master React, Vue, and modern CSS frameworks.',
        credits: 3,
        instructor: 'Prof. Martinez',
        maxStudents: 25
    },
    {
        courseCode: 'MOBL2005',
        title: 'Mobile App Development',
        description: 'Create native and cross-platform mobile applications.',
        credits: 3,
        instructor: 'Prof. Thompson',
        maxStudents: 20
    },
    {
        courseCode: 'SECU3001',
        title: 'Web Security Fundamentals',
        description: 'Learn about common security vulnerabilities.',
        credits: 2,
        instructor: 'Prof. Roberts',
        maxStudents: 30
    },
    {
        courseCode: 'APIS4001',
        title: 'RESTful API Design',
        description: 'Design and implement scalable RESTful APIs.',
        credits: 3,
        instructor: 'Prof. Chen',
        maxStudents: 25
    },
    {
        courseCode: 'DEVP4500',
        title: 'DevOps and Deployment',
        description: 'Learn CI/CD, containerization with Docker.',
        credits: 3,
        instructor: 'Prof. Kumar',
        maxStudents: 20
    }
];

// Main seeding function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...');
        console.log('⏰ Time:', new Date().toLocaleTimeString());
        
        // Connect to MongoDB
        console.log('\n🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');
        console.log('📍 Database:', mongoose.connection.db.databaseName);
        
        // Clear existing data
        console.log('\n📦 Clearing existing data...');
        const deleteResults = await Promise.all([
            Student.deleteMany({}),
            Course.deleteMany({}),
            Enrollment.deleteMany({})
        ]);
        console.log(`   Deleted ${deleteResults[0].deletedCount} students`);
        console.log(`   Deleted ${deleteResults[1].deletedCount} courses`);
        console.log(`   Deleted ${deleteResults[2].deletedCount} enrollments`);
        
        // Insert students
        console.log('\n👥 Inserting students...');
        const students = await Student.insertMany(sampleStudents);
        console.log(`✅ Inserted ${students.length} students`);
        
        // Insert courses
        console.log('\n📚 Inserting courses...');
        const courses = await Course.insertMany(sampleCourses);
        console.log(`✅ Inserted ${courses.length} courses`);
        
        // Create enrollments
        console.log('\n📝 Creating enrollments...');
        const enrollments = [];
        
        // Enroll first 4 students in Fall 2024 courses
        for (let i = 0; i < 4; i++) {
            const courseCount = 3 + Math.floor(Math.random() * 2); // 3-4 courses each
            const selectedCourses = [...courses]
                .sort(() => 0.5 - Math.random())
                .slice(0, courseCount);
            
            for (const course of selectedCourses) {
                enrollments.push({
                    student: students[i]._id,
                    course: course._id,
                    semester: 'Fall 2024',
                    grade: i < 2 ? 'In Progress' : ['A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 4)]
                });
            }
        }
        
        // Enroll remaining students in Winter 2025 courses
        for (let i = 4; i < 8; i++) {
            const courseCount = 2 + Math.floor(Math.random() * 2); // 2-3 courses each
            const selectedCourses = [...courses]
                .sort(() => 0.5 - Math.random())
                .slice(0, courseCount);
            
            for (const course of selectedCourses) {
                enrollments.push({
                    student: students[i]._id,
                    course: course._id,
                    semester: 'Winter 2025',
                    grade: 'In Progress'
                });
            }
        }
        
        const createdEnrollments = await Enrollment.insertMany(enrollments);
        console.log(`✅ Created ${createdEnrollments.length} enrollments`);
        
        // Verify data was inserted
        console.log('\n📊 Verifying data...');
        const counts = await Promise.all([
            Student.countDocuments(),
            Course.countDocuments(),
            Enrollment.countDocuments()
        ]);
        
        console.log(`   Students in database: ${counts[0]}`);
        console.log(`   Courses in database: ${counts[1]}`);
        console.log(`   Enrollments in database: ${counts[2]}`);
        
        // Show sample data
        console.log('\n📋 Sample data for testing:');
        console.log('\n🎓 Sample Students:');
        const sampleStudentList = await Student.find().limit(3).select('studentId name email');
        sampleStudentList.forEach(s => {
            console.log(`   ${s.studentId}: ${s.name} (${s.email})`);
        });
        
        console.log('\n📚 Sample Courses:');
        const sampleCourseList = await Course.find().limit(3).select('courseCode title credits');
        sampleCourseList.forEach(c => {
            console.log(`   ${c.courseCode}: ${c.title} (${c.credits} credits)`);
        });
        
        console.log('\n✅ Database seeded successfully!');
        console.log('🚀 You can now run the main application: node college-system.js');
        
    } catch (error) {
        console.error('\n❌ Error seeding database:', error.message);
        if (error.code === 11000) {
            console.error('🔍 Duplicate key error - data may already exist');
        }
        throw error;
    } finally {
        // Always close the connection
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Execute the seed function
seedDatabase()
    .then(() => {
        console.log('✨ Seed script completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Seed script failed:', err);
        process.exit(1);
    });
