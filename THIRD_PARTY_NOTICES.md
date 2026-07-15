# Third-Party Notices

## Research inspiration

TenderGraph independently implements architectural ideas described in:

Joongho Ahn and Moonsoo Kim. *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents*. arXiv:2607.08028v1, July 9, 2026.

Reference implementation:

- Repository: <https://github.com/hammerbaki/enterprise-llm-agent-harness>
- Tag: `public-baseline-v0.5.16.4`
- Commit: `e8e60fb8ea6e34d4caa53f00187e760b67bd973a`
- Software license: MIT
- Data, documentation, and evaluations: CC BY 4.0

No source code from the reference implementation has been copied into this repository. Architectural concepts and experimental patterns were reimplemented for the procurement domain.

## Included synthetic fixtures

The fixtures under `fixtures/golden-cases/` were authored for TenderGraph. They are synthetic, do not describe real procurements, and are licensed under CC BY 4.0.

Official portal URLs identify the structures being modelled. They do not imply endorsement, affiliation, or that the synthetic content came from those portals.

## Runtime dependencies

Runtime and development dependencies retain their respective upstream licenses. Their authoritative license texts are available in each installed package and package registry record. Material dependencies include Next.js, React, OpenAI's JavaScript SDK, Zod, Lucide, TypeScript, and Vitest.

Before public submission, generate and archive a dependency license inventory from the locked `package-lock.json` and review every live public-data connector's terms.
