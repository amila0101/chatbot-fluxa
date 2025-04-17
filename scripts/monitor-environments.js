#!/usr/bin/env node

/**
 * Blue-Green Environment Monitoring Script
 * 
 * This script monitors both blue and green environments and generates
 * a report on their status, performance, and differences.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');
const colors = require('chalk');
const { program } = require('commander');

// Parse command line arguments
program
  .option('-o, --output <type>', 'Output format (console, json, html)', 'console')
  .option('-i, --interval <seconds>', 'Monitoring interval in seconds', '60')
  .option('--blue <url>', 'Blue environment URL', process.env.BLUE_URL || 'https://blue.chatbot-fluxa.com')
  .option('--green <url>', 'Green environment URL', process.env.GREEN_URL || 'https://green.chatbot-fluxa.com')
  .option('--prod <url>', 'Production URL', process.env.PROD_URL || 'https://chatbot-fluxa.com')
  .option('--token <token>', 'Internal check token', process.env.INTERNAL_CHECK_TOKEN)
  .option('--detailed', 'Use detailed health checks', false)
  .parse(process.argv);

const options = program.opts();

// Configuration
const config = {
  environments: {
    production: {
      name: 'Production',
      url: options.prod,
      color: colors.yellow
    },
    blue: {
      name: 'Blue',
      url: options.blue,
      color: colors.blue
    },
    green: {
      name: 'Green',
      url: options.green,
      color: colors.green
    }
  },
  healthEndpoint: options.detailed ? '/api/health/detailed' : '/api/health',
  outputDir: path.join(__dirname, '..', 'monitoring'),
  interval: parseInt(options.interval, 10) * 1000,
  internalCheckToken: options.token
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Fetch health data from an environment
async function fetchHealthData(env) {
  const { name, url, color } = config.environments[env];
  const healthUrl = `${url}${config.healthEndpoint}`;
  
  console.log(`${color(`[${name}]`)} Checking health at ${healthUrl}`);
  
  try {
    const headers = {};
    if (config.internalCheckToken) {
      headers['x-internal-check'] = config.internalCheckToken;
    }
    
    const startTime = Date.now();
    const response = await axios.get(healthUrl, { 
      headers,
      timeout: 10000 
    });
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'ok',
      name,
      url,
      responseTime,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      name,
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Generate console report
function generateConsoleReport(results) {
  const table = new Table({
    head: ['Environment', 'Status', 'Response Time', 'Version', 'Active Env', 'Uptime'],
    style: {
      head: ['cyan']
    }
  });
  
  for (const env of Object.keys(results)) {
    const result = results[env];
    const { name } = config.environments[env];
    
    if (result.status === 'ok') {
      const { data, responseTime } = result;
      table.push([
        name,
        colors.green('✓ OK'),
        `${responseTime}ms`,
        data.version || 'N/A',
        data.environment || 'N/A',
        data.uptime ? `${Math.floor(data.uptime / 60)} min` : 'N/A'
      ]);
    } else {
      table.push([
        name,
        colors.red('✗ ERROR'),
        'N/A',
        'N/A',
        'N/A',
        'N/A'
      ]);
    }
  }
  
  console.log(`\nEnvironment Status Report - ${new Date().toLocaleString()}`);
  console.log(table.toString());
  
  // Check for differences between environments
  if (results.blue.status === 'ok' && results.green.status === 'ok') {
    console.log('\nEnvironment Comparison:');
    
    const blueData = results.blue.data;
    const greenData = results.green.data;
    
    if (blueData.version !== greenData.version) {
      console.log(`- ${colors.yellow('Version mismatch:')} Blue: ${blueData.version}, Green: ${greenData.version}`);
    }
    
    if (blueData.model !== greenData.model) {
      console.log(`- ${colors.yellow('Model mismatch:')} Blue: ${blueData.model}, Green: ${greenData.model}`);
    }
    
    // Compare response times
    const blueTime = results.blue.responseTime;
    const greenTime = results.green.responseTime;
    const diff = Math.abs(blueTime - greenTime);
    const percentage = Math.round((diff / Math.min(blueTime, greenTime)) * 100);
    
    if (percentage > 20) {
      console.log(`- ${colors.yellow('Performance difference:')} ${percentage}% (Blue: ${blueTime}ms, Green: ${greenTime}ms)`);
    }
  }
}

// Generate JSON report
function generateJsonReport(results) {
  const reportPath = path.join(config.outputDir, `report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`JSON report saved to ${reportPath}`);
}

// Generate HTML report
function generateHtmlReport(results) {
  const reportPath = path.join(config.outputDir, `report-${Date.now()}.html`);
  
  let tableRows = '';
  for (const env of Object.keys(results)) {
    const result = results[env];
    const { name } = config.environments[env];
    
    if (result.status === 'ok') {
      const { data, responseTime } = result;
      tableRows += `
        <tr>
          <td>${name}</td>
          <td class="status-ok">OK</td>
          <td>${responseTime}ms</td>
          <td>${data.version || 'N/A'}</td>
          <td>${data.environment || 'N/A'}</td>
          <td>${data.uptime ? `${Math.floor(data.uptime / 60)} min` : 'N/A'}</td>
        </tr>
      `;
    } else {
      tableRows += `
        <tr>
          <td>${name}</td>
          <td class="status-error">ERROR</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
        </tr>
      `;
    }
  }
  
  // Check for differences
  let comparisonSection = '';
  if (results.blue.status === 'ok' && results.green.status === 'ok') {
    const blueData = results.blue.data;
    const greenData = results.green.data;
    const differences = [];
    
    if (blueData.version !== greenData.version) {
      differences.push(`<li>Version mismatch: Blue: ${blueData.version}, Green: ${greenData.version}</li>`);
    }
    
    if (blueData.model !== greenData.model) {
      differences.push(`<li>Model mismatch: Blue: ${blueData.model}, Green: ${greenData.model}</li>`);
    }
    
    // Compare response times
    const blueTime = results.blue.responseTime;
    const greenTime = results.green.responseTime;
    const diff = Math.abs(blueTime - greenTime);
    const percentage = Math.round((diff / Math.min(blueTime, greenTime)) * 100);
    
    if (percentage > 20) {
      differences.push(`<li>Performance difference: ${percentage}% (Blue: ${blueTime}ms, Green: ${greenTime}ms)</li>`);
    }
    
    if (differences.length > 0) {
      comparisonSection = `
        <div class="comparison">
          <h2>Environment Comparison</h2>
          <ul>
            ${differences.join('\n')}
          </ul>
        </div>
      `;
    }
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blue-Green Environment Status</title>
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
        .status-ok {
          color: #2e7d32;
          font-weight: bold;
        }
        .status-error {
          color: #c62828;
          font-weight: bold;
        }
        .comparison {
          margin: 20px 0;
          padding: 15px;
          background-color: #fff8e1;
          border-radius: 4px;
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
      <h1>Blue-Green Environment Status</h1>
      
      <table>
        <thead>
          <tr>
            <th>Environment</th>
            <th>Status</th>
            <th>Response Time</th>
            <th>Version</th>
            <th>Active Env</th>
            <th>Uptime</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      ${comparisonSection}
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`HTML report saved to ${reportPath}`);
}

// Run monitoring once
async function runMonitoring() {
  console.log(`\n${colors.cyan('Blue-Green Environment Monitoring')}`);
  console.log(`${colors.cyan('================================')}`);
  
  const results = {
    production: await fetchHealthData('production'),
    blue: await fetchHealthData('blue'),
    green: await fetchHealthData('green')
  };
  
  // Generate report based on output format
  switch (options.output) {
    case 'json':
      generateJsonReport(results);
      break;
    case 'html':
      generateHtmlReport(results);
      break;
    case 'console':
    default:
      generateConsoleReport(results);
      break;
  }
}

// Main function
async function main() {
  if (config.interval > 0) {
    // Continuous monitoring
    console.log(`Starting continuous monitoring (interval: ${config.interval / 1000}s)`);
    
    // Run immediately
    await runMonitoring();
    
    // Then run on interval
    setInterval(runMonitoring, config.interval);
  } else {
    // Run once
    await runMonitoring();
  }
}

// Run the script
main().catch(error => {
  console.error('Error in monitoring script:', error);
  process.exit(1);
});
