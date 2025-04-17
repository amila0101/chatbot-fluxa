#!/usr/bin/env node

/**
 * Script to create a new Architecture Decision Record (ADR)
 * 
 * Usage: node create-adr.js "Title of the ADR"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the ADR title from command line arguments
const args = process.argv.slice(2);
let adrTitle = args.length > 0 ? args[0] : null;

// Function to prompt for ADR title if not provided
function promptForTitle() {
  return new Promise((resolve) => {
    rl.question('Enter the title for the new ADR: ', (answer) => {
      resolve(answer);
    });
  });
}

// Function to get the next ADR number
function getNextAdrNumber() {
  const adrDir = path.join(__dirname, '..', 'docs', 'adr');
  
  try {
    const files = fs.readdirSync(adrDir);
    
    // Filter for ADR files and extract numbers
    const adrNumbers = files
      .filter(file => /^\d{4}-.*\.md$/.test(file))
      .map(file => parseInt(file.substring(0, 4), 10));
    
    // Find the highest number and add 1, or start at 1 if no ADRs exist
    const nextNumber = adrNumbers.length > 0 ? Math.max(...adrNumbers) + 1 : 1;
    
    // Format with leading zeros
    return nextNumber.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error reading ADR directory:', error);
    process.exit(1);
  }
}

// Function to create a kebab-case filename from the title
function createFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
}

// Function to create the ADR file
function createAdrFile(number, title) {
  const adrDir = path.join(__dirname, '..', 'docs', 'adr');
  const templatePath = path.join(adrDir, '0000-adr-template.md');
  const filename = `${number}-${createFilename(title)}.md`;
  const filePath = path.join(adrDir, filename);
  
  try {
    // Read the template
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace the title placeholder
    template = template.replace('[ADR-0000] Architecture Decision Record Template', `[ADR-${number}] ${title}`);
    
    // Write the new ADR file
    fs.writeFileSync(filePath, template);
    
    console.log(`Created new ADR: ${filePath}`);
    return { number, title, filename };
  } catch (error) {
    console.error('Error creating ADR file:', error);
    process.exit(1);
  }
}

// Function to update the README.md file
function updateReadme(adr) {
  const readmePath = path.join(__dirname, '..', 'docs', 'adr', 'README.md');
  
  try {
    // Read the current README
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // Check if the ADR is already in the list
    if (readme.includes(`[ADR-${adr.number}]`)) {
      console.log('ADR already listed in README.md');
      return;
    }
    
    // Find the list of ADRs section
    const listMatch = readme.match(/## List of ADRs\n\n([\s\S]*?)(\n\n|$)/);
    
    if (listMatch) {
      // Add the new ADR to the list
      const listSection = listMatch[1];
      const newEntry = `- [ADR-${adr.number}](${adr.filename}) - ${adr.title}\n`;
      const newListSection = listSection + newEntry;
      
      // Replace the old list with the new list
      readme = readme.replace(listSection, newListSection);
      
      // Write the updated README
      fs.writeFileSync(readmePath, readme);
      
      console.log('Updated README.md with the new ADR');
    } else {
      console.warn('Could not find "## List of ADRs" section in README.md');
    }
  } catch (error) {
    console.error('Error updating README.md:', error);
  }
}

// Main function
async function main() {
  try {
    // Get the ADR title if not provided
    if (!adrTitle) {
      adrTitle = await promptForTitle();
    }
    
    if (!adrTitle) {
      console.error('ADR title is required');
      process.exit(1);
    }
    
    // Get the next ADR number
    const adrNumber = getNextAdrNumber();
    
    // Create the ADR file
    const adr = createAdrFile(adrNumber, adrTitle);
    
    // Update the README.md file
    updateReadme(adr);
    
    console.log(`\nSuccessfully created ADR-${adrNumber}: ${adrTitle}`);
    console.log('\nNext steps:');
    console.log(`1. Edit docs/adr/${adr.filename} to document your decision`);
    console.log('2. Review the ADR with your team');
    console.log('3. Commit the changes to version control');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
