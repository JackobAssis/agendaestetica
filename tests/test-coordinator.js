#!/usr/bin/env node

/**
 * Test Coordinator - Runs all test suites in sequence
 * Provides clear pass/fail status and generates report
 * 
 * Usage:
 *   npm test              (unit tests)
 *   npm run test:e2e      (existing e2e suite)
 *   npm run test:full-flow (new comprehensive flow test)
 *   npm run test:all      (all tests - TO BE ADDED)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestCoordinator {
  constructor() {
    this.results = [];
    this.timestamp = new Date().toISOString();
  }

  run(command, name) {
    console.log(`\n🧪 Running: ${name}`);
    console.log(`   Command: ${command}`);
    console.log('   ' + '─'.repeat(60));

    try {
      const output = execSync(command, {
        cwd: path.join(__dirname, '../../'),
        stdio: 'inherit',
        encoding: 'utf-8'
      });

      console.log('   ' + '─'.repeat(60));
      console.log(`✅ ${name} PASSED\n`);
      this.results.push({ name, status: 'PASS' });
      return true;

    } catch (error) {
      console.log('   ' + '─'.repeat(60));
      console.error(`❌ ${name} FAILED\n`);
      console.error(`   Error: ${error.message}\n`);
      this.results.push({ name, status: 'FAIL', error: error.message });
      return false;
    }
  }

  generateReport() {
    const report = {
      timestamp: this.timestamp,
      results: this.results.map(r => ({
        name: r.name,
        status: r.status,
        duration: '(see logs)'
      })),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length
      }
    };

    const reportPath = path.join(__dirname, '../../test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${reportPath}`);

    return report;
  }

  printSummary() {
    console.log('\n\n' + '═'.repeat(70));
    console.log('TEST SUITE SUMMARY');
    console.log('═'.repeat(70));

    this.results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${r.name}`);
    });

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log('─'.repeat(70));
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${total > 0 ? ((passed / total) * 100).toFixed(1) : 0}%`);
    console.log('═'.repeat(70) + '\n');

    return failed === 0;
  }
}

// Main execution
const coordinator = new TestCoordinator();

console.log('🚀 Agenda Estética - Test Coordination');
console.log(`Started: ${coordinator.timestamp}\n`);

// Determine which tests to run
const args = process.argv.slice(2);
const runAll = args.includes('--all');
const runUnit = args.includes('--unit') || runAll;
const runE2E = args.includes('--e2e') || runAll;
const runFlow = args.includes('--flow') || runAll;

if (process.argv[1]?.includes('test-all')) {
  // If run as npm run test:all
  runUnit = true;
  runE2E = true;
  runFlow = true;
}

// If no specific test selected, run all
if (!runUnit && !runE2E && !runFlow) {
  // Check if script is called with specific intent
  if (process.env.npm_lifecycle_event === 'test:full-flow') {
    coordinator.run('node tests/e2e/full-flow-test.js', 'Full Flow Test');
  } else if (process.env.npm_lifecycle_event === 'e2e') {
    coordinator.run('mocha tests/**/*.test.js', 'Unit Tests');
    coordinator.run('node tests/e2e/run-tests.js', 'E2E Tests');
  } else {
    // Default: run unit tests
    coordinator.run('mocha tests/**/*.test.js', 'Unit Tests');
  }
} else {
  if (runUnit) {
    coordinator.run('mocha tests/**/*.test.js', 'Unit Tests');
  }
  
  if (runE2E) {
    coordinator.run('node tests/e2e/run-tests.js', 'E2E Tests');
  }

  if (runFlow) {
    coordinator.run('node tests/e2e/full-flow-test.js', 'Full Flow Test');
  }
}

// Generate and print report
const report = coordinator.generateReport();
const success = coordinator.printSummary();

// Exit with appropriate code
process.exit(success ? 0 : 1);
