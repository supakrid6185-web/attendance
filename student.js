// ========================================
// STUDENT PAGE - ระบบเช็คชื่อสำหรับนักเรียน
// ========================================

// ========================================
// 1. UI MODE SWITCHING (สลับโหมด)
// ========================================

function switchToCheckInMode() {
    document.getElementById('checkInMode').style.display = 'block';
    document.getElementById('registerMode').style.display = 'none';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('checkInModeBtn').classList.add('active');
}

function switchToRegisterMode() {
    document.getElementById('checkInMode').style.display = 'none';
    document.getElementById('registerMode').style.display = 'block';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('registerModeBtn').classList.add('active');
}

// ========================================
// 2. STUDENT REGISTRATION (ลงทะเบียนนักเรียน)
// ========================================

function validateRegistrationForm(formData) {
    const { studentId, firstName, lastName, className } = formData;
    
    if (!studentId || !firstName || !lastName || !className) {
        showMessage('กรุณากรอกข้อมูลที่จำเป็น (*)', 'error', 'registerMessage');
        return false;
    }
    
    return true;
}

async function checkStudentExists(studentId) {
    const students = await loadStudents();
    return students[studentId] !== undefined;
}

async function registerStudent(formData) {
    // Validate
    if (!validateRegistrationForm(formData)) {
        return false;
    }
    
    // Check duplicate
    if (await checkStudentExists(formData.studentId)) {
        showMessage('⚠️ รหัสนักเรียนนี้ลงทะเบียนแล้ว', 'warning', 'registerMessage');
        return false;
    }
    
    // Save
    const studentData = {
        id: formData.studentId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || null,
        phone: formData.phone || null,
        class: formData.className
    };
    
    const result = await saveStudent(studentData);
    
    if (!result.success) {
        showMessage('❌ ไม่สามารถลงทะเบียนได้: ' + result.error, 'error', 'registerMessage');
        return false;
    }
    
    showMessage(`✓ ลงทะเบียนสำเร็จ: ${formData.firstName} ${formData.lastName}`, 'success', 'registerMessage');
    return true;
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    const formData = {
        studentId: document.getElementById('regStudentId').value.trim(),
        firstName: document.getElementById('regFirstName').value.trim(),
        lastName: document.getElementById('regLastName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        className: document.getElementById('regClass').value
    };
    
    if (await registerStudent(formData)) {
        document.getElementById('registerForm').reset();
        document.getElementById('regStudentId').focus();
    }
}

// ========================================
// 3. CHECK-IN (เช็คชื่อ)
// ========================================

function validateCheckInForm(studentId, lessonId) {
    if (!lessonId) {
        showMessage('กรุณาเลือกบทเรียนก่อน', 'error');
        return false;
    }
    
    if (!studentId) {
        showMessage('กรุณากรอกรหัสนักเรียน', 'error');
        return false;
    }
    
    return true;
}

async function isStudentRegistered(studentId) {
    const students = await loadStudents();
    return students[studentId] !== undefined;
}

async function hasAlreadyCheckedIn(studentId, lessonId) {
    const attendance = await loadAttendance();
    const today = new Date();
    
    return attendance.some(record => {
        return record.student_id === studentId && 
               isSameDay(record.timestamp, today) && 
               record.lesson === lessonId;
    });
}

async function createAttendanceRecord(studentId, lessonId) {
    const students = await loadStudents();
    const student = students[studentId];
    
    return {
        student_id: studentId,
        student_name: student.full_name,
        student_class: student.class,
        lesson: lessonId,
        timestamp: new Date().toISOString()
    };
}

async function checkIn(studentId, lessonId) {
    // Validate
    if (!validateCheckInForm(studentId, lessonId)) {
        return false;
    }
    
    // Check registration
    if (!(await isStudentRegistered(studentId))) {
        showMessage('⚠️ ไม่พบรหัสนักเรียนนี้ในระบบ กรุณาลงทะเบียนก่อน', 'error');
        return false;
    }
    
    // Check duplicate
    if (await hasAlreadyCheckedIn(studentId, lessonId)) {
        showMessage('คุณเช็คชื่อบทเรียนนี้ไปแล้ววันนี้!', 'warning');
        return false;
    }
    
    // Save
    const record = await createAttendanceRecord(studentId, lessonId);
    const result = await saveAttendanceRecord(record);
    
    if (!result.success) {
        showMessage('❌ ไม่สามารถเช็คชื่อได้: ' + result.error, 'error');
        return false;
    }
    
    const students = await loadStudents();
    const lessonName = lessons[lessonId];
    showMessage(`✓ เช็คชื่อสำเร็จ: ${students[studentId].full_name} - ${lessonName}`, 'success');
    
    return true;
}

async function handleCheckInSubmit(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value.trim();
    const lessonId = document.getElementById('lessonSelect').value;
    
    if (await checkIn(studentId, lessonId)) {
        document.getElementById('studentId').value = '';
        document.getElementById('studentId').focus();
    }
}

// ========================================
// 4. EVENT LISTENERS (ผูก Events)
// ========================================

function initializeEventListeners() {
    // Mode switching
    document.getElementById('checkInModeBtn').addEventListener('click', switchToCheckInMode);
    document.getElementById('registerModeBtn').addEventListener('click', switchToRegisterMode);
    
    // Forms
    document.getElementById('registerForm').addEventListener('submit', handleRegistrationSubmit);
    document.getElementById('checkInForm').addEventListener('submit', handleCheckInSubmit);
}

// ========================================
// 5. INITIALIZATION (เริ่มต้นระบบ)
// ========================================

function init() {
    initializeEventListeners();
}

// Start the app
init();
