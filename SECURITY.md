# Security Policy

## Supported versions

This project is a prototype under active development. Security fixes are applied to the latest commit on `main`; there are no long-term supported release branches.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Email the maintainer privately with the subject `[voice-order-system] Security` and include:

- Description of the vulnerability and potential impact
- Affected component or endpoint
- Reproduction steps (with test/fictional data only — never real customer data)
- Suggested fix, if known

You will receive an acknowledgement within 5 business days and a remediation plan or a written reason why the finding is not a vulnerability.

## Security notes

- Backend API keys must only live in Vercel/backend environment variables — never in client-side code.
- Enable Row Level Security on Supabase production tables.
- The browser speech-recognition flow is not a verified telephone integration and must not be used for regulated communications.