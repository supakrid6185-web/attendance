@echo off
echo ========================================
echo   ระบบเช็คชื่อเข้าชั้นเรียน
echo ========================================
echo.
echo กำลังเปิด Web Server...
echo.
echo URL สำหรับครู:
echo http://192.168.0.155:8000/teacher.html
echo.
echo URL สำหรับนักเรียน:
echo http://192.168.0.155:8000/student.html
echo.
echo กด Ctrl+C เพื่อปิด Server
echo ========================================
echo.

REM ลองใช้ Python ก่อน
python -m http.server 8000 2>nul
if %errorlevel% equ 0 goto :eof

REM ถ้า Python ไม่มี ลอง PHP
php -S 0.0.0.0:8000 2>nul
if %errorlevel% equ 0 goto :eof

REM ถ้าไม่มีทั้งคู่ แสดงข้อความ
echo.
echo ❌ ไม่พบ Python หรือ PHP
echo.
echo กรุณาติดตั้ง:
echo 1. Python: https://www.python.org/downloads/
echo 2. หรือใช้ VS Code Live Server Extension
echo.
pause
