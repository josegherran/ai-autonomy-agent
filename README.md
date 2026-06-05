# 🤖 AI Autonomy Mapper Agent

> **Map your workforce's AI future.** Decompose roles, design autonomy levels, and generate heatmaps for strategic workforce redesign.

---

## 🎯 What This Does

AI Autonomy Mapper is a **multi-platform agent** that guides teams through the **AI Capability Decomposition Framework** in **6 interactive phases**:

```
Role Selection → Clarifying Questions → Decomposition → Level Mapping → Heatmap → Results
```

**Outcome:** Organizations gain clarity on:
- ✅ Which tasks automate first (quick wins)
- ✅ Which capabilities expand under AI (upskilling needs)
- ✅ Where humans stay essential (irreplaceable judgment)
- ✅ Recommended autonomy levels (L1–L5) for each capability

---

## 🌐 Available Platforms

| Platform | Best For | Key Feature |
|----------|----------|-------------|
| **Web App** (React/Vite) | Interactive workflows | 6-phase wizard UI |
| **API** (Express.js) | System integration | RESTful endpoints + OpenAPI |
| **CLI** (Commander.js) | Command-line users | Terminal-friendly analysis |
| **Teams Agent** | Microsoft ecosystem | Native Teams integration |
| **Claude Plugin** | Claude users | Natural language prompts |


---

## 📋 Scope & Boundaries

| ✅ In Scope | ❌ Out of Scope |
|-----------|----------------|
| Role decomposition | Legal/compliance advice |
| Autonomy mapping (L1–L5) | Vendor selection |
| Heatmap generation | Technical AI implementation |
| Workshop facilitation | Third-party integrations |

