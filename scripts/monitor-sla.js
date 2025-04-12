#!/usr/bin/env node

/**
 * SLA Monitoring Script
 * 
 * This script checks GitHub issues against defined SLA targets and updates labels accordingly.
 * It also generates a report of current SLA compliance.
 */

const { Octokit } = require('@octokit/rest');
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
async function monitorSla() {
  log('🕒 Monitoring SLA compliance...', colors.cyan);
  
  // Check if GitHub token is available
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    error('GitHub token not found. Set the GITHUB_TOKEN environment variable.');
    process.exit(1);
  }
  
  // Get repository information
  const owner = process.env.GITHUB_REPOSITORY_OWNER || 'owner';
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'repo';
  
  // Initialize Octokit
  const octokit = new Octokit({ auth: token });
  
  // Load SLA configuration
  const slaConfigPath = path.join(process.cwd(), '.github', 'sla-config.json');
  if (!fs.existsSync(slaConfigPath)) {
    error('SLA configuration file not found at .github/sla-config.json');
    process.exit(1);
  }
  
  const slaConfig = JSON.parse(fs.readFileSync(slaConfigPath, 'utf8'));
  
  // Ensure required labels exist
  await ensureLabelsExist(octokit, owner, repo, slaConfig);
  
  // Get open issues
  info('Fetching open issues...');
  const issues = await fetchAllOpenIssues(octokit, owner, repo);
  success(`Found ${issues.length} open issues`);
  
  // Process each issue
  const slaReport = {
    totalIssues: issues.length,
    withinSla: 0,
    slaCaution: 0,
    slaBreached: 0,
    noSla: 0,
    issuesByPriority: {
      critical: { total: 0, breached: 0 },
      high: { total: 0, breached: 0 },
      medium: { total: 0, breached: 0 },
      low: { total: 0, breached: 0 },
      none: { total: 0, breached: 0 }
    }
  };
  
  for (const issue of issues) {
    await processIssue(octokit, owner, repo, issue, slaConfig, slaReport);
  }
  
  // Generate report
  generateReport(slaReport);
}

// Ensure all required labels exist in the repository
async function ensureLabelsExist(octokit, owner, repo, slaConfig) {
  info('Ensuring required labels exist...');
  
  // Collect all required labels
  const requiredLabels = [
    // Priority labels
    ...Object.values(slaConfig.priorities).map(p => ({ 
      name: p.label, 
      color: getPriorityColor(p.label),
      description: `Priority level: ${p.label.replace('priority: ', '')}`
    })),
    
    // SLA status labels
    { 
      name: slaConfig.slaLabels.withinSla, 
      color: '0e8a16', 
      description: 'Issue is within SLA targets' 
    },
    { 
      name: slaConfig.slaLabels.slaCaution, 
      color: 'fbca04', 
      description: 'Issue is approaching SLA breach' 
    },
    { 
      name: slaConfig.slaLabels.slaBreached, 
      color: 'd93f0b', 
      description: 'Issue has breached SLA targets' 
    },
    
    // Response labels
    { 
      name: slaConfig.responseLabels.needsResponse, 
      color: 'f9d0c4', 
      description: 'Issue needs a response' 
    },
    { 
      name: slaConfig.responseLabels.responded, 
      color: 'c5def5', 
      description: 'Issue has received a response' 
    }
  ];
  
  // Get existing labels
  const { data: existingLabels } = await octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100
  });
  
  const existingLabelNames = existingLabels.map(label => label.name);
  
  // Create missing labels
  for (const label of requiredLabels) {
    if (!existingLabelNames.includes(label.name)) {
      info(`Creating label: ${label.name}`);
      try {
        await octokit.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description
        });
      } catch (err) {
        warning(`Failed to create label ${label.name}: ${err.message}`);
      }
    }
  }
  
  success('Labels verified');
}

// Get color for priority label
function getPriorityColor(priorityLabel) {
  const priority = priorityLabel.replace('priority: ', '');
  switch (priority) {
    case 'critical': return 'b60205'; // dark red
    case 'high': return 'd93f0b';     // red
    case 'medium': return 'fbca04';   // yellow
    case 'low': return '0e8a16';      // green
    default: return 'cccccc';         // gray
  }
}

// Fetch all open issues
async function fetchAllOpenIssues(octokit, owner, repo) {
  const allIssues = [];
  let page = 1;
  let hasMoreIssues = true;
  
  while (hasMoreIssues) {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page
    });
    
    // Filter out pull requests (they're also returned by the issues API)
    const filteredIssues = issues.filter(issue => !issue.pull_request);
    
    allIssues.push(...filteredIssues);
    
    hasMoreIssues = issues.length === 100;
    page++;
  }
  
  return allIssues;
}

