# Team Workflow Diagram

This document provides visual representations of our team's workflows to complement the [Team Collaboration Protocols](team-collaboration.md).

## Sprint Workflow

```mermaid
graph TD
    A[Backlog Refinement] -->|Prioritized Issues| B[Sprint Planning]
    B -->|Assigned Tasks| C[Development]
    C -->|Code Changes| D[Pull Request]
    D -->|Review| E{Approved?}
    E -->|Yes| F[Merge to Development]
    E -->|No| C
    F -->|QA Passed| G[Deploy to Staging]
    G -->|Testing| H{Ready for Production?}
    H -->|Yes| I[Deploy to Production]
    H -->|No| C
    I --> J[Sprint Review]
    J --> K[Retrospective]
    K --> A
```

## Issue Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Triaged: Assign priority & labels
    Triaged --> InProgress: Developer assignment
    InProgress --> InReview: PR created
    InReview --> NeedsChanges: Review feedback
    NeedsChanges --> InReview: Address feedback
    InReview --> Approved: PR approved
    Approved --> Merged: Code merged
    Merged --> InTesting: Deploy to staging
    InTesting --> Done: Verified in production
    InTesting --> InProgress: Issues found
    Done --> [*]
```

## Git Branching Strategy

```mermaid
gitGraph
    commit id: "initial"
    branch development
    checkout development
    commit id: "setup project"
    branch feature/login
    checkout feature/login
    commit id: "add login form"
    commit id: "add authentication"
    checkout development
    merge feature/login
    branch fix/123
    checkout fix/123
    commit id: "fix bug #123"
    checkout development
    merge fix/123
    checkout main
    merge development tag: "v1.0.0"
    checkout development
    branch feature/profile
    checkout feature/profile
    commit id: "add user profile"
    checkout development
    merge feature/profile
    checkout main
    merge development tag: "v1.1.0"
```

## Code Review Process

```mermaid
sequenceDiagram
    participant D as Developer
    participant R as Reviewer
    participant CI as CI/CD Pipeline
    participant G as GitHub
    
    D->>G: Create Pull Request
    G->>CI: Trigger CI checks
    CI->>G: Report check results
    G->>R: Notify reviewer
    R->>G: Review code
    alt Changes requested
        G->>D: Request changes
        D->>G: Make changes
        G->>CI: Re-run checks
        CI->>G: Report updated results
        G->>R: Re-review
    else Approved
        R->>G: Approve PR
        D->>G: Merge PR
        G->>CI: Trigger deployment
    end
```

## SLA Monitoring Flow

```mermaid
graph TD
    A[New Issue Created] -->|Automatic| B[Priority Assignment]
    B -->|Based on type/labels| C{Priority Level}
    C -->|Critical| D[4h response, 24h resolution]
    C -->|High| E[8h response, 48h resolution]
    C -->|Medium| F[24h response, 72h resolution]
    C -->|Low| G[48h response, 168h resolution]
    D & E & F & G --> H[Automatic SLA Monitoring]
    H --> I{SLA Status}
    I -->|Within SLA| J[Green Label]
    I -->|Approaching Breach| K[Yellow Label]
    I -->|Breached| L[Red Label]
    J & K & L --> M[Weekly SLA Review]
```

## Communication Channels Decision Tree

```mermaid
graph TD
    A{What type of communication?} -->|Task tracking| B[GitHub Issues]
    A -->|Quick question| C[Slack]
    A -->|Formal announcement| D[Email]
    A -->|Complex discussion| E[Video Call]
    
    B -->|Bug report| F[Bug template]
    B -->|New feature| G[Feature template]
    B -->|Code improvement| H[Tech Debt template]
    
    C -->|Team channel| I[Public response]
    C -->|Direct question| J[DM]
    
    E -->|Scheduled meeting| K[Follow meeting protocol]
    E -->|Impromptu discussion| L[Document outcomes]
```

## Onboarding Process

```mermaid
graph TD
    A[New Team Member] --> B[Access Setup]
    B --> C[Documentation Review]
    C --> D[Environment Setup]
    D --> E[First Task Assignment]
    E --> F[Pair Programming]
    F --> G[First PR Submission]
    G --> H[Feedback & Review]
    H --> I[Regular Check-ins]
    I --> J[Independent Work]
```
