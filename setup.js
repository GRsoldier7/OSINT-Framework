/**
 * Setup script for the OSINT Framework
 * This script helps set up the project by installing dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n\n');
console.log('┌───────────────────────────────────────────────────┐');
console.log('│                                                   │');
console.log('│   OSINT Framework Setup                           │');
console.log('│                                                   │');
console.log('└───────────────────────────────────────────────────┘');
console.log('\n');

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('Dependencies already installed.');
}

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating .env file...');
  try {
    fs.copyFileSync(
      path.join(__dirname, '.env.example'),
      path.join(__dirname, '.env')
    );
    console.log('.env file created successfully!');
  } catch (error) {
    console.error('Error creating .env file:', error.message);
  }
} else {
  console.log('.env file already exists.');
}

console.log('\n');
console.log('┌───────────────────────────────────────────────────┐');
console.log('│                                                   │');
console.log('│   Setup Complete!                                 │');
console.log('│                                                   │');
console.log('│   To start the development server:                │');
console.log('│   npm run dev                                     │');
console.log('│                                                   │');
console.log('│   To start the simple server:                     │');
console.log('│   npm run start:simple                            │');
console.log('│                                                   │');
console.log('└───────────────────────────────────────────────────┘');
console.log('\n\n');
