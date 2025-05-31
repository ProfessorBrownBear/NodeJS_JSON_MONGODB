###        Lab Example 4: Deleting Documents with Filters
                                                                                                                                                                                                                                                                                                                                            
// lab4-delete-operations.js
// Deleting documents with various methods and filters

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/collegeDB?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI);

console.log('🗑️ Lab 4: Deleting Documents with Filters\n');

// Define schemas
const studentSchema = new mongoose.Schema({
    studentId: String,
    name: String,
    email: String,
    program: String,
    gpa: Number,
    status: String,
    isActive: { type: Boolean, default: true },
    graduationYear: Number,
    deletedAt: Date,  // For soft delete
    deletedBy: String  // For soft delete tracking
}, { timestamps: true });

// Add a pre-remove hook
studentSchema.pre('remove', function(next) {
    console.log(`   🔔 Pre-remove hook: About to delete ${this.name}`);
    next();
});

const Student = mongoose.model('Student', studentSchema);

// Archive schema for demonstrating data preservation
const studentArchiveSchema = new mongoose.Schema({
    originalId: mongoose.Schema.Types.ObjectId,
    studentData: Object,
    deletedAt: { type: Date, default: Date.now },
    reason: String
});

const StudentArchive = mongoose.model('StudentArchive', studentArchiveSchema);

