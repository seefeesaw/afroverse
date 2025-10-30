#!/usr/bin/env node

/**
 * Comprehensive Test Fixer
 * Fixes common test issues across all test files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Starting comprehensive test fixes...\n');

let fixCount = 0;

// Fix 1: Add logger.warn to all logger mocks
function fixLoggerMocks() {
  console.log('📝 Fixing logger mocks...');
  
  const testFiles = glob.sync('tests/**/*.test.js');
  let fixedFiles = 0;
  
  testFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Pattern 1: logger mock without warn
    const loggerPattern = /jest\.mock\(['"]\.\.\/(\.\.\/)*src\/utils\/logger['"],\s*\(\)\s*=>\s*\(\{[\s\S]*?logger:\s*\{[\s\S]*?\}/g;
    
    if (content.includes("logger: {") && content.includes("jest.mock") && content.includes("/utils/logger")) {
      // Check if logger mock exists but doesn't have warn
      if (content.match(/logger:\s*\{[^}]*error:[^}]*info:[^}]*\}/)) {
        if (!content.includes("warn: jest.fn()")) {
          // Add warn to existing logger mock
          content = content.replace(
            /(logger:\s*\{[\s\S]*?info:\s*jest\.fn\(\))/,
            '$1,\n    warn: jest.fn(),\n    debug: jest.fn()'
          );
          modified = true;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      fixedFiles++;
      console.log(`  ✅ Fixed logger mock in ${path.basename(file)}`);
    }
  });
  
  console.log(`  Fixed ${fixedFiles} files\n`);
  fixCount += fixedFiles;
}

// Fix 2: Fix missing transformService
function fixTransformService() {
  console.log('📝 Fixing transformService imports...');
  
  const file = 'tests/unit/controllers/transformController.test.js';
  
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Change transformService to transformationService
    content = content.replace(
      /transformService/g,
      'transformationService'
    );
    
    fs.writeFileSync(file, content);
    console.log('  ✅ Fixed transformController.test.js\n');
    fixCount++;
  }
}

// Fix 3: Fix missing node-cron
function fixNodeCron() {
  console.log('📝 Fixing node-cron mocks...');
  
  const schedulerTests = [
    'tests/unit/schedulers/adminSchedulers.test.js',
    'tests/unit/schedulers/notificationScheduler.test.js'
  ];
  
  schedulerTests.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove or comment out node-cron mock if it doesn't exist
      if (content.includes("jest.mock('node-cron')")) {
        content = content.replace(
          /jest\.mock\(['"]node-cron['"]\);?/g,
          "// jest.mock('node-cron'); // Not needed for basic tests"
        );
        
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed ${path.basename(file)}`);
        fixCount++;
      }
    }
  });
  
  console.log('');
}

// Fix 4: Fix imageUpload multer mock
function fixImageUpload() {
  console.log('📝 Fixing imageUpload multer mock...');
  
  const file = 'tests/unit/middleware/imageUpload.test.js';
  
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the multer mock
    const multerMockBefore = "jest.mock('multer');";
    const multerMockAfter = `jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = { 
        path: '/tmp/test.jpg', 
        filename: 'test.jpg', 
        mimetype: 'image/jpeg' 
      };
      next();
    }),
    fields: jest.fn(() => (req, res, next) => next())
  }));
  multer.memoryStorage = jest.fn(() => ({}));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});`;
    
    content = content.replace(multerMockBefore, multerMockAfter);
    
    fs.writeFileSync(file, content);
    console.log('  ✅ Fixed imageUpload.test.js\n');
    fixCount++;
  }
}

// Fix 5: Fix app.test.js
function fixAppTest() {
  console.log('📝 Fixing app.test.js...');
  
  const file = 'tests/unit/app.test.js';
  
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the path
    content = content.replace(
      "const app = require('../../../src/app');",
      "const app = require('../../src/app');"
    );
    
    fs.writeFileSync(file, content);
    console.log('  ✅ Fixed app.test.js\n');
    fixCount++;
  }
}

// Main execution
async function main() {
  try {
    fixLoggerMocks();
    fixTransformService();
    fixNodeCron();
    fixImageUpload();
    fixAppTest();
    
    console.log('='.repeat(60));
    console.log(`✅ Test fixes complete!`);
    console.log(`Total fixes applied: ${fixCount}`);
    console.log('='.repeat(60));
    console.log('\nNext step: Run npm test to verify fixes\n');
  } catch (error) {
    console.error('❌ Error fixing tests:', error);
    process.exit(1);
  }
}

main();

