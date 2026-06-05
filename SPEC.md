# AI Autonomy Mapper - Technical Specification

## Table of Contents
1. [Overview](#overview)
2. [Purpose & Business Value](#purpose--business-value)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Technology Stack](#technology-stack)
6. [Architecture](#architecture)
7. [Data Model](#data-model)
8. [Implementation Platforms](#implementation-platforms)
9. [Future Features](#future-features)
10. [Changelog](#changelog)
11. [Contributing](#contributing)
12. [License](#license)
13. [Conclusion](#conclusion)

---

## Overview

**AI Autonomy Mapper** is an enterprise-grade framework designed to assess AI autonomy potential across any job role or organizational capability. It provides data-driven insights into which tasks are suitable for AI automation, which require human oversight, and which benefit from shared human-AI collaboration.

The framework uses a proprietary zone-based autonomy scoring algorithm that evaluates capabilities across three dimensions:
- **Core Responsibilities** — Essential functions critical to role definition
- **Contextual Tasks** — Supporting activities dependent on domain context
- **Shared Operations** — Cross-functional processes with distributed decision-making

Users answer 10 clarifying questions to contextualize their role, decompose capabilities into discrete tasks, and receive a visual heatmap showing autonomy levels (L1–L5) and AI exposure scores (Human → Fully AI).

---

## Purpose & Business Value

### Business Objectives
1. **Strategic AI Planning** — Enable organizations to quantify AI automation readiness across the workforce
2. **Risk Mitigation** — Identify high-judgment, high-risk tasks requiring human control before automating
3. **Workforce Transformation** — Guide training, reskilling, and organizational restructuring decisions
4. **Competitive Advantage** — Accelerate time-to-value for AI investments by targeting highest-ROI automation opportunities

### Key Benefits
- **Data-Driven Decisions** — Replace gut-feel automation assessments with algorithmic rigor
- **Role-Based Insights** — Generate role-specific autonomy roadmaps (e.g., "PM autonomy at L3 = 65% AI support")
- **Cross-Platform Accessibility** — Analyze from Teams, web app, CLI, API, or Claude Plugin
- **Audit Trail** — Export reports in multiple formats (Markdown, JSON, CSV) for governance and compliance
- **Scalability** — Single-user assessments to enterprise-wide workforce mapping campaigns

### Business Outcomes
- Reduce manual assessment time from days to minutes
- Quantify total addressable automation (TAA) for CFO/board presentations
- Align AI investment priorities with actual workforce needs
- Build stakeholder consensus via transparent, visual heatmaps

---

## Functional Requirements

### Core Analysis Workflow (6-Phase)

#### Phase 1: Role Definition
- Capture job title/role name
- Optionally add organizational context (industry, company size, region)
- **Output:** Role profile with contextual metadata

#### Phase 2: Clarifying Questions
- **4 question groups (10 total):**
  - **Capability Definition (Q1–Q3)** — What are the main tasks?
  - **AI Suitability (Q4–Q6)** — Is AI a good fit? (complexity, data availability, judgment needed)
  - **Risk & Governance (Q7–Q8)** — What are the risks? (regulatory, safety, reputational)
  - **Autonomy Target (Q9–Q10)** — What autonomy level do you want to achieve?
- Free-text answers; optional contextual follow-ups
- **Output:** Structured answers dict mapped to Q keys (q1–q10)

#### Phase 3: Capability Decomposition
- Parse Q1–Q3 answers to extract task descriptions
- Auto-generate 10–15 discrete, zone-labeled capabilities (Core/Contextual/Shared)
- Detect feature flags from answer text (e.g., if Q1 mentions "repetitive," flag capability with `repetitive: true`)
- **Flags:**
  - `repetitive` — Task occurs frequently; automation boosts efficiency
  - `dataRich` — Requires complex data integration; AI adds value
  - `highJudgment` — Domain expertise required; lower autonomy recommendation
  - `highRisk` — Legal, safety, or reputational consequences; cap autonomy at L2/L3

#### Phase 4: Capability Review
- Display auto-generated capabilities with edit UI
- Allow user to: view, edit name, change zone assignment, toggle flags, delete, add custom
- **Output:** Final capability list with user-approved modifications

#### Phase 5: Autonomy Target Selection
- User selects desired autonomy level (L1–L5):
  - **L1:** Human-centric (AI minimal role)
  - **L2:** Mostly Human (AI advisory)
  - **L3:** Shared (50-50 human-AI)
  - **L4:** Mostly AI (AI lead, human oversight)
  - **L5:** Fully AI (Autonomous, no human oversight)
- Default recommendation: L3
- **Output:** Target autonomy level for scoring

#### Phase 6: Autonomy Mapping & Report
- Score each capability across all autonomy levels (L1–L5) using scoring engine
- Generate exposure score (HUMAN / MOSTLY_HUMAN / SHARED / MOSTLY_AI / AI) for target level
- Render heatmap showing capability vs. autonomy level grid with emoji indicators
- Calculate summary statistics (% high-automation, % human-centric)
- Generate exportable report (Markdown, JSON, CSV)
- **Output:** Session with autonomyMap array, heatmap display, downloadable artifacts

### Session Management
- **Create Session** — Initialize new analysis (role, context)
- **Save Session** — Persist to file-based store (CLI) or in-memory (API) or Teams/Copilot state
- **Load Session** — Retrieve prior analysis for review/export
- **List Sessions** — Display all saved analyses with metadata
- **Delete Session** — Remove session and associated data
- **Export Session** — Output to Markdown (formatted table), JSON (full session object), CSV (capabilities list)

### Scoring Algorithm (Autonomy Engine)

#### Base Scores (per zone, per autonomy level)
```
Core:       [1, 2, 3, 4, 4]      (L1-L5)
Contextual: [0, 1, 2, 3, 3]
Shared:     [0, 0, 1, 1, 2]
```

#### Modifiers
- `repetitive: true` → +1 score
- `dataRich: true` → +0.5 score
- `highJudgment: true` → -1 score
- `highRisk: true` → Cap score at 2 (max Shared level)

#### Output Mapping (numeric score → exposure emoji)
- 0–0.5: 🟦 HUMAN
- 0.51–1.5: 🟩 MOSTLY_HUMAN
- 1.51–2.5: 🟨 SHARED
- 2.51–3.5: 🟧 MOSTLY_AI
- 3.51–4.0: 🟥 AI

---

## Non-Functional Requirements

### Performance
- **Analysis Response Time:** ≤2 seconds end-to-end (decomposition → scoring → heatmap)
- **Session Load:** ≤100ms for list operations (up to 10,000 sessions)
- **Concurrent Users:** 100+ simultaneous API requests without degradation
- **Export Generation:** ≤500ms for Markdown/JSON/CSV (any session size)

### Reliability & Availability
- **Uptime SLA:** 99.5% for API service (REST endpoints)
- **Data Persistence:** No data loss on session save (file-based or DB backup)
- **Error Handling:** Graceful degradation; all errors return structured JSON/error messages
- **Validation:** Request validation prevents invalid state transitions

### Security
- **Input Validation:** Zod schemas for all REST API payloads
- **Authentication:** Delegated to platform auth (Teams OAuth, API keys, Claude Plugin user session)
- **Authorization:** Role-based access (future: org-level, team-level session isolation)
- **Data Privacy:** Sessions contain no PII by default; user responsible for anonymizing role/context
- **HTTPS Only:** API enforces TLS for production deployments

### Scalability
- **Session Storage:** Stateless API design; session store pluggable (in-memory, file, DB)
- **Horizontal Scaling:** API is stateless; deploy multiple instances behind load balancer
- **Database Readiness:** Schema-agnostic storage layer; migrate to PostgreSQL/DynamoDB without code changes

### User Experience
- **Web UI:** React SPA with responsive Tailwind CSS (mobile-friendly)
- **CLI:** Interactive prompts with chalk colors, ASCII tables, session management
- **Teams Integration:** Declarative agent with natural language conversation
- **API:** OpenAPI 3.0 documentation; curl/Postman ready
- **Export Quality:** Professional Markdown tables, JSON structure, CSV data format

### Maintainability
- **Code Organization:** Modular architecture (types → services → routes → UI)
- **Type Safety:** TypeScript strict mode across all implementations
- **Test Coverage:** Unit tests for scoring engine, integration tests for workflows
- **Documentation:** Inline comments, README per platform, OpenAPI spec

---

## Technology Stack

### Shared Core
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | TypeScript | 5.4+ | Type-safe development |
| Validation | Zod | 3.23+ | Runtime request validation |
| UUID Generation | uuid | 10.0+ | Session ID generation |

### Standalone Web App
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.3+ |
| Router | React Router | 6.24+ |
| State Mgmt | Zustand | 4.5+ |
| Bundler | Vite | 5.3+ |
| Styling | Tailwind CSS | 3.4+ |
| Icons | Lucide React | Latest |
| PDF Export | jsPDF | Latest |
| Canvas | html2canvas | Latest |

### CLI Tool
| Component | Technology | Version |
|-----------|-----------|---------|
| CLI Framework | Commander.js | 12.1+ |
| Prompts | @inquirer/prompts | 5.0+ |
| Terminal Colors | Chalk | 5.3+ |
| Tables | cli-table3 | 0.6+ |
| Runtime | Node.js | 18+ |
| File I/O | Node fs/path | Built-in |

### REST API
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Express.js | 4.19+ |
| Validation | Zod | 3.23+ |
| Middleware | Express built-in | 4.19+ |
| Type Definitions | @types/express | 4.17+ |
| HTTP Client (tests) | curl/Postman | N/A |

### Teams/Copilot Integration
| Component | Technology | Version |
|-----------|-----------|---------|
| Agent Framework | Teams AI Toolkit | Latest |
| Agent Type | Declarative Agent | Latest |
| State | Teams Bot SDK | Latest |
| Runtime | Node.js / Teams | Latest |

### Claude Plugin
| Component | Technology | Version |
|-----------|-----------|---------|
| Server | MCP Server (Node) | Latest |
| Protocol | Model Context Protocol | Latest |
| Tools | Custom 5-tool interface | N/A |
| Runtime | Node.js | 18+ |

### DevOps & Build
| Tool | Purpose | Version |
|------|---------|---------|
| npm | Package management | 10+ |
| TypeScript Compiler | TS → JS compilation | 5.4+ |
| ts-node-dev | Dev auto-reload (API) | 2.0+ |
| tsx | TS execution (CLI dev) | 4.15+ |
| Git | Version control | 2.40+ |

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│             Shared Autonomy Scoring Engine              │
│  (autonomy-engine.ts: scoring, decomposition logic)    │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────┴─────┐    ┌────────┴────────┐   ┌─────┴──────┐
   │ CLI Tool  │    │  REST API       │   │Teams/Claude│
   │ (Node.js) │    │ (Express)       │   │ (Declarative)
   └───────────┘    └─────────────────┘   └─────────────┘
        │                   │                   │
   ┌────┴─────┐    ┌────────┴────────┐   ┌─────┴──────┐
   │ File I/O  │    │Session Store(*)│   │Teams Auth  │
   │ ~/.autonomy    │(In-mem or DB)   │   │Bot State   │
   └───────────┘    └─────────────────┘   └─────────────┘
                            │
                    ┌────────┴─────────┐
                    │                  │
               ┌────┴────┐        ┌────┴────┐
               │React SPA │        │ Export  │
               │(Browser) │        │Services │
               └──────────┘        └─────────┘
```

### Layer Architecture

1. **Types Layer** (`types/autonomy.ts`)
   - Enums: AutonomyLevel, ExposureScore, CapabilityZone
   - Interfaces: Capability, AutonomyMapping, AnalysisSession, ClarifyingQuestion
   - Constants: AUTONOMY_LEVELS, LEVEL_LABELS, EXPOSURE_EMOJI

2. **Service Layer**
   - `autonomy-engine.ts` — Scoring, decomposition, mapping (pure functions)
   - `session-store.ts` — CRUD operations on sessions (persistence agnostic)

3. **Middleware Layer (API)**
   - `errorHandler.ts` — Global error handling, standardized response format
   - `validation.ts` — Zod schemas for request validation

4. **Route/Controller Layer**
   - `sessions.ts` — Session CRUD endpoints + analyze workflow
   - `export.ts` — Export to Markdown/CSV/JSON
   - `analyze.ts` (CLI) — Interactive 6-phase workflow

5. **UI Layer**
   - React components (standalone-app): Home, RoleStep, QuestionsStep, etc.
   - Chalk + cli-table3 (CLI): displayHeatmap(), displayCapabilityTable()
   - Teams SDK (Teams Agent): Declarative agent conversation handlers

### Data Flow: Analysis Workflow

```
User Input (Role, Q1-Q10 Answers)
    ↓
Phase 1-2: Prompt for role + answers
    ↓
Phase 3: decomposeCapabilities() → [Capability]
    ↓
Phase 4: User reviews/edits capabilities
    ↓
Phase 5: User selects autonomy target (L1-L5)
    ↓
Phase 6: mapAutonomyLevels() → [AutonomyMapping]
    ↓
scoreCapability() for each (Core/Contextual/Shared → L1-L5)
    ↓
Render heatmap (capability × autonomy grid with emoji)
    ↓
Export to Markdown/JSON/CSV
```

---

## Data Model

### Core Types

```typescript
// Autonomy Level (user's target goal)
type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

// AI Exposure Score (output of scoring for given level)
type ExposureScore = 'HUMAN' | 'MOSTLY_HUMAN' | 'SHARED' | 'MOSTLY_AI' | 'AI'

// Capability Zone (categorization of tasks)
type CapabilityZone = 'Core' | 'Contextual' | 'Shared'

// Single capability with scores
interface Capability {
  id: string
  name: string
  zone: CapabilityZone
  notes?: string
  flags: {
    repetitive: boolean
    dataRich: boolean
    highJudgment: boolean
    highRisk: boolean
  }
}

// Capability mapped to all autonomy levels
interface AutonomyMapping {
  capabilityId: string
  capability: Capability
  scores: Record<AutonomyLevel, ExposureScore>  // L1-L5 → emoji
}

// Clarifying question
interface ClarifyingQuestion {
  id: string
  group: 'capability_definition' | 'ai_suitability' | 'risk_governance' | 'autonomy_target'
  question: string
  required: boolean
}

// User session (persisted)
interface AnalysisSession {
  id: string
  role: string
  context?: string
  answers: Record<string, string>  // q1-q10 → user text
  capabilities: Capability[]
  autonomyMap: AutonomyMapping[]
  autonomyTarget: AutonomyLevel
  createdAt: string  // ISO 8601
  updatedAt: string
}
```

### Session Persistence

- **CLI:** File-based, `~/.autonomy-mapper/sessions/{id}.json`
- **API:** In-memory (dev) or database-agnostic store interface
- **Standalone Web:** Browser localStorage (client-side) or optional backend sync
- **Teams:** Teams Bot SDK storage (encrypted, per-team)
- **Claude Plugin:** Ephemeral (no persistence required; Claude context window)

---

## Implementation Platforms

### 1. Standalone Web App (React/Vite)
**Location:** `src/standalone-app`

**Features:**
- 6-phase wizard UI with progress indicator
- Emoji heatmap renderer (canvas-based for PDF export)
- Real-time form validation with Zustand store
- Export to Markdown, JSON, or PDF
- No backend required; runs entirely in browser

**Build & Run:**
```bash
cd src/standalone-app
npm install
npm run dev     # Vite dev server (localhost:5173)
npm run build   # Production bundle
```

**Demo Workflow:**
1. Enter role (e.g., "Product Manager")
2. Answer 10 clarifying questions (text inputs)
3. Review auto-generated capabilities
4. Select autonomy target (L1-L5)
5. View heatmap with emoji grid
6. Download Markdown report

---

### 2. CLI Tool (Node.js/Commander)
**Location:** `src/cli`

**Features:**
- Interactive command-line interface with chalk colors
- Session persistence in `~/.autonomy-mapper/sessions/`
- ASCII table heatmap rendering
- Commands: `analyze`, `heatmap`, `export`, `list`
- Supports piping/scripting for automation

**Build & Run:**
```bash
cd src/cli
npm install
npm run build    # TypeScript → dist/
npm link         # Make `autonomy` command global
autonomy analyze        # Start interactive workflow
autonomy list           # List all sessions
autonomy export <id> --format md   # Export session
```

**Example Session:**
```
$ autonomy analyze
📋 Phase 1: Define Role
? Job title or role name: Senior Software Engineer
? Organization context (optional): FinTech, NYC

❓ Phase 2: Answer Clarifying Questions
? Main responsibilities: Backend development, system design, mentoring
[... 9 more questions ...]

✏️  Phase 4: Capability Review
[12 auto-generated capabilities shown; user confirms]

📊 Phase 6: Autonomy Mapping
[Heatmap displayed in ASCII table format]

✨ Analysis complete! Session ID: 7cc895be...
```

---

### 3. REST API (Express.js)
**Location:** `src/api`

**Features:**
- RESTful endpoints for session CRUD and analysis
- Zod request validation
- OpenAPI 3.0 documentation
- JSON response format (no HTML/templates)
- Suitable for mobile apps, integrations, or microservices

**Build & Run:**
```bash
cd src/api
npm install
npm run build    # TypeScript → dist/
npm start        # Server on port 3000
npm run dev      # ts-node-dev with auto-reload
```

**Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/api/sessions` | Create session |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/:id` | Get session details |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/sessions/:id/analyze` | Run full analysis |
| POST | `/api/sessions/:id/export?format=md\|json\|csv` | Export session |

**Example Request (POST /api/sessions):**
```json
{
  "role": "Data Scientist",
  "context": "Healthcare, 500+ employees"
}
→ Response:
{
  "data": {
    "id": "uuid-here",
    "role": "Data Scientist",
    "context": "Healthcare, 500+ employees",
    "answers": {},
    "capabilities": [],
    "autonomyMap": [],
    "autonomyTarget": "L3",
    "createdAt": "2026-06-04T...",
    "updatedAt": "2026-06-04T..."
  }
}
```

---

### 4. Teams Declarative Agent
**Location:** `src/m365-copilot-agent`

**Features:**
- Native Teams app deployed via manifest
- Conversational interface (natural language input)
- Iterative question answering within Teams chat
- Sessions stored in Teams Bot SDK state
- Desktop + mobile support

**Build & Deploy:**
```bash
cd src/m365-copilot-agent
npm install
npm run build
# Generate Teams package
npm run dev  # Local testing in Teams App Studio
```

**User Experience:**
```
User → "Analyze my role as Product Manager"
Agent → "I'll help you map your AI autonomy level. First, tell me your role..."
User → "Product Manager at a SaaS company"
Agent → "Great! Let's dive deeper. What are your main responsibilities?"
[... conversational flow through 10 questions ...]
Agent → "[Heatmap in adaptive card format] Your analysis shows L3 autonomy potential..."
User → "Export this to Markdown"
Agent → "[Sends Markdown file in Teams chat]"
```

---

### 5. Claude Plugin (MCP Server)
**Location:** `src/claude-plugin`

**Features:**
- 5 custom tools accessible within Claude.ai conversations
- Session management, analysis, export, and scoring
- Stateless (no persistent storage; Claude context is the session)
- Tools: `analyze_role`, `export_session`, `score_capability`, etc.

**Build & Run:**
```bash
cd src/claude-plugin
npm install
npm run build
npm start
# Expose via MCP client to Claude
```

**Claude Conversation Example:**
```
User → "I'm a compliance officer. Map my autonomy potential."
Claude → "I'll use the AI Autonomy Mapper tools. Let me start by analyzing your role..."
[Claude calls analyze_role tool with compliance officer context]
Claude → "Based on your role, I've identified 12 key capabilities. Let me score them..."
[Claude calls score_capability for each]
Claude → "Here's your autonomy mapping: Core responsibilities at L2 (Mostly Human), 
          Regulatory tasks at L1 (Human-centric)... Would you like a detailed report?"
```

---

## Future Features

### Phase 2: Enterprise Enhancements
- **RBAC & Multi-Tenancy** — Org-level session isolation, role-based access
- **Database Persistence** — PostgreSQL/DynamoDB backend for scalability
- **Audit Logging** — Track all changes to sessions for compliance
- **Batch Analysis API** — Analyze entire workforce (CSV upload)
- **Advanced Analytics** — Charts, trends, role clustering analysis

### Phase 3: AI Agent Automation
- **LLM-Powered Decomposition** — Use GPT-4 to auto-generate richer capabilities
- **Recommendation Engine** — Suggest autonomy target based on industry benchmarks
- **Feedback Loop** — Users rate heatmap accuracy; improve scoring algorithm
- **Conversational Analysis** — Multi-turn conversation to refine answers

### Phase 4: Integration Ecosystem
- **Slack App** — Analyze roles from Slack conversations
- **Jira Integration** — Map tasks in Jira to autonomy levels
- **SAP/Workday Integration** — Sync org structures for workforce-wide analysis
- **Tableau/Power BI Connectors** — Embed heatmaps in dashboards

### Phase 5: Advanced Scoring
- **Custom Scoring Models** — Per-industry, per-company calibration
- **Sensitivity Analysis** — "What if I increase dataRich score by 20%?"
- **Benchmarking** — Compare role autonomy against industry peers
- **Scenario Planning** — Model automation roadmaps over 1–3 years

### Phase 6: Mobile & Offline
- **Native Mobile Apps** — iOS/Android for on-the-go analysis
- **Offline Mode** — Analyze offline, sync when connected
- **Voice Input** — Speak clarifying questions (Siri/Google Assistant)

---

## Changelog

### v1.0.0 (June 2026) — Initial Release
**Features:**
- ✅ Core 6-phase analysis workflow
- ✅ Zone-based autonomy scoring (Core/Contextual/Shared)
- ✅ 10 clarifying questions framework
- ✅ Standalone React web app (Vite + Tailwind)
- ✅ CLI tool (Commander.js + Interactive prompts)
- ✅ REST API (Express.js + OpenAPI)
- ✅ Teams Declarative Agent
- ✅ Claude Plugin (MCP Server)
- ✅ Session persistence (file-based, in-memory)
- ✅ Export to Markdown, JSON, CSV
- ✅ Emoji heatmap visualization
- ✅ TypeScript strict mode across all platforms

**Tested:**
- ✅ All 5 implementations build without errors
- ✅ API endpoints verified with curl
- ✅ Web app tested in Vite dev server
- ✅ CLI global command registration
- ✅ Teams manifest validation
- ✅ Claude plugin 24/24 smoke tests

### v1.1.0 (Planned Q3 2026)
- [ ] Database support (PostgreSQL)
- [ ] Batch analysis API (CSV upload)
- [ ] Advanced analytics dashboard
- [ ] Custom scoring models per industry
- [ ] Multi-tenancy with RBAC

### v2.0.0 (Planned Q4 2026)
- [ ] Native mobile apps (iOS/Android)
- [ ] LLM-powered decomposition (GPT-4)
- [ ] Slack integration
- [ ] Jira integration
- [ ] Industry benchmarking

---

## Contributing

### Development Setup

**Prerequisites:**
- Node.js 18+
- npm 10+
- Git 2.40+
- TypeScript 5.4+

**Quick Start:**
```bash
git clone https://github.com/josegherran/ai-autonomy-agent.git
cd ai-autonomy-agent

# Choose one to develop:
cd src/standalone-app && npm install && npm run dev
cd src/cli && npm install && npm run dev
cd src/api && npm install && npm run dev
# ... etc
```

### Code Style
- **Language:** TypeScript (strict mode enabled)
- **Formatting:** Prettier (2-space indents, single quotes)
- **Linting:** ESLint (enforce no unused vars, no `any` types)
- **Comments:** JSDoc for public APIs, inline comments for complex logic

### Branching Strategy
- `main` — production-ready code
- `develop` — integration branch for features
- `feature/name` — individual feature branches
- `bugfix/name` — bug fixes

### Commit Message Format
```
type(scope): short description

- Detailed explanation of change
- Rationale for decision
- Testing performed
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Testing
- Unit tests for scoring engine (`autonomy-engine.spec.ts`)
- Integration tests for workflows (`analyze.spec.ts`)
- API tests with curl/Postman
- Manual testing in each platform

```bash
npm test              # Run Jest tests
npm run test:watch   # Watch mode
npm run coverage     # Coverage report
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with clear commit messages
3. Test locally (build, test, manual verification)
4. Push to GitHub and create PR
5. Code review by 2+ maintainers
6. Merge when all checks pass

### Reporting Issues
- **Bug Report:** Include steps to reproduce, expected vs actual behavior, platform
- **Feature Request:** Describe use case, business value, proposed API
- **Documentation:** Typos, unclear explanations, missing examples

---

## License

**MIT License**

Copyright (c) 2026 Jose Gherran

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See [LICENSE](LICENSE) file for full text.

---

## Conclusion

**AI Autonomy Mapper** is a comprehensive, multi-platform framework for assessing AI automation potential in any organization. By combining rigorous zone-based scoring with intuitive UX across web, CLI, API, and conversational interfaces, it enables data-driven AI transformation decisions.

### Key Strengths
- **Algorithmic Rigor** — Proprietary scoring with audit trail for governance
- **Multi-Platform** — Deploy via web, CLI, Teams, API, or Claude Plugin
- **Type Safety** — Full TypeScript implementation reduces bugs and aids maintainability
- **Extensibility** — Modular architecture supports custom scoring, integrations, and scaling
- **User-Centric** — Visual heatmaps, interactive workflows, and exportable reports build stakeholder buy-in

### Immediate Next Steps
1. **Gather Feedback** — Deploy v1.0 to early access customers; validate scoring assumptions
2. **Scale Session Storage** — Migrate from in-memory to PostgreSQL for enterprise deployments
3. **Add Benchmarking** — Anonymously compare orgs' role autonomy profiles
4. **Automate Decomposition** — Use LLM to generate more nuanced capabilities from role descriptions
5. **Build Ecosystem** — Integrate with Slack, Jira, SAP Workday for end-to-end workforce mapping

### Vision
By 2027, **AI Autonomy Mapper** will be the industry-standard tool for organizations to quantify, plan, and execute AI transformations—replacing guesswork with data, enabling strategic decisions, and empowering workforces to thrive alongside AI.

---

**For more information, visit:** [GitHub Repository](https://github.com/josegherran/ai-autonomy-agent)  
**Questions?** Open an issue or contact jose@autonomy-mapper.ai
