# Scheme Setu - Architecture & Flow Specification

This document provides a comprehensive overview of the **Scheme Setu** system architecture, data models, authentication mechanisms, dynamic scheme directory flow, rule-based eligibility evaluation engine, and AI integration pipelines.

---

## 1. System Overview & Technical Stack

Scheme Setu is a Unified Citizen Scheme Discovery & Rule Engine Platform developed for Smart India Hackathon (SIH 2026). It bridges the gap between citizens and government welfare schemes through deterministic eligibility evaluation and AI-assisted profile extraction.

```
       +-------------------------------------------------------------------+
       |                       Next.js Client (App Router)                |
       |  - Dynamic Localized Pages (/schemes, /schemes/[slug], /profile)  |
       |  - Axios API Client (`lib/api/client.ts`) with Cookie Auth Interceptor |
       +-------------------------------------------------------------------+
                                         |
                                HTTP / REST API (JSON)
                                         v
       +-------------------------------------------------------------------+
       |                       Express.js Server (Backend)                 |
       |  - Helmet, CORS, Cookie-Parser, Rate Limiting (Upstash Redis)     |
       |  - Controllers: Auth, Schemes, Eligibility, AI Profile            |
       +-------------------------------------------------------------------+
           /                             |                            \
          v                              v                             v
+------------------+         +----------------------+        +-------------------+
|  MongoDB Atlas   |         | Google Gemini 3.5    |        | Cloudinary Storage|
| (Schemes, Users, |         |  (AI Fact Extraction |        | (Document Uploads |
| RuleSets, Audits)|         |   & Profile Filing)  |        |  & Verification)  |
+------------------+         +----------------------+        +-------------------+
```

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios, Cookie management (`js-cookie`).
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JWT (`accessToken`, `refreshToken` in HttpOnly cookies), Nodemailer, Multer + Cloudinary.
- **AI Service**: Google Gemini AI (`gemini-3.5-flash`) for automated citizen facts extraction.
- **Rule Engine**: Custom AST-based deterministic evaluator (`ruleEngine.js`, `conditionEvaluator.js`).

---

## 2. Architecture & Data Flow

### A. Scheme Discovery & Directory Flow (`/api/schemes`)

1. **Frontend Request**: Next.js client renders `/schemes` page and calls `schemesApi.getSchemes(params)` via Axios (`client/lib/api/schemes.ts`).
2. **Backend Controller**: `getAllSchemes` in `server/src/controllers/schemeController.js` queries active MongoDB `Scheme` models sorted by creation date.
3. **Database Population**: Database is dynamically seeded via `node src/scripts/seedSchemes.js`, populating 130+ national and state schemes from `server/src/data/myscheme.json` along with default AST `RuleSet` definitions.
4. **Response Contract**: Returns `{ success: true, count: N, schemes: [...] }`. The UI dynamically displays cards and details without any client-side hardcoded fallbacks.

```
Client Page (/schemes) ───> GET /api/schemes ───> schemeController.js ───> MongoDB (Scheme.find) ───> UI Render
```

---

### B. Authentication & JWT Cookie Pipeline

1. **User Sign In / Sign Up**: `/api/auth/login`, `/api/auth/register`, or Google OAuth.
2. **Token Generation**:
   - `accessToken`: Short-lived JWT (15 min) sent in HTTP-only cookie.
   - `refreshToken`: Long-lived JWT (7 days) sent in HTTP-only cookie (`SameSite=None`, `Secure`).
3. **Automatic Token Refresh Interceptor**: `client/lib/api/client.ts` catches `401 Unauthorized` errors and automatically triggers `POST /api/auth/refresh` to fetch a fresh `accessToken` transparently without breaking user interaction.

---

### C. Rule Engine & Eligibility Evaluation Flow

