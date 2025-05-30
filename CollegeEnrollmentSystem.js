// CollegeEnrollmentSystem.js
// Complete web application for College Enrollment System with forms and UI

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB connection string - REPLACE WITH YOUR OWN
const MONGODB_URI = 'mongodb+srv://xxx/collegeDB?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('✅ Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

// ============================================
// SCHEMAS AND MODELS
// ============================================

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        match: [/^S\d{5}$/, 'Student ID must be S followed by 5 digits']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    program: {
        type: String,
        required: true,
        enum: ['Web Development', 'Mobile Development', 'Data Science', 'Full Stack Development']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^[A-Z]{4}\d{4}$/, 'Course code must be 4 letters followed by 4 digits']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    instructor: {
        type: String,
        required: true,
        trim: true
    },
    maxStudents: {
        type: Number,
        default: 30,
        min: 1
    },
    isOffered: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: String,
        required: true,
        enum: ['Fall 2024', 'Winter 2025', 'Spring 2025', 'Summer 2025']
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'In Progress', 'Withdrawn'],
        default: 'In Progress'
    }
}, { timestamps: true });

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Auto-populate
enrollmentSchema.pre(/^find/, function() {
    this.populate('student').populate('course');
});

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ============================================
// HTML TEMPLATE
// ============================================

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>College Enrollment System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .tab-button {
            padding: 10px 20px;
            border: none;
            background: #3498db;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
            transition: background 0.3s;
        }
        
        .tab-button:hover {
            background: #2980b9;
        }
        
        .tab-button.active {
            background: #2c3e50;
        }
        
        .tab-content {
            display: none;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .tab-content.active {
            display: block;
        }
        
        .form-section {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        button {
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #229954;
        }
        
        .delete-button {
            background: #e74c3c;
        }
        
        .delete-button:hover {
            background: #c0392b;
        }
        
        .edit-button {
            background: #f39c12;
        }
        
        .edit-button:hover {
            background: #d68910;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .data-table th {
            background: #34495e;
            color: white;
            font-weight: bold;
        }
        
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .data-table tr:hover {
            background: #e3e6e8;
        }
        
        .actions {
            display: flex;
            gap: 10px;
        }
        
        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            text-align: center;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #3498db;
        }
        
        .stat-label {
            color: #7f8c8d;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 College Enrollment System</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="studentCount">0</div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="courseCount">0</div>
                <div class="stat-label">Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="enrollmentCount">0</div>
                <div class="stat-label">Enrollments</div>
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab-button active" onclick="showTab('students')">Students</button>
            <button class="tab-button" onclick="showTab('courses')">Courses</button>
            <button class="tab-button" onclick="showTab('enrollments')">Enrollments</button>
        </div>
        
        <div id="message"></div>
        
        <!-- Students Tab -->
        <div id="students-tab" class="tab-content active">
            <div class="form-section">
                <h2>Add/Edit Student</h2>
                <form id="studentForm">
                    <input type="hidden" id="studentEditId">
                    <div class="form-group">
                        <label for="studentId">Student ID (e.g., S12345):</label>
                        <input type="text" id="studentId" pattern="S\\d{5}" required>
                    </div>
                    <div class="form-group">
                        <label for="studentName">Name:</label>
                        <input type="text" id="studentName" required>
                    </div>
                    <div class="form-group">
                        <label for="studentEmail">Email:</label>
                        <input type="email" id="studentEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="studentProgram">Program:</label>
                        <select id="studentProgram" required>
                            <option value="">Select a program</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Full Stack Development">Full Stack Development</option>
                        </select>
                    </div>
                    <button type="submit">Save Student</button>
                    <button type="button" onclick="clearStudentForm()">Clear</button>
                </form>
            </div>
            
            <h3>Current Students</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Program</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="studentsTableBody">
                </tbody>
            </table>
        </div>
        
        <!-- Courses Tab -->
        <div id="courses-tab" class="tab-content">
            <div class="form-section">
                <h2>Add/Edit Course</h2>
                <form id="courseForm">
                    <input type="hidden" id="courseEditId">
                    <div class="form-group">
                        <label for="courseCode">Course Code (e.g., COMP1234):</label>
                        <input type="text" id="courseCode" pattern="[A-Z]{4}\\d{4}" required>
                    </div>
                    <div class="form-group">
                        <label for="courseTitle">Title:</label>
                        <input type="text" id="courseTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="courseDescription">Description:</label>
                        <textarea id="courseDescription" maxlength="500"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="courseCredits">Credits:</label>
                        <input type="number" id="courseCredits" min="1" max="4" required>
                    </div>
                    <div class="form-group">
                        <label for="courseInstructor">Instructor:</label>
                        <input type="text" id="courseInstructor" required>
                    </div>
                    <div class="form-group">
                        <label for="courseMaxStudents">Max Students:</label>
                        <input type="number" id="courseMaxStudents" min="1" value="30" required>
                    </div>
                    <button type="submit">Save Course</button>
                    <button type="button" onclick="clearCourseForm()">Clear</button>
                </form>
            </div>
            
            <h3>Current Courses</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Credits</th>
                        <th>Instructor</th>
                        <th>Max Students</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="coursesTableBody">
                </tbody>
            </table>
        </div>
        
        <!-- Enrollments Tab -->
        <div id="enrollments-tab" class="tab-content">
            <div class="form-section">
                <h2>Add/Edit Enrollment</h2>
                <form id="enrollmentForm">
                    <input type="hidden" id="enrollmentEditId">
                    <div class="form-group">
                        <label for="enrollmentStudent">Student:</label>
                        <select id="enrollmentStudent" required>
                            <option value="">Select a student</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="enrollmentCourse">Course:</label>
                        <select id="enrollmentCourse" required>
                            <option value="">Select a course</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="enrollmentSemester">Semester:</label>
                        <select id="enrollmentSemester" required>
                            <option value="">Select semester</option>
                            <option value="Fall 2024">Fall 2024</option>
                            <option value="Winter 2025">Winter 2025</option>
                            <option value="Spring 2025">Spring 2025</option>
                            <option value="Summer 2025">Summer 2025</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="enrollmentGrade">Grade:</label>
                        <select id="enrollmentGrade">
                            <option value="In Progress">In Progress</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                            <option value="Withdrawn">Withdrawn</option>
                        </select>
                    </div>
                    <button type="submit">Save Enrollment</button>
                    <button type="button" onclick="clearEnrollmentForm()">Clear</button>
                </form>
            </div>
            
            <h3>Current Enrollments</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Semester</th>
                        <th>Grade</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="enrollmentsTableBody">
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        // Global variables
        let students = [];
        let courses = [];
        let enrollments = [];
        
        // Tab switching
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
            
            // Load data for the selected tab
            if (tabName === 'students') loadStudents();
            else if (tabName === 'courses') loadCourses();
            else if (tabName === 'enrollments') loadEnrollments();
        }
        
        // Show message
        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.className = 'message ' + type;
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
        
        // Load statistics
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                document.getElementById('studentCount').textContent = data.students;
                document.getElementById('courseCount').textContent = data.courses;
                document.getElementById('enrollmentCount').textContent = data.enrollments;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        // ============================================
        // STUDENT FUNCTIONS
        // ============================================
        
        async function loadStudents() {
            try {
                const response = await fetch('/api/students');
                const data = await response.json();
                students = data;
                
                const tbody = document.getElementById('studentsTableBody');
                tbody.innerHTML = '';
                
                students.forEach(student => {
                    const row = tbody.insertRow();
                    row.innerHTML = \`
                        <td>\${student.studentId}</td>
                        <td>\${student.name}</td>
                        <td>\${student.email}</td>
                        <td>\${student.program}</td>
                        <td class="actions">
                            <button class="edit-button" onclick="editStudent('\${student._id}')">Edit</button>
                            <button class="delete-button" onclick="deleteStudent('\${student._id}')">Delete</button>
                        </td>
                    \`;
                });
                
                loadStats();
            } catch (error) {
                showMessage('Error loading students: ' + error.message, 'error');
            }
        }
        
        function editStudent(id) {
            const student = students.find(s => s._id === id);
            if (student) {
                document.getElementById('studentEditId').value = student._id;
                document.getElementById('studentId').value = student.studentId;
                document.getElementById('studentName').value = student.name;
                document.getElementById('studentEmail').value = student.email;
                document.getElementById('studentProgram').value = student.program;
            }
        }
        
        async function deleteStudent(id) {
            if (confirm('Are you sure you want to delete this student?')) {
                try {
                    const response = await fetch('/api/students/' + id, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showMessage('Student deleted successfully', 'success');
                        loadStudents();
                    } else {
                        const error = await response.json();
                        showMessage(error.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting student: ' + error.message, 'error');
                }
            }
        }
        
        function clearStudentForm() {
            document.getElementById('studentForm').reset();
            document.getElementById('studentEditId').value = '';
        }
        
        // Student form submission
        document.getElementById('studentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('studentEditId').value;
            const studentData = {
                studentId: document.getElementById('studentId').value,
                name: document.getElementById('studentName').value,
                email: document.getElementById('studentEmail').value,
                program: document.getElementById('studentProgram').value
            };
            
            try {
                const url = editId ? '/api/students/' + editId : '/api/students';
                const method = editId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(studentData)
                });
                
                if (response.ok) {
                    showMessage('Student saved successfully', 'success');
                    clearStudentForm();
                    loadStudents();
                } else {
                    const error = await response.json();
                    showMessage(error.message, 'error');
                }
            } catch (error) {
                showMessage('Error saving student: ' + error.message, 'error');
            }
        });
        
        // ============================================
        // COURSE FUNCTIONS
        // ============================================
        
        async function loadCourses() {
            try {
                const response = await fetch('/api/courses');
                const data = await response.json();
                courses = data;
                
                const tbody = document.getElementById('coursesTableBody');
                tbody.innerHTML = '';
                
                courses.forEach(course => {
                    const row = tbody.insertRow();
                    row.innerHTML = \`
                        <td>\${course.courseCode}</td>
                        <td>\${course.title}</td>
                        <td>\${course.credits}</td>
                        <td>\${course.instructor}</td>
                        <td>\${course.maxStudents}</td>
                        <td class="actions">
                            <button class="edit-button" onclick="editCourse('\${course._id}')">Edit</button>
                            <button class="delete-button" onclick="deleteCourse('\${course._id}')">Delete</button>
                        </td>
                    \`;
                });
                
                loadStats();
            } catch (error) {
                showMessage('Error loading courses: ' + error.message, 'error');
            }
        }
        
        function editCourse(id) {
            const course = courses.find(c => c._id === id);
            if (course) {
                document.getElementById('courseEditId').value = course._id;
                document.getElementById('courseCode').value = course.courseCode;
                document.getElementById('courseTitle').value = course.title;
                document.getElementById('courseDescription').value = course.description || '';
                document.getElementById('courseCredits').value = course.credits;
                document.getElementById('courseInstructor').value = course.instructor;
                document.getElementById('courseMaxStudents').value = course.maxStudents;
            }
        }
        
        async function deleteCourse(id) {
            if (confirm('Are you sure you want to delete this course?')) {
                try {
                    const response = await fetch('/api/courses/' + id, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showMessage('Course deleted successfully', 'success');
                        loadCourses();
                    } else {
                        const error = await response.json();
                        showMessage(error.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting course: ' + error.message, 'error');
                }
            }
        }
        
        function clearCourseForm() {
            document.getElementById('courseForm').reset();
            document.getElementById('courseEditId').value = '';
        }
        
        // Course form submission
        document.getElementById('courseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('courseEditId').value;
            const courseData = {
                courseCode: document.getElementById('courseCode').value,
                title: document.getElementById('courseTitle').value,
                description: document.getElementById('courseDescription').value,
                credits: parseInt(document.getElementById('courseCredits').value),
                instructor: document.getElementById('courseInstructor').value,
                maxStudents: parseInt(document.getElementById('courseMaxStudents').value)
            };
            
            try {
                const url = editId ? '/api/courses/' + editId : '/api/courses';
                const method = editId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(courseData)
                });
                
                if (response.ok) {
                    showMessage('Course saved successfully', 'success');
                    clearCourseForm();
                    loadCourses();
                } else {
                    const error = await response.json();
                    showMessage(error.message, 'error');
                }
            } catch (error) {
                showMessage('Error saving course: ' + error.message, 'error');
            }
        });
        
        // ============================================
        // ENROLLMENT FUNCTIONS
        // ============================================
        
        async function loadEnrollments() {
            try {
                // Load students and courses for dropdowns
                await loadStudentsForDropdown();
                await loadCoursesForDropdown();
                
                const response = await fetch('/api/enrollments');
                const data = await response.json();
                enrollments = data;
                
                const tbody = document.getElementById('enrollmentsTableBody');
                tbody.innerHTML = '';
                
                enrollments.forEach(enrollment => {
                    const row = tbody.insertRow();
                    row.innerHTML = \`
                        <td>\${enrollment.student.name} (\${enrollment.student.studentId})</td>
                        <td>\${enrollment.course.courseCode} - \${enrollment.course.title}</td>
                        <td>\${enrollment.semester}</td>
                        <td>\${enrollment.grade}</td>
                        <td class="actions">
                            <button class="edit-button" onclick="editEnrollment('\${enrollment._id}')">Edit</button>
                            <button class="delete-button" onclick="deleteEnrollment('\${enrollment._id}')">Delete</button>
                        </td>
                    \`;
                });
                
                loadStats();
            } catch (error) {
                showMessage('Error loading enrollments: ' + error.message, 'error');
            }
        }
        
        async function loadStudentsForDropdown() {
            const response = await fetch('/api/students');
            const data = await response.json();
            
            const select = document.getElementById('enrollmentStudent');
            select.innerHTML = '<option value="">Select a student</option>';
            
            data.forEach(student => {
                const option = document.createElement('option');
                option.value = student._id;
                option.textContent = \`\${student.name} (\${student.studentId})\`;
                select.appendChild(option);
            });
        }
        
        async function loadCoursesForDropdown() {
            const response = await fetch('/api/courses');
            const data = await response.json();
            
            const select = document.getElementById('enrollmentCourse');
            select.innerHTML = '<option value="">Select a course</option>';
            
            data.forEach(course => {
                const option = document.createElement('option');
                option.value = course._id;
                option.textContent = \`\${course.courseCode} - \${course.title}\`;
                select.appendChild(option);
            });
        }
        
        function editEnrollment(id) {
            const enrollment = enrollments.find(e => e._id === id);
            if (enrollment) {
                document.getElementById('enrollmentEditId').value = enrollment._id;
                document.getElementById('enrollmentStudent').value = enrollment.student._id;
                document.getElementById('enrollmentCourse').value = enrollment.course._id;
                document.getElementById('enrollmentSemester').value = enrollment.semester;
                document.getElementById('enrollmentGrade').value = enrollment.grade;
            }
        }
        
        async function deleteEnrollment(id) {
            if (confirm('Are you sure you want to delete this enrollment?')) {
                try {
                    const response = await fetch('/api/enrollments/' + id, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        showMessage('Enrollment deleted successfully', 'success');
                        loadEnrollments();
                    } else {
                        const error = await response.json();
                        showMessage(error.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error deleting enrollment: ' + error.message, 'error');
                }
            }
        }
        
        function clearEnrollmentForm() {
            document.getElementById('enrollmentForm').reset();
            document.getElementById('enrollmentEditId').value = '';
        }
        
        // Enrollment form submission
        document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('enrollmentEditId').value;
            const enrollmentData = {
                student: document.getElementById('enrollmentStudent').value,
                course: document.getElementById('enrollmentCourse').value,
                semester: document.getElementById('enrollmentSemester').value,
                grade: document.getElementById('enrollmentGrade').value
            };
            
            try {
                const url = editId ? '/api/enrollments/' + editId : '/api/enrollments';
                const method = editId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(enrollmentData)
                });
                
                if (response.ok) {
                    showMessage('Enrollment saved successfully', 'success');
                    clearEnrollmentForm();
                    loadEnrollments();
                } else {
                    const error = await response.json();
                    showMessage(error.message, 'error');
                }
            } catch (error) {
                showMessage('Error saving enrollment: ' + error.message, 'error');
            }
        });
        
        // Initialize
        loadStudents();
        loadStats();
    </script>
</body>
</html>
`;

// ============================================
// ROUTES
// ============================================

// Serve the main page
app.get('/', (req, res) => {
    res.send(htmlTemplate);
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const [students, courses, enrollments] = await Promise.all([
            Student.countDocuments({ isActive: true }),
            Course.countDocuments({ isOffered: true }),
            Enrollment.countDocuments()
        ]);
        
        res.json({ students, courses, enrollments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// STUDENT ROUTES
// ============================================

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({ isActive: true }).sort('name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        // Check if student has enrollments
        const enrollmentCount = await Enrollment.countDocuments({ student: req.params.id });
        
        if (enrollmentCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete student with active enrollments. Remove enrollments first.' 
            });
        }
        
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// COURSE ROUTES
// ============================================

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ isOffered: true }).sort('courseCode');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/courses', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        // Check if course has enrollments
        const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id });
        
        if (enrollmentCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete course with active enrollments. Remove enrollments first.' 
            });
        }
        
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isOffered: false },
            { new: true }
        );
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// ENROLLMENT ROUTES
// ============================================

app.get('/api/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find().sort('-createdAt');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/enrollments', async (req, res) => {
    try {
        // Check if course is full
        const course = await Course.findById(req.body.course);
        const enrollmentCount = await Enrollment.countDocuments({
            course: req.body.course,
            semester: req.body.semester,
            grade: { $ne: 'Withdrawn' }
        });
        
        if (enrollmentCount >= course.maxStudents) {
            return res.status(400).json({ message: 'Course is full' });
        }
        
        const enrollment = new Enrollment(req.body);
        await enrollment.save();
        await enrollment.populate('student course');
        
        res.status(201).json(enrollment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Student is already enrolled in this course for this semester' 
            });
        }
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/enrollments/:id', async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        await enrollment.populate('student course');
        res.json(enrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/enrollments/:id', async (req, res) => {
    try {
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
        
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        res.json({ message: 'Enrollment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🎓 College Enrollment System running on http://localhost:${PORT}`);
});
