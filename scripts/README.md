# Scripts

This directory contains utility scripts for the Chatbot Fluxa project.

## Architecture Decision Records (ADRs)

### create-adr.js

A script to create a new Architecture Decision Record (ADR).

#### Usage

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x scripts/create-adr.js

# Create a new ADR with a title
node scripts/create-adr.js "Title of the ADR"

# Or run without arguments to be prompted for a title
node scripts/create-adr.js
```

The script will:
1. Generate the next available ADR number
2. Create a new ADR file from the template
3. Update the ADR README.md with the new entry

#### Example

```bash
node scripts/create-adr.js "Use GraphQL for API"
```

This will create a new ADR file `docs/adr/0006-use-graphql-for-api.md` and update the README.md file.