// Process a single issue
async function processIssue(octokit, owner, repo, issue, slaConfig, slaReport) {
  const issueNumber = issue.number;
  const issueLabels = issue.labels.map(label => label.name);
  
  // Skip issues with exclude labels
  if (issueLabels.some(label => slaConfig.excludeLabels.includes(label))) {
    info(`Skipping issue #${issueNumber} (excluded by label)`);
    slaReport.noSla++;
    return;
  }
  
  // Determine issue type and priority
  const issueType = determineIssueType(issueLabels, slaConfig);
  const priority = determinePriority(issueLabels, issueType, slaConfig);
  
  if (!priority) {
    info(`Issue #${issueNumber} has no priority - skipping SLA check`);
    slaReport.noSla++;
    slaReport.issuesByPriority.none.total++;
    return;
  }
  
  // Update report counts
  slaReport.issuesByPriority[priority].total++;
  
  // Get SLA targets for this priority
  const slaTargets = slaConfig.priorities[priority];
  
  // Calculate SLA times
  const createdAt = new Date(issue.created_at);
  const now = new Date();
  const hoursSinceCreation = calculateWorkingHours(createdAt, now, slaConfig.workingHours);
  
  // Check first response status
  const hasResponse = await checkFirstResponse(octokit, owner, repo, issue, createdAt);
  const responseStatus = hasResponse ? 'responded' : 'needsResponse';
  
  // Determine SLA status
  let slaStatus;
  if (hoursSinceCreation > slaTargets.resolutionTime) {
    slaStatus = 'slaBreached';
    slaReport.slaBreached++;
    slaReport.issuesByPriority[priority].breached++;
  } else if (hoursSinceCreation > slaTargets.resolutionTime * 0.75) {
    slaStatus = 'slaCaution';
    slaReport.slaCaution++;
  } else {
    slaStatus = 'withinSla';
    slaReport.withinSla++;
  }
  
  // Update labels
  await updateIssueLabels(
    octokit, 
    owner, 
    repo, 
    issueNumber, 
    issueLabels,
    slaConfig.slaLabels[slaStatus],
    slaConfig.responseLabels[responseStatus],
    Object.values(slaConfig.slaLabels),
    Object.values(slaConfig.responseLabels)
  );
  
  info(`Processed issue #${issueNumber}: ${slaStatus}, ${responseStatus}`);
}

// Determine issue type based on labels
function determineIssueType(issueLabels, slaConfig) {
  for (const [type, config] of Object.entries(slaConfig.issueTypes)) {
    if (issueLabels.includes(config.label)) {
      return type;
    }
  }
  return null;
}

// Determine priority based on labels
function determinePriority(issueLabels, issueType, slaConfig) {
  // First check if there's an explicit priority label
  for (const [priority, config] of Object.entries(slaConfig.priorities)) {
    if (issueLabels.includes(config.label)) {
      return priority;
    }
  }
  
  // If no priority label but we know the issue type, use its default priority
  if (issueType && slaConfig.issueTypes[issueType]) {
    return slaConfig.issueTypes[issueType].defaultPriority;
  }
  
  return null;
}

// Calculate working hours between two dates
function calculateWorkingHours(startDate, endDate, workingHoursConfig) {
  if (!workingHoursConfig.enabled) {
    // Simple calculation without working hours
    return (endDate - startDate) / (1000 * 60 * 60);
  }
  
  let hours = 0;
  const currentDate = new Date(startDate);
  const { startHour, endHour, workingDays } = workingHoursConfig;
  const workingHoursPerDay = endHour - startHour;
  
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = currentDate.getHours();
    
    // Check if it's a working day
    if (workingDays.includes(dayOfWeek)) {
      // If within working hours, add an hour
      if (currentHour >= startHour && currentHour < endHour) {
        hours++;
      }
    }
    
    // Move to the next hour
    currentDate.setHours(currentDate.getHours() + 1);
  }
  
  return hours;
}

// Check if an issue has received a first response
async function checkFirstResponse(octokit, owner, repo, issue, createdAt) {
  const issueNumber = issue.number;
  const issueAuthor = issue.user.login;
  
  // Get all comments on the issue
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100
  });
  
  // Check if there's a comment from someone other than the issue author
  return comments.some(comment => 
    comment.user.login !== issueAuthor && 
    new Date(comment.created_at) > createdAt
  );
}

// Update issue labels
async function updateIssueLabels(
  octokit, 
  owner, 
  repo, 
  issueNumber, 
  currentLabels, 
  newSlaLabel, 
  newResponseLabel,
  allSlaLabels,
  allResponseLabels
) {
  // Remove existing SLA and response labels
  const labelsToKeep = currentLabels.filter(label => 
    !allSlaLabels.includes(label) && !allResponseLabels.includes(label)
  );
  
  // Add new SLA and response labels
  const updatedLabels = [...labelsToKeep, newSlaLabel, newResponseLabel];
  
  try {
    await octokit.issues.setLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: updatedLabels
    });
  } catch (err) {
    warning(`Failed to update labels for issue #${issueNumber}: ${err.message}`);
  }
}

// Generate SLA compliance report
function generateReport(report) {
  log('\n📊 SLA Compliance Report', colors.magenta);
  log('=======================', colors.magenta);
  
  log(`Total Issues: ${report.totalIssues}`, colors.cyan);
  log(`Within SLA: ${report.withinSla} (${percentage(report.withinSla, report.totalIssues)}%)`, colors.green);
  log(`SLA Caution: ${report.slaCaution} (${percentage(report.slaCaution, report.totalIssues)}%)`, colors.yellow);
  log(`SLA Breached: ${report.slaBreached} (${percentage(report.slaBreached, report.totalIssues)}%)`, colors.red);
  log(`No SLA Applied: ${report.noSla} (${percentage(report.noSla, report.totalIssues)}%)`, colors.reset);
  
  log('\nBreakdown by Priority:', colors.cyan);
  for (const [priority, counts] of Object.entries(report.issuesByPriority)) {
    if (counts.total > 0) {
      const breachPercentage = percentage(counts.breached, counts.total);
      const color = breachPercentage > 20 ? colors.red : (breachPercentage > 5 ? colors.yellow : colors.green);
      log(`  ${priority}: ${counts.total} issues, ${counts.breached} breached (${breachPercentage}%)`, color);
    }
  }
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    ...report
  };
  
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, `sla-report-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  success(`Report saved to ${reportPath}`);
}

// Calculate percentage
function percentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

// Run the script
monitorSla().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
