// lab1-create-operations-fixed.js
// Creating documents, schemas, and understanding collections

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://user1:Orange11!a@cluster0.a1cvf3x.mongodb.net/collegeDB?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

console.log('🔧 Lab 1: Creating Documents and Understanding Schemas\n');

// ============================================
// PART 1: Define Schemas with Validation
// ============================================

console.log('📋 Part 1: Defining Schemas with Validation Rules\n');

// Student Schema with comprehensive validation
const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        match: [/^S\d{5}$/, 'Student ID must be S followed by 5 digits (e.g., S12345)'],
        index: true  // Creates an index for faster queries
    },
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,  // Removes whitespace
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Automatically converts to lowercase
        validate: {
            validator: function(email) {
                return /^\S+@\S+\.\S+$/.test(email);
            },
            message: 'Please enter a valid email address'
        }
    },
    program: {
        type: String,
        required: true,
        enum: {
            values: ['Web Development', 'Mobile Development', 'Data Science', 'Full Stack Development'],
            message: '{VALUE} is not a valid program'
        }
    },
    enrollmentDate: {
        type: Date,
        default: Date.now  // Automatically sets current date
    },
    gpa: {
        type: Number,
        min: [0, 'GPA cannot be negative'],
        max: [4.0, 'GPA cannot exceed 4.0'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt automatically
    collection: 'students'  // Explicitly set collection name
});

// Course Schema
const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true  // Automatically converts to uppercase
    },
    title: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    }
});

// Create models
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// ============================================
// PART 2: Different Ways to Create Documents
// ============================================

