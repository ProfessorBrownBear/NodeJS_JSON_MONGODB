// lab3-update-operations-fixed.js
// Updating documents with various methods and filters

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://user1:Orange11!a@cluster0.a1cvf3x.mongodb.net/collegeDB?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

console.log('✏️ Lab 3: Updating Documents with Filters\n');

// Define schemas
const studentSchema = new mongoose.Schema({
    studentId: String,
    name: String,
    email: String,
    program: String,
    gpa: Number,
    credits: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    lastModified: Date,
    notes: [String],
    contact: {
        phone: String,
        address: String
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Function to create test data
async function createTestData() {
    // Clear existing data
    await Student.deleteMany({});
    
    // Create test students
    const testStudents = [
        {
            studentId: 'S10001',
            name: 'Alice Johnson',
            email: 'alice@college.com',
            program: 'Web Development',
            gpa: 3.5,
            credits: 45,
            notes: []
        },
        {
            studentId: 'S10002',
            name: 'Bob Smith',
            email: 'bob@college.com',
            program: 'Data Science',
            gpa: 3.2,
            credits: 60,
            notes: []
        },
        {
            studentId: 'S10003',
            name: 'Carol Davis',
            email: 'carol@college.com',
            program: 'Mobile Development',
            gpa: 3.8,
            credits: 30,
            notes: []
        },
        {
            studentId: 'S10004',
            name: 'David Wilson',
            email: 'david@college.com',
            program: 'Web Development',
            gpa: 2.9,
            credits: 40,
            notes: []
        },
        {
            studentId: 'S10005',
            name: 'Emma Brown',
            email: 'emma@college.com',
            program: 'Data Science',
            gpa: 3.9,
            credits: 75,
            notes: []
        }
    ];
    
    await Student.insertMany(testStudents);
    console.log('✅ Created test data\n');
}

async function demonstrateUpdateOperations() {
    try {
        // First, ensure we have some data to work with
        console.log('🔧 Setting up test data...\n');
        await createTestData();
        
        // ============================================
        // PART 1: Basic Update Methods
        // ============================================
        
        console.log('📝 Part 1: Basic Update Methods\n');
        
        // Method 1: Find, modify, and save
        console.log('1. Find, modify, and save pattern:');
        const student1 = await Student.findOne({ studentId: 'S10001' });
        if (student1) {
            console.log(`   Before: ${student1.name}, GPA: ${student1.gpa}`);
            student1.gpa = 3.85;
            student1.lastModified = new Date();
            await student1.save();
            console.log(`   After: ${student1.name}, GPA: ${student1.gpa}`);
        }
        
        // Method 2: updateOne - updates first matching document
        console.log('\n2. updateOne - Update first matching document:');
        const updateResult = await Student.updateOne(
            { program: 'Web Development' },  // filter
            { 
                $set: { status: 'Active - Dean\'s List' },
                $inc: { credits: 3 }  // Increment credits by 3
            }
        );
        console.log(`   Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
        
        // Method 3: updateMany - updates all matching documents
        console.log('\n3. updateMany - Update all matching documents:');
        const updateManyResult = await Student.updateMany(
            { gpa: { $gte: 3.5 } },  // filter: all students with GPA >= 3.5
            { 
                $set: { status: 'Honor Student' },
                $currentDate: { lastModified: true }  // Set to current date
            }
        );
        console.log(`   Matched: ${updateManyResult.matchedCount}, Modified: ${updateManyResult.modifiedCount}`);
        
        // Method 4: findOneAndUpdate - returns the document
        console.log('\n4. findOneAndUpdate - Update and return document:');
        const updatedStudent = await Student.findOneAndUpdate(
            { studentId: 'S10002' },
            { 
                $set: { program: 'Full Stack Development' },
                $inc: { gpa: 0.1 }  // Increase GPA by 0.1
            },
            { 
                new: true,  // Return updated document (not original)
                runValidators: true  // Run schema validation
            }
        );
        if (updatedStudent) {
            console.log(`   Updated: ${updatedStudent.name} - New program: ${updatedStudent.program}, New GPA: ${updatedStudent.gpa}`);
        }
        
        // ============================================
        // PART 2: Update Operators
        // ============================================
        
        console.log('\n🔧 Part 2: Update Operators\n');
        
        // $set - Set field values
        console.log('1. $set operator:');
        await Student.updateOne(
            { studentId: 'S10003' },
            { 
                $set: { 
                    'contact.phone': '555-1234',
                    'contact.address': '123 College St'
                }
            }
        );
        console.log('   Updated contact information');
        
        // $unset - Remove fields
        console.log('\n2. $unset operator:');
        await Student.updateOne(
            { studentId: 'S10003' },
            { $unset: { 'contact.address': '' } }  // Removes the address field
        );
        console.log('   Removed address field');
        
        // $inc - Increment numeric values
        console.log('\n3. $inc operator:');
        await Student.updateMany(
            { program: 'Data Science' },
            { $inc: { credits: 4, gpa: -0.1 } }  // Add 4 credits, decrease GPA by 0.1
        );
        console.log('   Incremented credits and adjusted GPA for Data Science students');
        
        // $mul - Multiply numeric values
        console.log('\n4. $mul operator:');
        await Student.updateOne(
            { studentId: 'S10004' },
            { $mul: { credits: 1.5 } }  // Multiply credits by 1.5
        );
        console.log('   Multiplied credits by 1.5');
        
        // $min and $max - Update only if value is less/greater
        console.log('\n5. $min and $max operators:');
        await Student.updateMany(
            {},
            { 
                $min: { gpa: 4.0 },  // Ensure GPA doesn't exceed 4.0
                $max: { credits: 0 }  // Ensure credits isn't negative
            }
        );
        console.log('   Applied GPA cap and credit floor');
        
        // ============================================
        // PART 3: Array Update Operators
        // ============================================
        
        console.log('\n📚 Part 3: Array Update Operators\n');
        
        // $push - Add element to array
        console.log('1. $push operator:');
        await Student.updateOne(
            { studentId: 'S10001' },
            { $push: { notes: 'Excellent performance in midterms' } }
        );
        console.log('   Added note to student');
        
        // $addToSet - Add unique element to array
        console.log('\n2. $addToSet operator:');
        await Student.updateOne(
            { studentId: 'S10001' },
            { 
                $addToSet: { 
                    notes: { 
                        $each: ['Dean\'s List Fall 2024', 'Excellent performance in midterms'] 
                    }
                } 
            }
        );
        console.log('   Added unique notes (no duplicates)');
        
        // $pull - Remove elements from array
        console.log('\n3. $pull operator:');
        await Student.updateOne(
            { studentId: 'S10001' },
            { $pull: { notes: 'Excellent performance in midterms' } }
        );
        console.log('   Removed specific note');
        
        // $pop - Remove first or last element
        console.log('\n4. $pop operator:');
        await Student.updateOne(
            { studentId: 'S10001' },
            { $pop: { notes: -1 } }  // -1 removes first, 1 removes last
        );
        console.log('   Removed first note from array');
        
        // ============================================
        // PART 4: Conditional Updates
        // ============================================
        
        console.log('\n🎯 Part 4: Conditional Updates\n');
        
        // Update with complex conditions
        console.log('1. Update based on current values:');
        const conditionalUpdate = await Student.updateMany(
            { 
                gpa: { $gte: 3.7 },
                credits: { $gte: 60 }
            },
            { 
                $set: { status: 'Graduation Candidate - Honors' }
            }
        );
        console.log(`   Updated ${conditionalUpdate.modifiedCount} high-achieving students`);
        
        // Bulk updates with different conditions
        console.log('\n2. Bulk updates with bulkWrite:');
        const bulkOps = await Student.bulkWrite([
            {
                updateMany: {
                    filter: { gpa: { $lt: 2.0 } },
                    update: { $set: { status: 'Academic Probation' } }
                }
            },
            {
                updateMany: {
                    filter: { gpa: { $gte: 2.0, $lt: 3.0 } },
                    update: { $set: { status: 'Good Standing' } }
                }
            },
            {
                updateMany: {
                    filter: { gpa: { $gte: 3.0 } },
                    update: { $set: { status: 'Excellent Standing' } }
                }
            }
        ]);
        console.log(`   Bulk operation results:`, bulkOps);
        
        // ============================================
        // PART 5: Upsert Operations
        // ============================================
        
        console.log('\n🔄 Part 5: Upsert Operations\n');
        
        // Upsert - Update if exists, insert if not
        console.log('1. Upsert example:');
        const upsertResult = await Student.updateOne(
            { studentId: 'S99999' },  // This student doesn't exist
            { 
                $set: {
                    name: 'New Student',
                    email: 'new.student@college.com',
                    program: 'Web Development',
                    gpa: 3.0
                },
                $setOnInsert: {  // Only set these on insert, not update
                    enrollmentDate: new Date(),
                    credits: 0
                }
            },
            { upsert: true }
        );
        console.log(`   Upserted: ${upsertResult.upsertedCount > 0 ? 'Created new document' : 'Updated existing'}`);
        
        // ============================================
        // PART 6: Show Final Results
        // ============================================
        
        console.log('\n📊 Final Results Sample:\n');
        const finalResults = await Student.find()
            .select('studentId name program gpa credits status notes')
            .sort('studentId');
            
        console.log('All students after updates:');
        finalResults.forEach(student => {
            console.log(`\n${student.studentId}: ${student.name}`);
            console.log(`   Program: ${student.program}`);
            console.log(`   GPA: ${student.gpa}, Credits: ${student.credits}`);
            console.log(`   Status: ${student.status}`);
            if (student.notes && student.notes.length > 0) {
                console.log(`   Notes: ${student.notes.join(', ')}`);
            }
        });
        
        console.log('\n💡 Key Learning Points:');
        console.log('1. Multiple update methods: save(), updateOne(), updateMany(), findOneAndUpdate()');
        console.log('2. Update operators: $set, $unset, $inc, $mul, $min, $max');
        console.log('3. Array operators: $push, $addToSet, $pull, $pop');
        console.log('4. Upsert creates document if it doesn\'t exist');
        console.log('5. bulkWrite() enables multiple operations in one call');
        
    } catch (error) {
        console.error('❌ Error in update operations:', error.message);
        if (error.code === 11000) {
            console.error('   Duplicate key error');
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
        
        console.log('\n🚀 Starting update operations demo...\n');
        
        // Run the update operations
        await demonstrateUpdateOperations();
        
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
