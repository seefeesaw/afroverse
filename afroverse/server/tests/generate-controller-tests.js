#!/usr/bin/env node

/**
 * Controller Test Generator
 * Generates comprehensive unit tests for all controller files
 */

const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');
const testsDir = path.join(__dirname, 'unit', 'controllers');

/**
 * Extract controller functions and their HTTP methods
 */
function extractControllerFunctions(content) {
  const functions = [];
  
  // Match async function definitions
  const asyncRegex = /async\s+(\w+)\s*\(req,\s*res/g;
  let match;
  while ((match = asyncRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }
  
  // Match object method definitions
  const methodRegex = /(\w+)\s*:\s*async\s+function\s*\(req,\s*res/g;
  while ((match = methodRegex.exec(content)) !== null) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }
  
  // Match arrow function properties
  const arrowRegex = /(\w+)\s*:\s*async\s*\(req,\s*res/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }
  
  return functions;
}

/**
 * Extract service dependencies
 */
function extractServiceDependencies(content) {
  const services = [];
  const serviceRegex = /require\(['"]\.\.\/services\/(\w+Service)['"]\)/g;
  let match;
  while ((match = serviceRegex.exec(content)) !== null) {
    services.push(match[1]);
  }
  return services;
}

/**
 * Generate comprehensive test template for a controller
 */
function generateControllerTest(controllerName, controllerContent) {
  const functions = extractControllerFunctions(controllerContent);
  const services = extractServiceDependencies(controllerContent);
  const moduleName = controllerName.replace('.js', '');
  
  const serviceMocks = services.map(service => 
    `jest.mock('../../../src/services/${service}');`
  ).join('\n');
  
  const serviceRequires = services.map(service =>
    `const ${service} = require('../../../src/services/${service}');`
  ).join('\n');
  
  return `const ${moduleName} = require('../../../src/controllers/${controllerName}');
${serviceRequires}
const { logger } = require('../../../src/utils/logger');

${serviceMocks}
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('${moduleName}', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock request object
    req = {
      user: {
        id: 'user123',
        phone: '+1234567890',
        username: 'testuser'
      },
      params: {},
      query: {},
      body: {},
      headers: {},
      ip: '127.0.0.1'
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };

    // Mock next function
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module exports', () => {
    it('should be defined', () => {
      expect(${moduleName}).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof ${moduleName}).toBe('object');
    });
${functions.map(fn => `
    it('should have ${fn} function', () => {
      expect(${moduleName}.${fn}).toBeDefined();
      expect(typeof ${moduleName}.${fn}).toBe('function');
    });`).join('')}
  });
${functions.map(fn => generateControllerFunctionTests(moduleName, fn, services)).join('\n')}
});
`;
}

/**
 * Generate test cases for a controller function
 */
function generateControllerFunctionTests(moduleName, functionName, services) {
  const httpMethod = inferHttpMethod(functionName);
  const serviceName = services[0] || 'service';
  
  return `
  describe('${functionName}', () => {
    it('should be defined', () => {
      expect(${moduleName}.${functionName}).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof ${moduleName}.${functionName}).toBe('function');
    });

    it('should handle successful ${httpMethod} request', async () => {
      // Arrange
      req.body = { /* add test data */ };
      ${services.length > 0 ? `${serviceName}.${functionName} = jest.fn().mockResolvedValue({ success: true });` : ''}

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });

    it('should handle validation errors', async () => {
      // Arrange
      req.body = {}; // Invalid data

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String)
        })
      );
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      req.body = { /* add test data */ };
      ${services.length > 0 ? `${serviceName}.${functionName} = jest.fn().mockRejectedValue(new Error('Service error'));` : ''}

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });

    it('should require authentication', async () => {
      // Arrange
      req.user = undefined;

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      // Add authentication check assertions
      expect(${moduleName}.${functionName}).toBeDefined();
    });

    it('should validate input parameters', async () => {
      // Arrange
      req.body = { invalid: 'data' };

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      // Add parameter validation assertions
      expect(${moduleName}.${functionName}).toBeDefined();
    });

    it('should return correct status code', async () => {
      // Arrange
      req.body = { /* add test data */ };

      // Act
      await ${moduleName}.${functionName}(req, res);

      // Assert
      expect(res.status).toHaveBeenCalled();
    });
  });`;
}

/**
 * Infer HTTP method from function name
 */
function inferHttpMethod(functionName) {
  const name = functionName.toLowerCase();
  if (name.startsWith('get') || name.includes('fetch') || name.includes('list')) return 'GET';
  if (name.startsWith('create') || name.startsWith('add')) return 'POST';
  if (name.startsWith('update') || name.startsWith('edit')) return 'PUT';
  if (name.startsWith('delete') || name.startsWith('remove')) return 'DELETE';
  return 'POST';
}

/**
 * Process a single controller file
 */
function processController(controllerFile) {
  const controllerPath = path.join(controllersDir, controllerFile);
  const testPath = path.join(testsDir, controllerFile.replace('.js', '.test.js'));
  
  console.log(`Processing ${controllerFile}...`);
  
  try {
    // Read controller content
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    // Generate test template
    const testContent = generateControllerTest(controllerFile, controllerContent);
    
    // Check if test file exists
    if (fs.existsSync(testPath)) {
      const existingContent = fs.readFileSync(testPath, 'utf8');
      
      // Only overwrite if it's a stub (less than 20 lines)
      if (existingContent.split('\n').length < 20) {
        fs.writeFileSync(testPath, testContent);
        console.log(`  ✅ Generated comprehensive tests for ${controllerFile}`);
        return 'generated';
      } else {
        // Check if it needs enhancement
        const functionCount = extractControllerFunctions(controllerContent).length;
        const testFunctionCount = (existingContent.match(/describe\('/g) || []).length;
        
        if (testFunctionCount < functionCount + 1) {
          console.log(`  ⚠️  ${controllerFile} may need more tests (${testFunctionCount} suites for ${functionCount} functions)`);
          return 'needs_enhancement';
        } else {
          console.log(`  ⏭️  Skipped ${controllerFile} (already has tests)`);
          return 'skipped';
        }
      }
    } else {
      fs.writeFileSync(testPath, testContent);
      console.log(`  ✅ Created test file for ${controllerFile}`);
      return 'created';
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${controllerFile}:`, error.message);
    return 'error';
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧪 Controller Test Generator\n');
  console.log('Scanning controllers directory...\n');
  
  // Get all controller files
  const controllerFiles = fs.readdirSync(controllersDir)
    .filter(file => file.endsWith('.js') && !file.includes('.test.js'))
    .sort();
  
  console.log(`Found ${controllerFiles.length} controller files\n`);
  
  const stats = {
    generated: 0,
    created: 0,
    skipped: 0,
    needs_enhancement: 0,
    error: 0
  };
  
  controllerFiles.forEach(file => {
    const result = processController(file);
    stats[result]++;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log(`Total controllers: ${controllerFiles.length}`);
  console.log(`Generated: ${stats.generated}`);
  console.log(`Created: ${stats.created}`);
  console.log(`Skipped (has tests): ${stats.skipped}`);
  console.log(`Needs enhancement: ${stats.needs_enhancement}`);
  console.log(`Errors: ${stats.error}`);
  console.log('='.repeat(60));
  
  if (stats.generated + stats.created > 0) {
    console.log('\n✅ Test generation complete!');
    console.log('\nNext steps:');
    console.log('1. Review generated tests');
    console.log('2. Fill in test data and assertions');
    console.log('3. Run tests: npm test -- --testPathPattern=controllers');
  }
  
  if (stats.needs_enhancement > 0) {
    console.log(`\n⚠️  ${stats.needs_enhancement} controller(s) may need test enhancement`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateControllerTest, extractControllerFunctions };

