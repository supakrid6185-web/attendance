// ========================================
// COMMON FUNCTIONS - ใช้ Supabase
// ========================================

// ข้อมูลบทเรียน
const lessons = {
    'lesson1': 'บทที่ 1: HTML พื้นฐาน',
    'lesson2': 'บทที่ 2: CSS Styling',
    'lesson3': 'บทที่ 3: JavaScript',
    'lesson4': 'บทที่ 4: Responsive Design',
    'lesson5': 'บทที่ 5: Web Development'
};

// ข้อมูลชั้นเรียน / สาขา
const classes = [
    { value: 'ม.1/1', label: 'ม.1/1' },
    { value: 'ม.1/2', label: 'ม.1/2' },
    { value: 'ม.2/1', label: 'ม.2/1' },
    { value: 'ม.2/2', label: 'ม.2/2' },
    { value: 'ม.3/1', label: 'ม.3/1' },
    { value: 'ม.3/2', label: 'ม.3/2' },
    { value: 'ม.4/1', label: 'ม.4/1' },
    { value: 'ม.4/2', label: 'ม.4/2' },
    { value: 'ม.5/1', label: 'ม.5/1' },
    { value: 'ม.5/2', label: 'ม.5/2' },
    { value: 'ม.6/1', label: 'ม.6/1' },
    { value: 'ม.6/2', label: 'ม.6/2' },
    { value: 'ปวช.1 คอมพิวเตอร์', label: 'ปวช.1 คอมพิวเตอร์' },
    { value: 'ปวช.2 คอมพิวเตอร์', label: 'ปวช.2 คอมพิวเตอร์' },
    { value: 'ปวช.3 คอมพิวเตอร์', label: 'ปวช.3 คอมพิวเตอร์' },
    { value: 'ปวส.1 คอมพิวเตอร์', label: 'ปวส.1 คอมพิวเตอร์' },
    { value: 'ปวส.2 คอมพิวเตอร์', label: 'ปวส.2 คอมพิวเตอร์' }
];

// สร้าง options สำหรับ select ชั้นเรียน
function generateClassOptions() {
    return classes.map(cls => `<option value="${cls.value}">${cls.label}</option>`).join('');
}

// เติม options ลงใน select ทั้งหมด
function populateClassSelects() {
    const classSelects = document.querySelectorAll('.class-select');
    const optionsHTML = generateClassOptions();
    
    classSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- เลือกชั้นเรียน --</option>' + optionsHTML;
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// อัพเดทวันที่และเวลา
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeElement = document.getElementById('dateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('th-TH', options);
    }
}

updateDateTime();
setInterval(updateDateTime, 1000);

// เติม options ชั้นเรียนเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', function() {
    populateClassSelects();
});

// ========================================
// SUPABASE DATABASE FUNCTIONS
// ========================================

// โหลดข้อมูลนักเรียนจาก Supabase
async function loadStudents() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        // แปลงเป็น object { id: student } เหมือนเดิม
        const studentsObj = {};
        data.forEach(student => {
            studentsObj[student.id] = student;
        });
        
        return studentsObj;
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('ไม่สามารถโหลดข้อมูลนักเรียนได้', 'error');
        return {};
    }
}

// บันทึกข้อมูลนักเรียน (เพิ่มใหม่)
async function saveStudent(studentData) {
    try {
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error saving student:', error);
        return { success: false, error: error.message };
    }
}

// อัพเดทข้อมูลนักเรียน
async function updateStudentInDB(studentId, studentData) {
    try {
        const { data, error } = await supabase
            .from('students')
            .update(studentData)
            .eq('id', studentId)
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error updating student:', error);
        return { success: false, error: error.message };
    }
}

// ลบนักเรียน (cascade delete จะลบ attendance อัตโนมัติ)
async function deleteStudentFromDB(studentId) {
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting student:', error);
        return { success: false, error: error.message };
    }
}

// โหลดข้อมูลการเช็คชื่อจาก Supabase
async function loadAttendance() {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error loading attendance:', error);
        showMessage('ไม่สามารถโหลดข้อมูลการเช็คชื่อได้', 'error');
        return [];
    }
}

// บันทึกข้อมูลการเช็คชื่อ
async function saveAttendanceRecord(attendanceData) {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .insert([attendanceData])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error saving attendance:', error);
        return { success: false, error: error.message };
    }
}

// ล้างข้อมูลทั้งหมด
async function clearAllData() {
    try {
        // ลบ attendance ก่อน (เพราะมี foreign key)
        const { error: attendanceError } = await supabase
            .from('attendance')
            .delete()
            .neq('id', 0); // ลบทั้งหมด
        
        if (attendanceError) throw attendanceError;
        
        // ลบ students
        const { error: studentsError } = await supabase
            .from('students')
            .delete()
            .neq('id', ''); // ลบทั้งหมด
        
        if (studentsError) throw studentsError;
        
        return { success: true };
    } catch (error) {
        console.error('Error clearing data:', error);
        return { success: false, error: error.message };
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// แสดงข้อความ
function showMessage(text, type, elementId = 'message') {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type} show`;
        
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 3000);
    } else {
        alert(text);
    }
}

// ฟังก์ชันสำหรับ escape HTML (ป้องกัน XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ฟังก์ชันสำหรับเปรียบเทียบวันที่ (แก้ปัญหา Timezone)
function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

// ฟังก์ชันสำหรับ format วันที่แบบไทย
function formatThaiDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ฟังก์ชันสำหรับ format เวลาแบบไทย
function formatThaiTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
