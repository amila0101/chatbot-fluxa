/**
 * Synthetic Monitoring Report Generator
 * 
 * This script runs the synthetic monitoring tests and generates a report.
 */

const { runAllTests } = require('./synthetic-monitor');
const fs = require('fs');
const path = require('path');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Generate a report from test results
 * @param {Object} results - Test results
 * @param {number} duration - Test duration in ms
 * @returns {string} - HTML report
 */
function generateHtmlReport(results, duration) {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  
  const testResults = Object.entries(results.results).map(([name, success]) => {
    return `
      <tr>
        <td>${name}</td>
        <td class="${success ? 'success' : 'failure'}">${success ? 'PASS' : 'FAIL'}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Synthetic Monitoring Report - ${date}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .summary {
          margin: 20px 0;
          padding: 15px;
          background-color: ${results.allPassed ? '#e8f5e9' : '#ffebee'};
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .success {
          color: #2e7d32;
          font-weight: bold;
        }
        .failure {
          color: #c62828;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.8em;
          color: #777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Synthetic Monitoring Report</h1>
      
      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> ${(duration / 1000).toFixed(2)} seconds</p>
        <p><strong>Status:</strong> <span class="${results.allPassed ? 'success' : 'failure'}">${results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}</span></p>
      </div>
      
      <h2>Test Results</h2>
      <table>
        <thead>
          <tr>
            <th>Test</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${testResults}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Generated on ${timestamp}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Run tests and generate a report
 */
async function runTestsAndGenerateReport() {
  console.log('Running synthetic monitoring tests...');
  
  const startTime = Date.now();
  let results;
  
  try {
    const success = await runAllTests();
    const duration = Date.now() - startTime;
    
    // Get test results from log file
    const logFile = path.join(__dirname, 'logs', 'synthetic-monitor.log');
    const logs = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
    const lastLog = JSON.parse(logs[logs.length - 1]);
    
    results = {
      allPassed: success,
      results: lastLog.results || {}
    };
    
    // Generate HTML report
    const html = generateHtmlReport(results, duration);
    const reportPath = path.join(reportsDir, `report-${Date.now()}.html`);
    fs.writeFileSync(reportPath, html);
    
    console.log(`Report generated: ${reportPath}`);
    console.log(`Tests ${success ? 'passed' : 'failed'}`);
    
    return success;
  } catch (error) {
    console.error('Error running tests:', error);
    return false;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTestsAndGenerateReport()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = {
  runTestsAndGenerateReport,
  generateHtmlReport
};