async function demonstrateCreateOperations() {
    try {
        console.log('📝 Part 2: Different Ways to Create Documents\n');
        
        // Method 1: Create and save separately
        console.log('Method 1: Using new Model() and save()');
        const student1 = new Student({
            studentId: 'S20001',
            name: 'Emma Wilson',
            email: 'emma.wilson@college.com',
            program: 'Web Development',
            gpa: 3.8
        });
        
        // save() returns the saved document
        const savedStudent1 = await student1.save();
        console.log('✅ Created:', savedStudent1.name, '- ID:', savedStudent1._id);
        
        // Method 2: Create directly with Model.create()
        console.log('\nMethod 2: Using Model.create()');
        const student2 = await Student.create({
            studentId: 'S20002',
            name: 'James Chen',
            email: 'james.chen@college.com',
            program: 'Data Science',
            gpa: 3.9
        });
        console.log('✅ Created:', student2.name, '- ID:', student2._id);
        
        // Method 3: Create multiple documents with insertMany()
        console.log('\nMethod 3: Using Model.insertMany() for bulk creation');
        const multipleStudents = await Student.insertMany([
            {
                studentId: 'S20003',
                name: 'Sofia Rodriguez',
                email: 'sofia.r@college.com',
                program: 'Mobile Development',
                gpa: 3.7
            },
            {
                studentId: 'S20004',
                name: 'Michael Brown',
                email: 'michael.b@college.com',
                program: 'Full Stack Development',
                gpa: 3.5
            },
            {
                studentId: 'S20005',
                name: 'Lisa Wang',
                email: 'lisa.wang@college.com',
                program: 'Web Development',
                gpa: 3.9
            }
        ], { 
            ordered: true  // Stop on first error
        });
        console.log(`✅ Created ${multipleStudents.length} students in bulk`);
        
        // Method 4: Create with validation error handling
        console.log('\nMethod 4: Handling validation errors');
        try {
            await Student.create({
                studentId: 'INVALID',  // This will fail validation
                name: 'Test Student',
                email: 'test@college.com',
                program: 'Web Development'
            });
        } catch (error) {
            console.log('❌ Validation Error caught:', error.message);
            if (error.errors) {
                Object.keys(error.errors).forEach(field => {
                    console.log(`   ${field}: ${error.errors[field].message}`);
                });
            }
        }
        
        // Method 5: Create with some fields missing (using defaults)
        console.log('\nMethod 5: Creating with default values');
        const student5 = await Student.create({
            studentId: 'S20006',
            name: 'David Lee',
            email: 'david.lee@college.com',
            program: 'Data Science'
            // Notice: gpa not provided, will use default of 0
            // enrollmentDate not provided, will use current date
            // isActive not provided, will use default of true
        });
        console.log('✅ Created with defaults:', student5.name);
        console.log('   Default GPA:', student5.gpa);
        console.log('   Default enrollment date:', student5.enrollmentDate);
        console.log('   Default active status:', student5.isActive);
        
        // Create some courses
        console.log('\n📚 Creating courses...');
        const courses = await Course.insertMany([
            { courseCode: 'WEB101', title: 'Introduction to Web Development', credits: 3 },
            { courseCode: 'DATA201', title: 'Data Structures', credits: 4 },
            { courseCode: 'MOB301', title: 'Mobile App Development', credits: 3 }
        ]);
        console.log(`✅ Created ${courses.length} courses`);
        
        // ============================================
        // PART 3: Understanding Collections
        // ============================================
        
        console.log('\n🗂️ Part 3: Understanding Collections\n');
        
        // Collections are created automatically when first document is inserted
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections in database:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Check document count in each collection
        const studentCount = await Student.countDocuments();
        const courseCount = await Course.countDocuments();
        console.log(`\n📊 Document counts:`);
        console.log(`   Students: ${studentCount}`);
        console.log(`   Courses: ${courseCount}`);
        
        // Display all created students
        console.log('\n📊 Summary of all created students:');
        const allStudents = await Student.find().sort('studentId');
        console.log(`Total students in database: ${allStudents.length}`);
        
        console.log('\n📋 Student List:');
        allStudents.forEach(student => {
            console.log(`   ${student.studentId}: ${student.name} - ${student.program} (GPA: ${student.gpa})`);
        });
        
        // Show schema validation in action
        console.log('\n🛡️ Schema Validation Examples:');
        
        // Email validation
        try {
            await Student.create({
                studentId: 'S20007',
                name: 'Invalid Email Test',
                email: 'not-an-email',  // Invalid email format
                program: 'Web Development'
            });
        } catch (error) {
            console.log('❌ Email validation failed:', error.errors.email.message);
        }
        
        // Program enum validation
        try {
            await Student.create({
                studentId: 'S20008',
                name: 'Invalid Program Test',
                email: 'test2@college.com',
                program: 'Invalid Program'  // Not in enum
            });
        } catch (error) {
            console.log('❌ Program validation failed:', error.errors.program.message);
        }
        
        // GPA range validation
        try {
            await Student.create({
                studentId: 'S20009',
                name: 'Invalid GPA Test',
                email: 'test3@college.com',
                program: 'Web Development',
                gpa: 5.0  // Exceeds maximum
            });
        } catch (error) {
            console.log('❌ GPA validation failed:', error.errors.gpa.message);
        }
        
        // ============================================
        // PART 4: Schema Methods and Virtuals
        // ============================================
        
        console.log('\n🔧 Part 4: Schema Features\n');
        
        // Add instance method to schema
        studentSchema.methods.getInfo = function() {
            return `${this.name} (${this.studentId}) - ${this.program}`;
        };
        
        // Add static method to schema
        studentSchema.statics.findByProgram = function(program) {
            return this.find({ program: program });
        };
        
        // Add virtual property
        studentSchema.virtual('isHonorStudent').get(function() {
            return this.gpa >= 3.5;
        });
        
        // Since we already created the model, let's demonstrate with existing data
        const studentForDemo = await Student.findOne({ studentId: 'S20001' });
        if (studentForDemo) {
            console.log('Student info:', `${studentForDemo.name} (${studentForDemo.studentId}) - ${studentForDemo.program}`);
            console.log('Is honor student (GPA >= 3.5):', studentForDemo.gpa >= 3.5);
        }
        
        const webDevStudents = await Student.find({ program: 'Web Development' });
        console.log(`\nFound ${webDevStudents.length} Web Development students`);
        
        console.log('\n💡 Key Learning Points:');
        console.log('1. Schemas define structure, validation, and behavior');
        console.log('2. Multiple ways to create documents: new/save, create(), insertMany()');
        console.log('3. Collections are created automatically on first insert');
        console.log('4. Validation runs before saving to database');
        console.log('5. Schemas can have methods, statics, and virtuals');
        
        console.log('\n✨ Create operations completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in create operations:', error.message);
        if (error.code === 11000) {
            console.error('   Duplicate key error - a unique field already exists');
            console.error('   This might happen if you run the script multiple times');
        }
    }
}

// Main function to run everything
async function main() {
    try {
        // Wait for connection to be established
        await new Promise(resolve => {
            if (mongoose.connection.readyState === 1) {
                resolve();
            } else {
                mongoose.connection.once('open', resolve);
            }
        });
        
        console.log('\n🚀 Starting document creation demo...\n');
        
        // Optional: Clear existing students to start fresh
        console.log('🧹 Clearing existing data...');
        await Student.deleteMany({});
        await Course.deleteMany({});
        console.log('✅ Collections cleared\n');
        
        // Run the create operations
        await demonstrateCreateOperations();
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('\n👋 Connection closed');
    }
}

// Run the main function
main();
