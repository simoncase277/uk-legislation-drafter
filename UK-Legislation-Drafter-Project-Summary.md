# UK Legislation Drafter — Project Summary

**Version:** 2.1  
**Last Updated:** 8 March 2026  
**Status:** Live and deployed

---

## What This App Does

The UK Legislation Drafter is an AI-powered web application that helps non-legal experts produce draft primary and secondary legislation for the UK Parliament. Users can describe what they want a law to do in plain English, and the app generates properly structured legislative text — complete with Long Titles, Enacting Formulae, numbered sections, explanatory notes, and references to existing UK legislation on legislation.gov.uk.

The app is designed to be accessible to anyone, regardless of legal or technical background.

---

## Key Features

### Four Ways to Start a Draft

| Entry Point | How It Works | Best For |
|---|---|---|
| **Guided Wizard** | User answers structured questions (set varies by legislation type) | People who don't know where to start |
| **Plain English** | User describes the law in everyday language | People with a clear idea but no legal vocabulary |
| **Template Library** | User picks from 6 pre-built templates | People who want a familiar starting point |
| **Upload a Draft** | User uploads an existing .docx file | People with an existing draft to continue working on |

### Templates Available
- Environmental Protection
- Housing & Planning
- Public Health
- Digital & Technology
- Statutory Instrument (Amendment)
- Custom (blank)

### Legislation Type Toggle
A three-state segmented button appears on all entry-point screens and the Draft Output screen:
- **Primary (Act of Parliament)**
- **Secondary (Statutory Instrument)**
- **I'm not sure — help me decide** → opens the Legislation Type Adviser

The toggle is two-state (Primary / Secondary only) on the Draft Output and Clause Editor tabs, since the type must be resolved before generation.

### Legislation Type Adviser
For users who don't know whether they need an Act or a Statutory Instrument, a guided modal:
- Provides a plain-English explainer of the difference between primary and secondary legislation
- Asks three diagnostic questions
- Produces a recommendation with explanation
- Allows the user to accept the recommendation or override it

### Clause-by-Clause Editor
After a draft is generated, users can switch to the Clause Editor to:
- Edit individual clause titles and body text
- Reorder clauses up and down
- Add new clauses
- Delete unwanted clauses
- Use AI to redraft any individual clause in plain English (with undo)
- Revise the overall brief and regenerate the full draft
- Save individual clauses to the project library
- Apply all edits back to the main draft

### Export Options
- **Word (.doc)** — formatted document that opens in Word or Pages
- **PDF** — opens a print-ready view and triggers the print/save dialog
- **Copy to Clipboard** — plain text copy of the full draft

### Projects
Work is organised into named projects. Each project contains:
- A title and legislation type
- The current draft and clause list
- A saved library of drafts and clauses
- A free-text notes field
- Created and last-updated timestamps

The Projects screen (the default landing screen) shows all projects in a grid with Open, Rename, Duplicate, and Delete actions. First-time users see an onboarding screen explaining the app before being prompted to create their first project.

### Saved Library (per project)
- Save full drafts or individual clauses with custom titles
- Persistent storage in the browser (localStorage), scoped to each project
- Search across saved items
- Load any saved item back into the editor
- Export saved items directly to Word or PDF

### Upload a Draft
- Upload an existing .docx file (up to 5 MB)
- Text is extracted in the browser using mammoth.js (no file is stored on the server)
- Claude parses the extracted text into a structured clause list and identifies the legislation type
- The parsed draft loads directly into the Clause Editor
- Note: PDF upload support is planned for a future version

### Plain-English Recast (Revise Brief)
Available from the Draft Output tab and the Clause Editor toolbar:
- User describes changes to what they want the legislation to do in plain English
- Claude regenerates the full draft incorporating the changes
- The previous draft is preserved and can be restored

### AI Clause Redraft
Available on every clause in the Clause Editor via the "AI ✦" button:
- User describes what they want the clause to do in plain English
- Claude redrafts that clause only, returning the body text in correct UK legislative style
- The original body text is preserved with an inline "Undo AI redraft" link

### Overseas Legislation Reference
A dedicated tab allows users to:
- Name a piece of legislation from any overseas jurisdiction (EU, US, Australia, New Zealand, Canada, international treaties, etc.)
- Receive a three-section analysis: Overview, Relevant Provisions, and UK Translation
- Append the suggested clauses to their current draft, or copy to clipboard
- A caveat reminds users to verify against the official source