async function demonstrateDeleteOperations() {
    try {
        // Setup: Create test data
        console.log('🔧 Creating test data for deletion examples...\n');
        
        await Student.deleteMany({}); // Clear existing data
        
        const testStudents = await Student.insertMany([
            { studentId: 'S30001', name: 'Alice Johnson', program: 'Web Development', gpa: 3.8, graduationYear: 2020 },
            { studentId: 'S30002', name: 'Bob Smith', program: 'Data Science', gpa: 2.5, graduationYear: 2021 },
            { studentId: 'S30003', name: 'Carol Davis', program: 'Web Development', gpa: 3.2, graduationYear: 2022 },
            { studentId: 'S30004', name: 'David Wilson', program: 'Mobile Development', gpa: 1.8, status: 'Withdrawn' },
            { studentId: 'S30005', name: 'Emma Brown', program: 'Data Science', gpa: 3.9, graduationYear: 2023 },
            { studentId: 'S30006', name: 'Frank Miller', program: 'Web Development', gpa: 2.1, status: 'Academic Probation' },
            { studentId: 'S30007', name: 'Grace Lee', program: 'Full Stack Development', gpa: 3.5 },
            { studentId: 'S30008', name: 'Henry Taylor', program: 'Mobile Development', gpa: 1.5, status: 'Withdrawn' }
        ]);
        
        console.log(`✅ Created ${testStudents.length} test students\n`);
        
        // ============================================
        // PART 1: Basic Delete Methods
        // ============================================
        
        console.log('🗑️ Part 1: Basic Delete Methods\n');
        
        // Show initial count
        let count = await Student.countDocuments();
        console.log(`Starting with ${count} students\n`);
        
        // Method 1: deleteOne - Deletes first matching document
        console.log('1. deleteOne - Delete first matching document:');
        const deleteOneResult = await Student.deleteOne({ gpa: { $lt: 2.0 } });
        console.log(`   Deleted ${deleteOneResult.deletedCount} student with GPA < 2.0`);
        
        // Method 2: deleteMany - Deletes all matching documents
        console.log('\n2. deleteMany - Delete multiple documents:');
        const deleteManyResult = await Student.deleteMany({ 
            graduationYear: { $lt: 2022 } 
        });
        console.log(`   Deleted ${deleteManyResult.deletedCount} students who graduated before 2022`);
        
        // Method 3: findOneAndDelete - Returns the deleted document
        console.log('\n3. findOneAndDelete - Delete and return document:');
        const deletedStudent = await Student.findOneAndDelete(
            { status: 'Withdrawn' },
            { sort: { gpa: 1 } }  // Delete the one with lowest GPA
        );
        if (deletedStudent) {
            console.log(`   Deleted: ${deletedStudent.name} (GPA: ${deletedStudent.gpa})`);
        }
        
        // Method 4: findByIdAndDelete
        console.log('\n4. findByIdAndDelete:');
        const remainingStudent = await Student.findOne();
        if (remainingStudent) {
            const deletedById = await Student.findByIdAndDelete(remainingStudent._id);
            console.log(`   Deleted by ID: ${deletedById.name}`);
        }
        
        // Method 5: Document remove method
        console.log('\n5. Document remove method:');
        const studentToRemove = await Student.findOne({ program: 'Web Development' });
        if (studentToRemove) {
            await studentToRemove.remove();  // Triggers pre-remove hook
            console.log(`   Removed using document method`);
        }
        
        // Show remaining count
        count = await Student.countDocuments();
        console.log(`\n📊 Remaining students: ${count}`);
        
        // ============================================
        // PART 2: Soft Delete Pattern
        // ============================================
        
        console.log('\n♻️ Part 2: Soft Delete Pattern\n');
        
        // Re-seed data for soft delete examples
        await Student.deleteMany({});
        await Student.insertMany([
            { studentId: 'S40001', name: 'John Doe', program: 'Web Development', gpa: 3.5 },
            { studentId: 'S40002', name: 'Jane Smith', program: 'Data Science', gpa: 3.8 },
            { studentId: 'S40003', name: 'Mike Johnson', program: 'Mobile Development', gpa: 2.9 }
        ]);
        
        // Implement soft delete
        console.log('1. Soft delete implementation:');
        const softDeleteResult = await Student.updateMany(
            { gpa: { $lt: 3.0 } },
            { 
                $set: { 
                    isActive: false,
                    deletedAt: new Date(),
                    deletedBy: 'System - Low GPA'
                }
            }
        );
        console.log(`   Soft deleted ${softDeleteResult.modifiedCount} students`);
        
        // Query excluding soft deleted
        console.log('\n2. Query active students only:');
        const activeStudents = await Student.find({ isActive: true });
        console.log(`   Active students: ${activeStudents.length}`);
        activeStudents.forEach(s => console.log(`     - ${s.name}`));
        
        // Show all including soft deleted
        console.log('\n3. All students (including soft deleted):');
        const allStudents = await Student.find();
        allStudents.forEach(s => {
            console.log(`     - ${s.name}: ${s.isActive ? 'Active' : 'Deleted on ' + s.deletedAt}`);
        });
        
        // ============================================
        // PART 3: Archive Before Delete
        // ============================================
        
        console.log('\n📦 Part 3: Archive Before Delete Pattern\n');
        
        // Function to archive and delete
        async function archiveAndDelete(filter, reason) {
            // Find documents to archive
            const toArchive = await Student.find(filter);
            
            if (toArchive.length > 0) {
                // Archive documents
                const archives = toArchive.map(student => ({
                    originalId: student._id,
                    studentData: student.toObject(),
                    reason: reason
                }));
                
                await StudentArchive.insertMany(archives);
                console.log(`   📦 Archived ${archives.length} students`);
                
                // Now delete them
                const deleteResult = await Student.deleteMany(filter);
                console.log(`   🗑️ Deleted ${deleteResult.deletedCount} students`);
                
                return deleteResult;
            }
            
            return { deletedCount: 0 };
        }
        
        // Use the archive function
        console.log('1. Archive and delete inactive students:');
        await archiveAndDelete(
            { isActive: false },
            'Inactive student cleanup'
        );
        
        // Show archived data
        console.log('\n2. View archived students:');
        const archived = await StudentArchive.find();
        archived.forEach(a => {
            console.log(`   📁 ${a.studentData.name} - Archived: ${a.deletedAt.toLocaleDateString()}`);
            console.log(`      Reason: ${a.reason}`);
        });
        
        // ============================================
        // PART 4: Bulk Delete Operations
        // ============================================
        
        console.log('\n📋 Part 4: Bulk Delete Operations\n');
        
        // Re-seed for bulk operations
        await Student.deleteMany({});
        const bulkStudents = [];
        for (let i = 1; i <= 20; i++) {
            bulkStudents.push({
                studentId: `S5000${i}`,
                name: `Student ${i}`,
                program: ['Web Development', 'Data Science', 'Mobile Development'][i % 3],
                gpa: 2.0 + (Math.random() * 2),
                graduationYear: 2020 + (i % 5)
            });
        }
        await Student.insertMany(bulkStudents);
        
        console.log('1. Bulk delete with multiple conditions:');
        const bulkDeleteOps = await Student.bulkWrite([
            {
                deleteMany: {
                    filter: { gpa: { $lt: 2.5 }, graduationYear: 2020 }
                }
            },
            {
                deleteMany: {
                    filter: { program: 'Mobile Development', gpa: { $lt: 3.0 } }
                }
            },
            {
                deleteOne: {
                    filter: { studentId: 'S50005' }
                }
            }
        ]);
        
        console.log('   Bulk operation results:', bulkDeleteOps);
        
        // ============================================
        // PART 5: Delete with Relationships
        // ============================================
        
        console.log('\n🔗 Part 5: Handling Related Data on Delete\n');
        
        // Enrollment schema to demonstrate cascading
        const enrollmentSchema = new mongoose.Schema({
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
            course: String,
            semester: String
        });
        
        const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
        
        // Create a student and related enrollments
        const newStudent = await Student.create({
            studentId: 'S60001',
            name: 'Test Student',
            program: 'Web Development',
            gpa: 3.5
        });
        
        await Enrollment.insertMany([
            { student: newStudent._id, course: 'WEB101', semester: 'Fall 2024' },
            { student: newStudent._id, course: 'WEB102', semester: 'Fall 2024' }
        ]);
        
        console.log('1. Check related data before delete:');
        const relatedEnrollments = await Enrollment.countDocuments({ student: newStudent._id });
        console.log(`   Student has ${relatedEnrollments} enrollments`);
        
        // Delete with cascade
        console.log('\n2. Cascading delete (manual):');
        await Enrollment.deleteMany({ student: newStudent._id });
        await Student.deleteOne({ _id: newStudent._id });
        console.log('   Deleted student and related enrollments');
        
        // Final statistics
        console.log('\n📊 Final Statistics:');
        const finalCount = await Student.countDocuments();
        const archiveCount = await StudentArchive.countDocuments();
        const enrollmentCount = await Enrollment.countDocuments();
        
        console.log(`   Active students: ${finalCount}`);
        console.log(`   Archived students: ${archiveCount}`);
        console.log(`   Remaining enrollments: ${enrollmentCount}`);
        
        console.log('\n💡 Key Learning Points:');
        console.log('1. Delete methods: deleteOne(), deleteMany(), findOneAndDelete()');
        console.log('2. Soft delete pattern preserves data while marking as deleted');
        console.log('3. Archive before delete ensures data recovery is possible');
        console.log('4. Always handle related data before deleting parent documents');
        console.log('5. bulkWrite() enables efficient multiple delete operations');
        console.log('6. Pre-remove hooks can perform cleanup before deletion');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the demonstration
async function runLab() {
    try {
        await demonstrateDeleteOperations();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Connection closed');
    }
}

runLab();
                                                                                                                                                                                                                                                                                                                                                                                                                                    
