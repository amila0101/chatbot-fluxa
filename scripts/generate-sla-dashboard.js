#!/usr/bin/env node

/**
 * SLA Dashboard Generator
 * 
 * This script generates a simple HTML dashboard for SLA monitoring.
 * It reads the latest SLA report and creates a visual representation.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

// Main function
async function generateDashboard() {
  log('📊 Generating SLA Dashboard...', colors.cyan);
  
  // Find the latest report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    error('Reports directory not found. Run the SLA monitoring script first.');
    process.exit(1);
  }
  
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('sla-report-') && file.endsWith('.json'))
    .sort()
    .reverse();
  
  if (reportFiles.length === 0) {
    error('No SLA reports found. Run the SLA monitoring script first.');
    process.exit(1);
  }
  
  const latestReportFile = reportFiles[0];
  const reportPath = path.join(reportsDir, latestReportFile);
  
  info(`Using latest report: ${latestReportFile}`);
  
  // Read the report
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  // Generate HTML dashboard
  const html = generateHtml(report);
  
  // Save the dashboard
  const dashboardDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true });
  }
  
  const dashboardPath = path.join(dashboardDir, 'sla-dashboard.html');
  fs.writeFileSync(dashboardPath, html);
  
  success(`Dashboard generated at ${dashboardPath}`);
}

// Generate HTML for the dashboard
function generateHtml(report) {
  const timestamp = new Date(report.timestamp).toLocaleString();
  const complianceRate = percentage(report.withinSla, report.totalIssues - report.noSla);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SLA Monitoring Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    h1 {
      color: #2c3e50;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .card h2 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      font-size: 1.2em;
    }
    .stat {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat.good {
      color: #27ae60;
    }
    .stat.warning {
      color: #f39c12;
    }
    .stat.danger {
      color: #e74c3c;
    }
    .stat.neutral {
      color: #3498db;
    }
    .progress-container {
      height: 20px;
      background-color: #ecf0f1;
      border-radius: 10px;
      margin: 15px 0;
    }
    .progress-bar {
      height: 100%;
      border-radius: 10px;
      background-color: #2ecc71;
      width: ${complianceRate}%;
      transition: width 0.5s ease-in-out;
    }
    .progress-bar.warning {
      background-color: #f39c12;
    }
    .progress-bar.danger {
      background-color: #e74c3c;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th, table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    table th {
      background-color: #f8f9fa;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <header>
    <h1>SLA Monitoring Dashboard</h1>
    <p class="timestamp">Last updated: ${timestamp}</p>
  </header>
  
  <div class="dashboard-grid">
    <div class="card">
      <h2>Overall Compliance</h2>
      <div class="stat ${getComplianceClass(complianceRate)}">${complianceRate}%</div>
      <div class="progress-container">
        <div class="progress-bar ${getComplianceClass(complianceRate)}" style="width: ${complianceRate}%"></div>
      </div>
      <p>Based on ${report.totalIssues - report.noSla} issues with SLA</p>
    </div>
    
    <div class="card">
      <h2>Issue Status</h2>
      <table>
        <tr>
          <td>Within SLA</td>
          <td class="stat good" style="font-size: 1.2em">${report.withinSla}</td>
        </tr>
        <tr>
          <td>SLA Caution</td>
          <td class="stat warning" style="font-size: 1.2em">${report.slaCaution}</td>
        </tr>
        <tr>
          <td>SLA Breached</td>
          <td class="stat danger" style="font-size: 1.2em">${report.slaBreached}</td>
        </tr>
        <tr>
          <td>No SLA Applied</td>
          <td class="stat neutral" style="font-size: 1.2em">${report.noSla}</td>
        </tr>
      </table>
    </div>
    
    <div class="card">
      <h2>By Priority</h2>
      <table>
        <tr>
          <th>Priority</th>
          <th>Total</th>
          <th>Breached</th>
          <th>%</th>
        </tr>
        ${generatePriorityRows(report.issuesByPriority)}
      </table>
    </div>
  </div>
  
  <div class="card">
    <h2>SLA Targets</h2>
    <table>
      <tr>
        <th>Priority</th>
        <th>First Response</th>
        <th>Resolution Time</th>
      </tr>
      <tr>
        <td>Critical</td>
        <td>4 hours</td>
        <td>24 hours</td>
      </tr>
      <tr>
        <td>High</td>
        <td>8 hours</td>
        <td>48 hours</td>
      </tr>
      <tr>
        <td>Medium</td>
        <td>24 hours</td>
        <td>72 hours</td>
      </tr>
      <tr>
        <td>Low</td>
        <td>48 hours</td>
        <td>168 hours (1 week)</td>
      </tr>
    </table>
  </div>
  
  <div class="footer">
    <p>Generated by SLA Monitoring System | <a href="docs/sla-monitoring.md">View Documentation</a></p>
  </div>
</body>
</html>`;
}

// Generate table rows for priority data
function generatePriorityRows(priorityData) {
  let rows = '';
  
  for (const [priority, data] of Object.entries(priorityData)) {
    if (data.total > 0) {
      const breachPercentage = percentage(data.breached, data.total);
      const statusClass = breachPercentage > 20 ? 'danger' : (breachPercentage > 5 ? 'warning' : 'good');
      
      rows += `
        <tr>
          <td>${priority}</td>
          <td>${data.total}</td>
          <td>${data.breached}</td>
          <td class="${statusClass}">${breachPercentage}%</td>
        </tr>
      `;
    }
  }
  
  return rows;
}

// Get CSS class based on compliance rate
function getComplianceClass(rate) {
  if (rate < 70) return 'danger';
  if (rate < 90) return 'warning';
  return 'good';
}

// Calculate percentage
function percentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Run the script
generateDashboard().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