### AI Drafting Quality
The AI is prompted to follow:
- UK legislative conventions (Erskine May, OPC style guide)
- Correct structure for Acts of Parliament and Statutory Instruments
- For Acts: Long Title, Enacting Formula, numbered sections with subsections
- For SIs: enabling power recital (with user-supplied or placeholder Act reference), numbered articles, Explanatory Note
- Plain-English Explanatory Notes after each major clause
- References and hyperlinks to existing legislation on legislation.gov.uk
- A legal disclaimer on every draft

---

## Technical Architecture

### How It Works

```
User's Browser  →  Proxy Server (Render)  →  Anthropic Claude API
      ↑                     |                          |
      └─────────────────────┘                          |
              Draft text returned  ←───────────────────┘
```

The app has two parts:

**1. Frontend (`public/index.html`)**
- Single HTML file containing the full React application
- Built with React 18 (loaded from CDN — no build step required)
- mammoth.js loaded from CDN for .docx text extraction
- Styled with custom CSS (dark parchment theme, Playfair Display / Crimson Pro fonts)
- State managed with React `useReducer` — single top-level state object
- Calls `/api/generate` on the proxy server — never touches the Anthropic API directly

**2. Proxy Server (`server.js`)**
- Small Node.js / Express server (unchanged from v2.0)
- Receives requests from the frontend
- Adds the secret Anthropic API key (stored as an environment variable)
- Forwards the request to Anthropic and passes the response back
- Also serves the frontend HTML as a static file
- Includes a `/health` endpoint for Render's uptime monitoring

### Why a Proxy?
Without the proxy, every user would need their own Anthropic API key. The proxy means the app owner's key is used for all requests, stored securely on the server and never exposed to users or visible in the browser.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend framework | React 18 |
| Frontend styling | Custom CSS (no framework) |
| Fonts | Playfair Display, Crimson Pro (Google Fonts) |
| Document parsing | mammoth.js (CDN) |
| Backend server | Node.js + Express |
| AI model | Claude Sonnet (claude-sonnet-4-20250514) |
| Hosting | Render (free tier) |
| Code repository | GitHub |
| Data storage | Browser localStorage (for projects and saved library) |

---

## Deployment Details

### Repository Structure
```
uk-legislation-drafter/
├── server.js          ← Proxy server (unchanged from v2.0)
├── package.json       ← Node.js dependencies
├── render.yaml        ← Render deployment config
├── README.txt         ← Deployment instructions
└── public/
    └── index.html     ← The full frontend app
```

### Live URL
Hosted on Render at: `https://uk-legislation-drafter.onrender.com`
*(Replace with your actual Render URL)*

### Environment Variables (set in Render dashboard)
| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (sk-ant-...) |

### Updating the App
1. Edit the relevant file(s) on GitHub
2. Render automatically detects the change and redeploys within ~2 minutes
3. No other action needed

### Cost Considerations
- **Render hosting:** Free tier available (app may sleep after 15 mins inactivity — first load can take ~30 seconds to wake). Paid tier from $7/month keeps it always on.
- **Anthropic API:** Approximately £0.01–£0.03 per draft generated. Monitor usage at console.anthropic.com/settings/usage.

---

## Design Decisions

**Why a single HTML file for the frontend?**
Simplicity. No build process, no Node modules on the frontend, no deployment complexity. The entire app can be opened locally as a file or served from any static host.

**Why React loaded from CDN?**
Avoids the need for npm, webpack, or any local build tooling. The app works by just opening the HTML file in a browser.

**Why useReducer for state management?**
v2.1 introduced enough interconnected state (projects, legislation type, multiple AI panels, import flow) that individual useState calls became difficult to manage. A single useReducer with a top-level state object makes state transitions explicit and auditable, and makes it easier to add features in future versions.

**Why localStorage for projects?**
Simple, zero-infrastructure persistent storage. The trade-off is that projects are per-browser — a user switching devices won't see their projects. A proper database (e.g. Supabase) is planned for v3.0 to provide cross-device sync and team collaboration.

**Why .docx only for upload (not PDF)?**
mammoth.js provides reliable, clean text extraction from .docx files in the browser with no server involvement. PDF extraction in the browser is significantly more complex and less reliable (especially for scanned or image-based PDFs). PDF upload support is deferred to a future version.

