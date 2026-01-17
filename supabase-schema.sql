-- ========================================
-- SUPABASE DATABASE SCHEMA
-- ระบบเช็คชื่อเข้าชั้นเรียน
-- ========================================

-- 1. ตารางนักเรียน
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  class TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2. ตารางการเช็คชื่อ
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  lesson TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 3. สร้าง Index เพื่อความเร็ว
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson ON attendance(lesson);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);

-- 4. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 5. สร้าง Policy (ให้ทุกคนอ่าน/เขียนได้)
-- สำหรับ students
CREATE POLICY "Enable read access for all users" ON students
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON students
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON students
  FOR DELETE USING (true);

-- สำหรับ attendance
CREATE POLICY "Enable read access for all users" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON attendance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON attendance
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON attendance
  FOR DELETE USING (true);

-- 6. สร้าง Function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. สร้าง Trigger
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. เพิ่มข้อมูลตัวอย่าง (ถ้าต้องการ)
-- INSERT INTO students (id, first_name, last_name, full_name, class) VALUES
-- ('65001', 'สมชาย', 'ใจดี', 'สมชาย ใจดี', 'ม.6/1'),
-- ('65002', 'สมหญิง', 'รักเรียน', 'สมหญิง รักเรียน', 'ม.6/1');
