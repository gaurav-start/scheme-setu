# Agent Rules & Behavioral Guidelines

## Git & Version Control Policy

1. **DO NOT COMMIT OR PUSH WITHOUT EXPLICIT PERMISSION**:
   - AI Coding Assistants and Automated Subagents MUST NOT run `git commit` or `git push` on any project in this workspace without asking the user for permission first.
   - Always present proposed changes to the user and wait for explicit confirmation before committing code to git.

2. **Code Integrity**:
   - Always run linter checks (`npm run lint`) and tests before presenting finished work to the user.
   - Respect light mode and dark mode accessibility contrast standards across all UI components.

3. **Testing Protocol**:
   - Run tests using the command `npm test`
   - Ensure all tests pass before submitting changes
   - If tests fail, automatically debug and fix the issues until all tests pass

## 📘 System Architecture & Flow Reference

- Refer to [`FLOW.md`](./FLOW.md) for the complete end-to-end architecture specification, including:
  - Dynamic API scheme discovery pipeline (`/api/schemes`)
  - AST Deterministic Rule Engine & Eligibility Evaluation
  - JWT Cookie-based authentication flow & auto-refresh interceptors
  - AI Citizen Profile Extraction (Google Gemini integration)
  - Core database schema and file directory mappings
