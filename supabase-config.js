// ========================================
// SUPABASE CONFIGURATION
// ========================================
// 
// ⚠️ สำคัญ: แก้ไขค่าเหล่านี้ด้วยข้อมูลจาก Supabase ของคุณ
// 
// วิธีหา:
// 1. ไปที่ https://supabase.com/dashboard
// 2. เลือก Project ของคุณ
// 3. ไปที่ Settings → API
// 4. คัดลอก Project URL และ anon public key
// 
// ========================================

const SUPABASE_URL = 'https://awxgnlxhnyiycurfckax.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eGdubHhobnlpeWN1cmZja2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDM3MTIsImV4cCI6MjA4NDIxOTcxMn0.PBC6buE4uB9uaQ44KAQR9mxst9Q3H8OjuxdkLamCgA8';

// ตรวจสอบว่าตั้งค่าแล้วหรือยัง
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('⚠️ กรุณาตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY ใน supabase-config.js');
    alert('⚠️ กรุณาตั้งค่า Supabase ก่อนใช้งาน\n\nดูวิธีตั้งค่าใน supabase-config.js');
}

// ตรวจสอบว่า Supabase library โหลดแล้วหรือยัง
if (typeof window.supabase === 'undefined') {
    console.error('⚠️ Supabase library ยังไม่โหลด กรุณารอสักครู่แล้วรีเฟรชหน้าใหม่');
    alert('⚠️ กำลังโหลด Supabase library...\nกรุณารีเฟรชหน้าใหม่');
}

// สร้าง Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase Client initialized');