1. **Rule Set Architecture**: Each `Scheme` references a `currentRuleSetId` which points to a versioned `RuleSet` containing a `rootRule` Abstract Syntax Tree (AST).
2. **AST Rule Node Structure**:
   - **Condition Node**: Evaluates a specific field (e.g., `age`, `hasBPLCard`, `annualIncome`) against an operator (`gte`, `lte`, `equals`, `in`, `contains`).
   - **Group Node**: Combines child nodes with logical operators (`AND`, `OR`, `NOT`).
3. **Evaluation Pipeline**:
   - Citizen provides facts via `/api/eligibility/check/:schemeSlug` or profile.
   - `eligibilityService.js` loads the scheme's active `RuleSet`.
   - `ruleEngine.js` recursively evaluates the AST against citizen facts.
   - Returns deterministic evaluation: `status` (`passed`, `failed`, `unknown`), `eligibilityDegree` (`fully_eligible`, `partially_eligible`, `needs_more_info`, `ineligible`), `matchPercentage`, and `missingInformation` fields.

```
Citizen Facts ───> POST /api/eligibility/check/:slug ───> eligibilityService ───> ruleEngine.js (AST) ───> Audit Record (EligibilityCheck)
```

---

### D. AI Profile Extraction Flow

1. **User Input**: Citizen inputs free-text or uploads document metadata.
2. **Gemini Integration**: `server/src/services/ai/profileExtractionService.js` sends prompt to `gemini-3.5-flash`.
3. **Fact Structuring**: Gemini extracts normalized citizen facts (e.g., `age`, `gender`, `annualIncome`, `state`, `occupation`) matching the standard profile JSON schema.
4. **Automatic Profile Update**: Extracted facts update the user's `SovereignProfile` in MongoDB for one-click scheme eligibility matching across all directory schemes.

---

## 3. Core Models & Files Directory Map

| Path / File | Purpose & Responsibilities |
| :--- | :--- |
| `server/src/models/Scheme.js` | MongoDB Schema for Government Welfare Schemes (`name`, `slug`, `description`, `ministry`, `state`, `category`, `currentRuleSetId`, `status`) |
| `server/src/models/RuleSet.js` | Versioned AST rule structures linked to schemes |
| `server/src/models/User.js` | User account schema with authentication & profile attributes |
| `server/src/services/eligibility/ruleEngine.js` | Deterministic recursive evaluator for AST rule trees (`AND`, `OR`, `NOT`) |
| `server/src/services/eligibility/conditionEvaluator.js` | Field-level operator evaluation (`gte`, `lte`, `equals`, `contains`, `in`) |
| `server/src/services/eligibility/eligibilityService.js` | High-level orchestrator for scheme eligibility checks & audit logging |
| `server/src/scripts/seedSchemes.js` | Automated DB seed script mapping `myscheme.json` to Mongoose models with generated RuleSets |
| `client/app/[locale]/schemes/page.tsx` | Dynamic scheme directory page consuming `/api/schemes` |
| `client/app/[locale]/schemes/[slug]/page.tsx` | Detailed scheme view page consuming `/api/schemes/:slug` |
| `client/lib/api/schemes.ts` | Frontend API client service for fetching scheme data |
| `client/lib/api/client.ts` | Base Axios client configured with `withCredentials: true` and 401 refresh token interceptor |

---

## 4. Key Agent Guidelines

1. **Dynamic Data Primacy**: Never introduce static or hardcoded fallback arrays for scheme data (`FALLBACK_SCHEMES`). All scheme data must strictly be fetched from `/api/schemes`.
2. **AST Rule Consistency**: When modifying eligibility rules or adding schemes, ensure the `rootRule` matches the AST format supported by `ruleEngine.js`.
3. **Testing Protocol**: Always execute `npm test` inside `server/` before presenting code changes. All unit & integration tests must pass cleanly.
4. **Environment Variables**: Always ensure `MONGODB_URI` points explicitly to the target database (e.g., `/scheme-setu`) in `server/.env`.