**Supports:** 🌍 Any language (responds in user's language)

---

## 🚀 The 6-Phase Workflow

### Phase 1️⃣ — Role Selection
**What happens:** User provides a job role; agent confirms scope and intent.

| Step | Agent Action | User Input |
|------|--------------|-----------|
| 1️⃣ | Greet & confirm role | "Data Scientist" |
| 2️⃣ | Ask clarifying questions | Answers trigger phase 2 |
| 3️⃣ | Confirm scope | Single role / multiple / specific duties |

**Example:**
> **User:** "Analyze a Data Scientist role"  
> **Agent:** "Great! Before we start, I have a few questions to tailor this to your context."

---

### Phase 2️⃣ — Clarifying Questions
**What happens:** Agent asks 10 targeted questions across 4 dimensions to understand context.

> 💡 **Key:** Asked **one group at a time** to avoid overwhelming the user.

#### 🔹 **Dimension 1: Capability Definition**
1. What are the non-negotiable, day-to-day tasks for this role?
2. Which tasks vary based on strategy, seniority, team structure, or business context?
3. Which tasks require cross-functional interaction or stakeholder communication?

#### 🔹 **Dimension 2: AI Suitability**
4. Which tasks are highly repetitive or rule-based?
5. Which tasks depend heavily on domain expertise or judgment?
6. Where is data availability high or low in this role?

#### 🔹 **Dimension 3: Risk & Governance**
7. Which tasks require direct human accountability?
8. Are there ethical, regulatory, or compliance constraints to consider?

#### 🔹 **Dimension 4: Autonomy Target**
9. What level of AI autonomy is acceptable for your organization? *(L1–L5)*
10. Where should humans stay **in-the-loop** (approve actions) vs. **on-the-loop** (monitor outcomes)?

---

### Phase 3️⃣ — Capability Decomposition
**What happens:** Agent structures the role into capabilities and zones. User validates before proceeding.

**Three capability zones:**

| Zone | Definition | Example |
|------|-----------|---------|
| **Core** | Essential, baseline tasks every job holder does | Problem framing, data prep |
| **Contextual** | Tasks that vary by experience or context | Experiment design (seniority-dependent) |
| **Shared** | Cross-functional, integrative responsibilities | Stakeholder communication |

**Sample output:**

| Capability Zone | Capability | Notes |
|---|---|---|
| Core | Problem framing | High human judgment required |
| Core | Data preparation | Highly automatable |
| Contextual | Experiment design | Varies by seniority |
| Shared | Stakeholder communication | Human-centric |

> ✅ **Validation gate:** User confirms, edits, or rejects before moving forward.

---

### Phase 4️⃣ — Autonomy Level Mapping
**What happens:** Agent maps how each capability evolves across autonomy levels L1→L5.

**Autonomy Levels:**

| Level | Name | Definition | Human Role |
|-------|------|-----------|-----------|
| **L1** | Static Assistant | AI provides guidance | Apply & validate |
| **L2** | Embedded Helper | AI automates routine tasks | Select & refine |
| **L3** | Task Automation | AI executes well-defined tasks | Oversee |
| **L4** | Operational Collaborator | AI runs workflows, generates insights | Focus on decisions |
| **L5** | Multi-Agent Environment | AI coordinates adaptively | Provide governance |

**AI Exposure Score colors:**

| Color | Meaning |
|-------|---------|
| 🟦 Blue | Fully human-centric |
| 🟩 Green | Mostly human; minor AI support |
| 🟨 Yellow | Shared responsibility |
| 🟧 Orange | AI does most work; human oversight needed |
| 🟥 Red | Highly automatable |

**Sample insight:** 
> "*Data preparation* automates first (L1→L3 in months 1–3), while *problem framing* stays human-centric even at L5."

---

### Phase 5️⃣ — Heatmap Generation
**What happens:** Agent creates **AI Exposure Heatmap** matrix showing capability automation potential.

**Output: Capabilities (rows) × Autonomy Levels (columns)**

| Capability | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| Data preparation | 🟩 | 🟨 | 🟧 | 🟥 | 🟥 |
| Problem framing | 🟦 | 🟦 | 🟩 | 🟨 | 🟨 |
| Stakeholder comms | 🟦 | 🟦 | 🟦 | 🟩 | 🟩 |

**Key insights generated:**
- 🚀 **Top 3 quick wins** — Capabilities that automate fastest
- 📚 **Upskilling priorities** — Capabilities that expand (higher-value work)
- 🧠 **Human essentials** — Irreplaceable judgment tasks

---

### Phase 6️⃣ — Results & Recommendations
**What happens:** Agent delivers structured summary for strategic decision-making.

#### 📊 Executive Summary
- Role analyzed & total capabilities mapped
- Recommended autonomy level (with clear rationale)
- Timeline to achieve target autonomy

#### 🔑 Strategic Insights
- **Quick wins:** Which capabilities automate first (invest here first)
- **Expansion areas:** Which capabilities expand (upskilling/training)
- **Human essentials:** Where judgment is irreplaceable (no automation)

#### 🗺️ Implementation Roadmap
- Workflow changes per autonomy level
- Agent design opportunities (which tasks to automate)
- Human-AI interaction model (in-the-loop vs. on-the-loop)

#### 📁 Deliverables
- ✅ Capability decomposition table (editable)
- ✅ AI Exposure Heatmap (printable)
- ✅ Workshop facilitation guide (Q&A summary)
- ✅ Executive brief (1-page summary)

---

## 🧠 Agent Behaviors & Rules

The agent follows these **non-negotiable principles** to ensure quality analysis:

| Rule | Why It Matters | Impact |
|------|----------------|--------|
| ✅ **Always validate** capability decomposition with user | Prevents garbage-in-garbage-out | Analysis accuracy |
| 🚫 **Never assume** autonomy target | Avoids imposing wrong level | Alignment with org strategy |
| 🌍 **Adapt language** to audience (technical vs. business) | Ensures understanding | User satisfaction |
| 🚨 **Flag high-risk** capabilities (ethical, regulatory) | Prevents compliance violations | Risk mitigation |
| 🔄 **Offer to iterate** — users can refine and regenerate | Enables refinement | Better outcomes |
| 📝 **Be concise** in summaries; offer detail on request | Respects user time | Higher adoption |

---

## ⚠️ Error Handling

**How the agent responds to common challenges:**

| Challenge | Agent Response |
|-----------|---|
| **Ambiguous role** | "Can you share a job description or list of key responsibilities?" |
| **User skips questions** | "I'll proceed with reasonable defaults, but note these assumptions..." |
| **Too many capabilities** | "Let's group these into max 10–12. Which ones are most critical?" |
| **L5 request for risky role** | "⚠️ For regulatory/safety roles, I recommend a phased approach (L3 → L4 over time)." |
| **Unable to answer question** | "No problem! Let's flag this and move forward; we can revisit later." |

---

## 💬 Sample Conversation Starters

Copy & paste to start an analysis:

**For role analysis:**
- *"Map the AI autonomy for a Marketing Manager role."*
- *"Analyze how AI impacts a Data Engineer."*
- *"Which tasks in my Sales Director role are at risk of automation?"*

**For workflow redesign:**
- *"I want to redesign my team's workflow with AI — where do I start?"*
- *"Generate an AI exposure heatmap for our Data Engineering team."*

**For strategic planning:**
- *"Which capabilities in Finance roles should we automate first?"*
- *"What autonomy level should we target for Software Engineers?"*

---

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [**SPEC.md**](./SPEC.md) | Complete requirements & tech stack | Product managers, engineers |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Design patterns, diagrams, ADRs | Architects, senior engineers |
| [**IMPROVEMENT_PLAN.md**](./IMPROVEMENT_PLAN.md) | 12-month roadmap & ROI analysis | Executives, leadership |

---

## 🛠️ Implementation Details

### **Technical Stack**
- **Languages:** TypeScript 5.4+ (strict mode)
- **Web:** React 18.3 + Vite 5.3 + Tailwind CSS
- **API:** Express.js 4.19 + Zod validation
- **CLI:** Commander.js 12.1 + @inquirer/prompts
- **Data:** File-based (v1) → PostgreSQL (Wave 1)
- **Styling:** Zustand (state) + Tailwind (UI)

### **Deployment**
- **Web:** Vite production build → CDN
- **API:** Node.js runtime → AWS Lambda / Container
- **CLI:** Global npm package → `autonomy --help`
- **Teams:** Declarative Agent → Teams SDK
- **Claude:** MCP Server → Anthropic API

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes with clear messages
4. Submit a pull request with description

---

## 📞 Support

**For questions or feedback:**
- Open an issue on GitHub
- Check [SPEC.md](./SPEC.md) for technical details
- Review [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) for roadmap

---

**Last Updated:** June 4, 2026 | **Version:** 1.0.0-stable