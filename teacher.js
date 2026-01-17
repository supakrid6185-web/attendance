// ========================================
// TEACHER PAGE - ระบบจัดการเช็คชื่อสำหรับครู
// ========================================

// ========================================
// 1. UI MODE SWITCHING (สลับโหมด)
// ========================================

async function switchToAttendanceMode() {
    document.getElementById('attendanceMode').style.display = 'block';
    document.getElementById('studentListMode').style.display = 'none';
    document.getElementById('qrMode').style.display = 'none';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('attendanceModeBtn').classList.add('active');
    
    await displayAttendance();
}

async function switchToStudentListMode() {
    document.getElementById('attendanceMode').style.display = 'none';
    document.getElementById('studentListMode').style.display = 'block';
    document.getElementById('qrMode').style.display = 'none';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('studentListModeBtn').classList.add('active');
    
    await displayStudentList();
}

function switchToQRMode() {
    document.getElementById('attendanceMode').style.display = 'none';
    document.getElementById('studentListMode').style.display = 'none';
    document.getElementById('qrMode').style.display = 'block';
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('qrModeBtn').classList.add('active');
    
    generateQRCode();
}

// ========================================
// 2. ATTENDANCE DISPLAY (แสดงรายการเช็คชื่อ)
// ========================================

async function getFilteredAttendance() {
    const attendance = await loadAttendance();
    const filterLesson = document.getElementById('filterLesson').value;
    const filterDate = document.getElementById('filterDate').value;
    const today = new Date();
    
    let filtered = attendance;
    
    // Filter by date
    if (filterDate === 'today') {
        filtered = filtered.filter(record => isSameDay(record.timestamp, today));
    }
    
    // Filter by lesson
    if (filterLesson !== 'all') {
        filtered = filtered.filter(record => record.lesson === filterLesson);
    }
    
    return filtered;
}

function createAttendanceTableRow(record, index) {
    const date = formatThaiDate(record.timestamp);
    const time = formatThaiTime(record.timestamp);
    const studentName = escapeHtml(record.student_name || 'ไม่พบข้อมูล');
    const studentClass = escapeHtml(record.student_class || '-');
    const lessonName = escapeHtml(lessons[record.lesson] || record.lesson);
    const studentId = escapeHtml(record.student_id);
    
    return `
        <tr>
            <td>${index + 1}</td>
            <td>${studentId}</td>
            <td>${studentName}</td>
            <td>${studentClass}</td>
            <td>${lessonName}</td>
            <td>${date}</td>
            <td>${time}</td>
        </tr>
    `;
}

async function displayAttendance() {
    const filtered = await getFilteredAttendance();
    const tbody = document.getElementById('attendanceList');
    const totalCount = document.getElementById('totalCount');
    
    totalCount.textContent = filtered.length;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล</td></tr>';
        return;
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    tbody.innerHTML = sorted.map((record, index) => createAttendanceTableRow(record, index)).join('');
}

// ========================================
// 3. STUDENT LIST DISPLAY (แสดงรายชื่อนักเรียน)
// ========================================

function createStudentTableRow(id, student, index) {
    const escapedId = escapeHtml(id);
    const escapedFullName = escapeHtml(student.full_name);
    const escapedClass = escapeHtml(student.class || '-');
    const escapedEmail = escapeHtml(student.email || '-');
    const escapedPhone = escapeHtml(student.phone || '-');
    
    return `
        <tr>
            <td>${index + 1}</td>
            <td>${escapedId}</td>
            <td>${escapedFullName}</td>
            <td>${escapedClass}</td>
            <td>${escapedEmail}</td>
            <td>${escapedPhone}</td>
            <td>
                <button class="edit-btn" data-id="${escapedId}">✏️ แก้ไข</button>
                <button class="delete-btn" data-id="${escapedId}">🗑️ ลบ</button>
            </td>
        </tr>
    `;
}

function attachStudentListEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openEditModal(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteStudentRecord(this.getAttribute('data-id'));
        });
    });
}

async function displayStudentList() {
    const students = await loadStudents();
    const tbody = document.getElementById('studentListBody');
    const totalCount = document.getElementById('studentTotalCount');
    
    const studentArray = Object.entries(students);
    totalCount.textContent = studentArray.length;
    
    if (studentArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty">ยังไม่มีนักเรียนลงทะเบียน</td></tr>';
        return;
    }
    
    const sorted = studentArray.sort((a, b) => a[0].localeCompare(b[0]));
    tbody.innerHTML = sorted.map(([id, student], index) => createStudentTableRow(id, student, index)).join('');
    
    attachStudentListEventListeners();
}

// ========================================
// 4. STUDENT EDIT (แก้ไขข้อมูลนักเรียน)
// ========================================

