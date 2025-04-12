# SLA Monitoring Guide

This document explains how Service Level Agreement (SLA) monitoring works in our project and how to use it effectively.

## Overview

We use automated SLA monitoring to ensure timely responses to issues and maintain high-quality support. The system automatically:

1. Tracks response and resolution times for issues
2. Labels issues based on their SLA status
3. Generates reports on SLA compliance
4. Alerts the team when SLAs are at risk of being breached

## SLA Targets

Our SLA targets are defined based on issue priority:

| Priority | First Response | Resolution Time |
|----------|---------------|-----------------|
| Critical | 4 hours       | 24 hours        |
| High     | 8 hours       | 48 hours        |
| Medium   | 24 hours      | 72 hours        |
| Low      | 48 hours      | 168 hours (1 week) |

> Note: These times are calculated based on working hours (9 AM - 5 PM, Monday-Friday) by default.

## Issue Priorities

Issues are assigned priorities based on their type and impact:

- **Critical**: Severe production issues affecting all users
- **High**: Important issues affecting many users
- **Medium**: Issues affecting some users or functionality
- **Low**: Minor issues, enhancements, or technical debt

Each issue type has a default priority:
- Bugs: Medium
- Feature requests: Low
- Technical debt: Low

## SLA Status Labels

The system automatically applies the following labels to issues:

- **status: within-sla**: Issue is within SLA targets
- **status: sla-caution**: Issue is approaching SLA breach (>75% of time elapsed)
- **status: sla-breached**: Issue has breached SLA targets
- **status: needs-response**: Issue needs an initial response
- **status: responded**: Issue has received a response

## How It Works

1. A GitHub workflow runs every 4 hours to check all open issues
2. For each issue, it:
   - Determines the issue type and priority
   - Calculates the time since creation
   - Checks if there has been a response
   - Updates labels based on SLA status
3. A report is generated and saved as an artifact in the workflow run

## Using SLA Monitoring

### Setting Issue Priority

To set an issue's priority, add one of these labels:
- `priority: critical`
- `priority: high`
- `priority: medium`
- `priority: low`

If no priority label is added, the default priority for the issue type will be used.

### Excluding Issues from SLA

To exclude an issue from SLA monitoring, add one of these labels:
- `duplicate`
- `wontfix`
- `invalid`

### Running SLA Monitoring Manually

You can run SLA monitoring manually:

1. In GitHub, go to the Actions tab
2. Select the "SLA Monitoring" workflow
3. Click "Run workflow"

Or locally:

```bash
npm install @octokit/rest
GITHUB_TOKEN=your_token npm run monitor-sla
```

### Viewing SLA Reports

SLA reports are available:
1. As artifacts in the GitHub Actions workflow runs
2. In the `reports` directory when run locally

## Customizing SLA Configuration

The SLA configuration is stored in `.github/sla-config.json`. You can modify:

- Priority levels and their response/resolution times
- Issue type default priorities
- Working hours settings
- Labels used for tracking

After changing the configuration, the next workflow run will use the updated settings.

## Best Practices

1. **Triage issues promptly**: Assign priority labels during initial triage
2. **Respond quickly**: Even a brief acknowledgment counts as a first response
3. **Update labels when needed**: You can manually update priority if circumstances change
4. **Monitor the SLA dashboard**: Check compliance regularly and address at-risk issues

## Troubleshooting

If you encounter issues with SLA monitoring:

1. Check the workflow run logs in GitHub Actions
2. Verify that the issue has the correct type and priority labels
3. Ensure the GitHub token has sufficient permissions
4. Check the SLA configuration file for errors
