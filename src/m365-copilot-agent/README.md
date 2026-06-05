# AI Autonomy Mapper — Microsoft 365 Copilot Agent

Declarative Copilot agent deployed to Microsoft 365 Copilot Chat, Teams, and Word.  
Pure declarative agent — no backend service required.

## Project Structure

```
m365-copilot-agent/
├── appPackage/
│   ├── manifest.json           # Teams manifest v1.26 (schema-compliant)
│   ├── declarativeAgent.json   # Declarative agent definition v1.7
│   ├── instruction.txt         # Full agent system prompt (all 6 phases)
│   ├── color.png               # 192×192 color icon (replace placeholder)
│   └── outline.png             # 32×32 transparent outline icon (replace placeholder)
├── env/
│   ├── .env.dev                # Non-secret dev vars (committed)
│   ├── .env.dev.user           # Secret dev vars — DO NOT COMMIT
│   ├── .env.local              # Local sideload vars — DO NOT COMMIT
│   └── .env.playground         # Agents Playground vars — DO NOT COMMIT
├── m365agents.yml              # Lifecycle: provision + publish (dev/cloud)
├── m365agents.local.yml        # Lifecycle: provision (local sideload)
├── m365agents.playground.yml   # Lifecycle: provision (Agents Playground)
├── .gitignore
└── README.md
```

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Microsoft 365 tenant | With Microsoft 365 Copilot license |
| M365 Agents Toolkit CLI | `npm i -g @microsoft/m365agentstoolkit-cli@beta` (must be > 1.1.5-beta) |
| Teams Toolkit for VS Code | Extension ID: `teamsdevapp.ms-teams-vscode-extension` |
| App icons | Replace the `.placeholder.txt` files in `appPackage/` with real PNGs |

## Getting Started

### 1. Install the ATK CLI
```bash
npm i -g @microsoft/m365agentstoolkit-cli@beta
atk --version   # must be > 1.1.5-beta
```

### 2. Add icons
Replace the placeholder files in `appPackage/`:
- `color.png` — 192×192 PNG, colored background
- `outline.png` — 32×32 PNG, transparent background

### 3. Configure environment
Edit `env/.env.dev` if you need to change publisher metadata.  
Secret values stay in `env/.env.dev.user` (auto-created by ATK, never committed).

### 4. Provision (creates the Teams app registration)
```bash
cd src/m365-copilot-agent
export ATK_CLI_SKILL=true
atk provision --env dev -i false
```
ATK will open a browser for M365 login if `M365_ACCOUNT_NAME` is not set.

### 5. Publish to the org catalog
```bash
atk publish --env dev -i false
```
An M365 admin must approve the submission in the Teams Admin Center before it surfaces org-wide.

### 6. Test with Agents Playground (no M365 account needed)
```bash
atk provision --env playground -i false
# Then open Microsoft 365 Copilot Chat and test via sideloading
```

## Key Files Explained

| File | Purpose |
|------|---------|
| `appPackage/manifest.json` | Teams app identity, icons, and `copilotAgents` capability declaration |
| `appPackage/declarativeAgent.json` | Agent name, description, instruction file reference, conversation starters |
| `appPackage/instruction.txt` | Full 6-phase agent system prompt — edit this to customize behavior |
| `m365agents.yml` | ATK lifecycle: `teamsApp/create` → `zipAppPackage` → `extendToM365` → `publishAppPackage` |

## Agent Phases

| Phase | Description |
|-------|-------------|
| 1 — Role Selection | Confirm role and scope |
| 2 — Clarifying Questions | Gather context in 4 groups (Capability, AI Suitability, Risk, Autonomy Target) |
| 3 — Capability Decomposition | Build Core / Contextual / Shared capability map; validate with user |
| 4 — Autonomy Level Mapping | Assign AI Exposure Scores (🟦🟩🟨🟧🟥) per capability × L1–L5 |
| 5 — Heatmap Generation | Produce AI Exposure Heatmap table with insights |
| 6 — Results & Recommendations | Executive summary, key insights, redesign recommendations, exportable artifacts |

## Customization

- **Instructions:** Edit `appPackage/instruction.txt` to adapt phrasing, add organization-specific context, or extend phases.
- **Conversation starters:** Edit the `conversation_starters` array in `appPackage/declarativeAgent.json`.
- **Actions (future):** Add Graph API or Power Automate actions to `appPackage/` and reference them in `declarativeAgent.json` under `"actions"` to enable data-grounded responses from SharePoint, Outlook, or Teams.