async function openEditModal(studentId) {
    const students = await loadStudents();
    const student = students[studentId];
    
    if (!student) {
        showMessage('ไม่พบข้อมูลนักเรียน', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('editStudentId').value = studentId;
    document.getElementById('editFirstName').value = student.first_name;
    document.getElementById('editLastName').value = student.last_name;
    document.getElementById('editEmail').value = student.email || '';
    document.getElementById('editPhone').value = student.phone || '';
    document.getElementById('editClass').value = student.class;
    
    // Show modal
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function updateStudentData(studentId, formData) {
    const studentData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || null,
        phone: formData.phone || null,
        class: formData.className,
        updated_at: new Date().toISOString()
    };
    
    const result = await updateStudentInDB(studentId, studentData);
    return result;
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('editStudentId').value;
    const formData = {
        firstName: document.getElementById('editFirstName').value.trim(),
        lastName: document.getElementById('editLastName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        className: document.getElementById('editClass').value
    };
    
    if (!formData.firstName || !formData.lastName || !formData.className) {
        showMessage('กรุณากรอกข้อมูลที่จำเป็น (*)', 'error', 'editMessage');
        return;
    }
    
    const result = await updateStudentData(studentId, formData);
    
    if (!result.success) {
        showMessage('❌ ไม่สามารถแก้ไขข้อมูลได้: ' + result.error, 'error', 'editMessage');
        return;
    }
    
    showMessage(`✓ แก้ไขข้อมูลสำเร็จ: ${formData.firstName} ${formData.lastName}`, 'success', 'editMessage');
    
    setTimeout(() => {
        closeEditModal();
        displayStudentList();
        displayAttendance();
    }, 1000);
}

// ========================================
// 5. STUDENT DELETE (ลบนักเรียน)
// ========================================

async function countStudentAttendance(studentId) {
    const attendance = await loadAttendance();
    return attendance.filter(record => record.student_id === studentId).length;
}

async function deleteStudentAttendance(studentId) {
    // ไม่ต้องทำอะไร เพราะ Supabase มี CASCADE DELETE อยู่แล้ว
    // เมื่อลบ student ข้อมูล attendance จะถูกลบอัตโนมัติ
    return true;
}

async function deleteStudentRecord(studentId) {
    const students = await loadStudents();
    const student = students[studentId];
    
    if (!student) {
        showMessage('ไม่พบข้อมูลนักเรียน', 'error');
        return;
    }
    
    const attendanceCount = await countStudentAttendance(studentId);
    let confirmMessage = `คุณต้องการลบนักเรียน "${student.full_name}" (${studentId}) หรือไม่?\n\n`;
    
    if (attendanceCount > 0) {
        confirmMessage += `⚠️ นักเรียนคนนี้มีประวัติเช็คชื่อ ${attendanceCount} รายการ\n\n`;
        confirmMessage += `ข้อมูลประวัติเช็คชื่อจะถูกลบด้วยอัตโนมัติ (CASCADE DELETE)\n\n`;
        confirmMessage += `คุณแน่ใจหรือไม่?`;
    } else {
        confirmMessage += `นักเรียนคนนี้ยังไม่มีประวัติเช็คชื่อ`;
    }
    
    if (!confirm(confirmMessage)) return;
    
    const result = await deleteStudentFromDB(studentId);
    
    if (!result.success) {
        showMessage('❌ ไม่สามารถลบข้อมูลได้: ' + result.error, 'error');
        return;
    }
    
    if (attendanceCount > 0) {
        showMessage(`ลบข้อมูลนักเรียนและประวัติเช็คชื่อ ${attendanceCount} รายการเรียบร้อย`, 'success');
    } else {
        showMessage('ลบข้อมูลนักเรียนเรียบร้อย', 'success');
    }
    
    await displayStudentList();
    await displayAttendance();
}

// ========================================
// 6. EXPORT CSV (ส่งออกข้อมูล)
// ========================================

async function exportAttendanceCSV() {
    const filtered = await getFilteredAttendance();
    
    if (filtered.length === 0) {
        showMessage('ไม่มีข้อมูลให้ Export', 'warning');
        return;
    }
    
    let csv = '\uFEFFลำดับ,รหัสนักเรียน,ชื่อ-นามสกุล,ชั้นเรียน,บทเรียน,วันที่,เวลา\n';
    
    filtered.forEach((record, index) => {
        const date = formatThaiDate(record.timestamp);
        const time = formatThaiTime(record.timestamp);
        const studentName = record.student_name || 'ไม่พบข้อมูล';
        const studentClass = record.student_class || '-';
        const lessonName = lessons[record.lesson] || record.lesson;
        csv += `${index + 1},${record.student_id},${studentName},${studentClass},${lessonName},${date},${time}\n`;
    });
    
    downloadCSV(csv, `attendance_${new Date().toISOString().split('T')[0]}.csv`);
    showMessage('Export สำเร็จ!', 'success');
}

async function exportStudentsCSV() {
    const students = await loadStudents();
    const studentArray = Object.entries(students);
    
    if (studentArray.length === 0) {
        showMessage('ไม่มีข้อมูลนักเรียนให้ Export', 'warning');
        return;
    }
    
    let csv = '\uFEFFลำดับ,รหัสนักเรียน,ชื่อ,นามสกุล,ชื่อเต็ม,ชั้นเรียน,อีเมล,เบอร์โทร,วันที่ลงทะเบียน\n';
    
    studentArray.forEach(([id, student], index) => {
        const regDate = new Date(student.created_at).toLocaleString('th-TH');
        csv += `${index + 1},${id},${student.first_name},${student.last_name},${student.full_name},${student.class || ''},${student.email || ''},${student.phone || ''},${regDate}\n`;
    });
    
    downloadCSV(csv, `students_${new Date().toISOString().split('T')[0]}.csv`);
    showMessage('Export รายชื่อนักเรียนสำเร็จ!', 'success');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========================================
// 7. QR CODE (สร้าง QR Code)
// ========================================

function showLocalhostWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'message warning show';
    warningDiv.style.marginBottom = '15px';
    warningDiv.innerHTML = `
        ⚠️ <strong>คำเตือน:</strong> คุณกำลังใช้ localhost/127.0.0.1<br>
        นักเรียนจะไม่สามารถเข้าถึงได้จากมือถือ<br><br>
        <strong>แนะนำ:</strong> เปิดหน้านี้ผ่าน LAN IP แทน<br>
        (เช่น http://192.168.x.x:5500/teacher.html)
    `;
    
    const qrCard = document.querySelector('#qrMode .card');
    const existingWarning = qrCard.querySelector('.message.warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    qrCard.insertBefore(warningDiv, qrCard.firstChild);
}

function generateQRCode() {
    let currentUrl = window.location.href.replace('teacher.html', 'student.html');
    
    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        showLocalhostWarning();
    }
    
    document.getElementById('currentUrl').value = currentUrl;
    
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';
    
    new QRCode(qrcodeContainer, {
        text: currentUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

async function copyURL() {
    const urlInput = document.getElementById('currentUrl');
    const url = urlInput.value;
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            showMessage('คัดลอก URL สำเร็จ!', 'success');
        } else {
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            document.execCommand('copy');
            showMessage('คัดลอก URL สำเร็จ!', 'success');
        }
    } catch (err) {
        showMessage('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง', 'error');
        urlInput.select();
    }
}

function downloadQRCode() {
    const qrImage = document.querySelector('#qrcode img');
    if (!qrImage) {
        showMessage('ไม่พบ QR Code', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'qrcode-student.png';
    link.href = qrImage.src;
    link.click();
    
    showMessage('ดาวน์โหลด QR Code สำเร็จ!', 'success');
}

// ========================================
// 8. CLEAR DATA (ล้างข้อมูล)
// ========================================

async function clearAllDataConfirm() {
    const students = await loadStudents();
    const attendance = await loadAttendance();
    
    const studentCount = Object.keys(students).length;
    const attendanceCount = attendance.length;
    
    if (studentCount === 0 && attendanceCount === 0) {
        showMessage('ไม่มีข้อมูลให้ล้าง', 'warning');
        return;
    }
    
    let confirmMessage = '⚠️ คุณกำลังจะล้างข้อมูลทั้งหมด!\n\n';
    confirmMessage += `📊 ข้อมูลที่จะถูกลบ:\n`;
    confirmMessage += `- นักเรียน: ${studentCount} คน\n`;
    confirmMessage += `- ประวัติเช็คชื่อ: ${attendanceCount} รายการ\n\n`;
    confirmMessage += `การกระทำนี้ไม่สามารถย้อนกลับได้!\n\n`;
    confirmMessage += `คุณแน่ใจหรือไม่?`;
    
    if (!confirm(confirmMessage)) return;
    
    const result = await clearAllData();
    
    if (!result.success) {
        showMessage('❌ ไม่สามารถล้างข้อมูลได้: ' + result.error, 'error');
        return;
    }
    
    await displayAttendance();
    await displayStudentList();
    showMessage(`ล้างข้อมูลเรียบร้อย (นักเรียน ${studentCount} คน, เช็คชื่อ ${attendanceCount} รายการ)`, 'success');
}

// ========================================
// 9. EVENT LISTENERS (ผูก Events)
// ========================================

function initializeEventListeners() {
    // Mode switching
    document.getElementById('attendanceModeBtn').addEventListener('click', switchToAttendanceMode);
    document.getElementById('studentListModeBtn').addEventListener('click', switchToStudentListMode);
    document.getElementById('qrModeBtn').addEventListener('click', switchToQRMode);
    
    // Filters
    document.getElementById('filterLesson').addEventListener('change', displayAttendance);
    document.getElementById('filterDate').addEventListener('change', displayAttendance);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', exportAttendanceCSV);
    document.getElementById('exportStudentsBtn').addEventListener('click', exportStudentsCSV);
    
    // QR Code
    document.getElementById('copyUrlBtn').addEventListener('click', copyURL);
    document.getElementById('downloadQrBtn').addEventListener('click', downloadQRCode);
    
    // Edit modal
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('editStudentForm').addEventListener('submit', handleEditSubmit);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
    
    // Clear data
    document.getElementById('clearBtn').addEventListener('click', clearAllDataConfirm);
}

// ========================================
// 10. INITIALIZATION (เริ่มต้นระบบ)
// ========================================

async function init() {
    initializeEventListeners();
    await displayAttendance();
}

// Start the app
init();
