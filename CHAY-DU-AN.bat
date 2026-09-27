@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Mini-LMS - Nhom 8

echo ==================================================
echo   Mini-LMS - Nhóm 8 - Khởi động dự án
echo ==================================================
echo.

rem ---- 1. Kiểm tra Node.js ----
where node >nul 2>nul
if errorlevel 1 (
  echo [THIẾU] Máy chưa cài Node.js.
  echo         Tải bản LTS tại https://nodejs.org rồi cài đặt, sau đó bấm đúp lại file này.
  goto :fail
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)||(a===20&&b>=19)?0:1)"
if errorlevel 1 (
  echo [CŨ] Node.js trên máy quá cũ, cần bản 22.12 trở lên.
  echo      Tải bản LTS mới tại https://nodejs.org rồi cài đè lên.
  goto :fail
)

rem ---- 2. Kiểm tra MongoDB - bỏ qua nếu backend/.env đang dùng MongoDB Atlas ----
set "USE_ATLAS="
if exist "backend\.env" findstr /c:"mongodb+srv" "backend\.env" >nul 2>nul && set "USE_ATLAS=1"
if defined USE_ATLAS goto :mongo_ok
node -e "require('net').connect(27017,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"
if errorlevel 1 (
  echo [THIẾU] Không thấy MongoDB đang chạy trên máy.
  echo         - Đã cài MongoDB: mở Services của Windows, tìm MongoDB Server và bấm Start.
  echo         - Chưa cài: tải MongoDB Community Server tại https://www.mongodb.com/try/download/community
  echo           khi cài nhớ giữ tùy chọn Install MongoD as a Service.
  echo         - Không muốn cài: dùng MongoDB Atlas, xem hướng dẫn trong README.md
  goto :fail
)
:mongo_ok

rem ---- 3. Lần chạy đầu: cài thư viện, tạo .env, nạp dữ liệu mẫu ----
if not exist "backend\node_modules" goto :setup
if not exist "frontend\node_modules" goto :setup
if not exist "node_modules" goto :setup
if not exist "backend\.env" goto :setup
goto :run

:setup
echo Lần chạy đầu tiên: đang cài thư viện và nạp dữ liệu mẫu, mất khoảng 2-5 phút...
echo.
call npm run setup
if errorlevel 1 (
  echo.
  echo [LỖI] Cài đặt không thành công - xem thông báo lỗi phía trên.
  echo       Thường do mất mạng giữa chừng: kiểm tra mạng rồi bấm đúp lại file này.
  goto :fail
)

:run
echo.
echo Đang khởi động. Trình duyệt sẽ tự mở http://localhost:5173 sau khoảng 10 giây.
echo Tài khoản học viên: student1 / student12345
echo Muốn tắt hệ thống: bấm Ctrl + C trong cửa sổ này.
echo.
if not "%MINILMS_NO_BROWSER%"=="1" start "" cmd /c "timeout /t 10 /nobreak >nul & start http://localhost:5173"
call npm run dev
goto :eof

:fail
echo.
pause
exit /b 1
