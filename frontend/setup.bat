@echo off
REM Enterprise Chat Frontend - Installation Script for Windows

echo.
echo 🚀 Enterprise Chat Frontend Setup
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully
echo.

REM Create .env if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo VITE_API_BASE_URL=http://localhost:3000/api
        echo VITE_SOCKET_URL=http://localhost:3000
        echo VITE_APP_NAME=Enterprise Chat
        echo VITE_APP_VERSION=1.0.0
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo    1. Make sure the backend is running on http://localhost:3000
echo    2. Run: npm run dev
echo    3. Open http://localhost:5173 in your browser
echo.
echo 📚 Available commands:
echo    npm run dev      - Start development server
echo    npm run build    - Build for production
echo    npm run lint     - Run ESLint
echo    npm run preview  - Preview production build
echo.
pause
