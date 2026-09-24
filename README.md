![Voice Order](docs/assets/cover.svg)

# Voice Order

<!-- repo-badges:start -->
<div align="center">

[![Stars](https://img.shields.io/github/stars/honeyamn10-source/voice-order-system?style=flat-square&logo=github&label=Stars)](https://github.com/honeyamn10-source/voice-order-system/stargazers)
[![Forks](https://img.shields.io/github/forks/honeyamn10-source/voice-order-system?style=flat-square&logo=github&label=Forks)](https://github.com/honeyamn10-source/voice-order-system/forks)
[![Issues](https://img.shields.io/github/issues/honeyamn10-source/voice-order-system?style=flat-square&logo=github&label=Issues)](https://github.com/honeyamn10-source/voice-order-system/issues)
[![Last Commit](https://img.shields.io/github/last-commit/honeyamn10-source/voice-order-system?style=flat-square&logo=github&label=Last%20Commit)](https://github.com/honeyamn10-source/voice-order-system/commits/main)
[![License](https://img.shields.io/github/license/honeyamn10-source/voice-order-system?style=flat-square&label=License)](https://github.com/honeyamn10-source/voice-order-system/blob/main/LICENSE)

[Repository](https://github.com/honeyamn10-source/voice-order-system) · [Issues](https://github.com/honeyamn10-source/voice-order-system/issues) · [Pull Requests](https://github.com/honeyamn10-source/voice-order-system/pulls) · [Actions](https://github.com/honeyamn10-source/voice-order-system/actions)

</div>
<!-- repo-badges:end -->

<!-- professional-meta:start -->
<div align="center">

[![ci](https://github.com/honeyamn10-source/voice-order-system/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/honeyamn10-source/voice-order-system/actions/workflows/ci.yml) [![codeql](https://github.com/honeyamn10-source/voice-order-system/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/honeyamn10-source/voice-order-system/actions/workflows/codeql.yml)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

[Documentation](docs) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [Live Demo](https://honeyamn10-source.github.io/voice-order-system/)

</div>
<!-- professional-meta:end -->




A browser voice interface with a serverless conversation endpoint and a small restaurant menu.

[Project website](https://honeyamn10-source.github.io/voice-order-system/) · [Build results](https://github.com/honeyamn10-source/voice-order-system/actions)

## What it does

- **Listen and review.** The browser interface handles the conversation and shows the order.
- **Validate menu items.** The server filters known items and recalculates the total.
- **Save the request.** A configured database stores the order; the API reports whether saving succeeded.

## Start from source

Node.js and a Vercel-compatible server runtime. Configure OPENROUTER_API_KEY, SUPABASE_URL and SUPABASE_ANON_KEY on the server.

```bash
git clone https://github.com/honeyamn10-source/voice-order-system.git
cd voice-order-system
npm test
# After configuring the server environment:
npx vercel dev
```

## Verify

```bash
npm test
```

## Scope

A prototype, not a connected phone line or payment system. Browser speech support varies. Serving the static HTML alone does not provide /api/converse.

## Find your way around

- [Order validation](converse.js)
- [Serverless entry point](api/converse.js)
- [Database schema](supabase_schema.sql)

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Include a minimal reproduction and runtime versions with bug reports; remove credentials from logs.

MIT — see [LICENSE](LICENSE). Third-party dependencies retain their applicable licenses.