**Why Render for hosting?**
Free tier, simple GitHub integration, automatic redeployment on code changes, and a generous free allowance suitable for a testing/pilot deployment.

---

## Known Limitations

- **Projects are browser-specific** — projects saved on one device/browser won't appear on another
- **Render free tier sleeps** — first load after 15+ minutes inactivity takes ~30 seconds
- **No user accounts** — anyone with the URL can use the app
- **Upload supports .docx only** — PDF upload is not yet supported
- **AI drafts require review** — outputs are starting points, not finished legislation

---

## Potential Future Enhancements

- [ ] **v3.0: User accounts and login** — so projects sync across devices
- [ ] **v3.0: Collaboration features** — share a draft with a colleague for comments (see v2.1 spec Feature 5 for full technical assessment)
- [ ] **v3.0: Version history** — track changes between drafts
- [ ] PDF upload support in the Upload tab
- [ ] Export to properly formatted .docx (currently exports as .doc HTML wrapper)
- [ ] Rate limiting / access control (restrict who can use the app)
- [ ] Usage dashboard (see how many drafts have been generated)
- [ ] Additional templates (Criminal Justice, Taxation, Education, etc.)
- [ ] Consultation response tool (help users respond to government consultations)

---

## Build History

| Version | Date | Changes |
|---|---|---|
| 1.0 | March 2026 | Initial build — three entry points, basic draft output |
| 2.0 | March 2026 | Added clause editor, saved library, Word/PDF export, proxy server for shared deployment |
| 2.1 | 8 March 2026 | Projects folder, legislation type toggle, Not Sure adviser, enabling powers question, .docx upload, AI clause redraft, Revise Brief panel, Overseas Legislation tab, Notes tab, useReducer state management, SI example name fix |

---

## v2.1 Development Session Notes (8 March 2026)

### Session overview
This session implemented all features from the v2.1 feature specification, with the following scope decisions agreed before development:

### Scope decisions made
- **Feature 3 (Upload):** .docx only for v2.1. PDF support deferred to a future version and noted in the UI.
- **Feature 4 (Projects onboarding):** First-time users see a welcome/onboarding screen explaining the app, then are prompted to create a project. Returning users land directly on the projects grid.
- **Feature 1 (toggle states):** The "Not Sure" state only appears on entry-point screens (Home, Wizard, Plain English, Templates). The Draft Output and Clause Editor tabs show only Primary/Secondary, since the legislation type must be resolved before a draft can be generated.
- **Feature 5 (multi-user collaboration):** Confirmed deferred to v3.0 as specified. No changes made.

### Features implemented (in order per spec recommendation)
1. **Feature 7** — Fixed SI example name (was: Clean Air Act; now: The Air Quality (Domestic Solid Fuels Standards) (England) Regulations 2020)
2. **Feature 6** — "Not Sure" legislation type adviser (three diagnostic questions, recommendation logic, plain-English explainer)
3. **Feature 1** — Three-state legislation type toggle on entry screens; two-state on Draft/Clause Editor; switching on an existing draft triggers regeneration confirmation with previous draft restore option
4. **Feature 8** — Enabling powers question added to Secondary legislation wizard path; conditional follow-up text input; help tooltip; woven into SI AI prompt with placeholder if unknown
5. **Feature 4** — Projects folder as new default landing screen; onboarding for new users; per-project state (draft, clauses, library, notes, legislation type); auto-save to localStorage; Rename, Duplicate, Delete actions
6. **Feature 3** — Upload tab with drag-and-drop zone; mammoth.js for .docx extraction; Claude parses to structured JSON clause list; loads into Clause Editor with legislation type auto-set
7. **Feature 2** — "Revise Brief" panel on Draft Output and Clause Editor tabs; "AI ✦" per-clause redraft button with inline panel and undo link
8. **Feature 9** — Overseas Legislation tab; three-section analysis (Overview, Relevant Provisions, UK Translation); append to draft or copy to clipboard; jurisdiction hint text; AI knowledge caveat
9. **State refactor** — Entire app migrated from multiple useState calls to a single useReducer; 65 action types; all project mutations auto-save to localStorage

### Deployment
- Only `public/index.html` changed — `server.js` untouched
- Deployed by uploading new `index.html` to GitHub via the web interface
- Render redeployed automatically
- Tested locally before deployment; smoke-tested on live URL after

---

*This document should be updated each time a new version is deployed.*
