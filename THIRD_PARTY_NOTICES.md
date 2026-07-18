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

Runtime and development dependencies retain their respective upstream licenses.
Their authoritative license texts are available in each installed package and
package registry record. Material dependencies include Next.js, React,
OpenAI's JavaScript SDK, Zod, Lucide, PDF.js (Apache-2.0), Mammoth
(BSD-2-Clause), Cheerio (MIT), TypeScript, and Vitest. The locked dependency
inventory is preserved at `artifacts/compliance/dependency-licenses.json` and
can be regenerated with `npm run compliance:licenses`.

## ChileCompra public procurement snapshot

`fixtures/public-snapshots/cl-5802381-7547UCUK` contains a frozen evaluation
report and public-detail page retrieved from Mercado Publico/ChileCompra on
July 14, 2026. ChileCompra publishes procurement information in open and
reusable formats for analysis, oversight, and application development:

- https://www.chilecompra.cl/datos-abiertos/
- https://datos-abiertos.chilecompra.cl/datos-abiertos

TenderGraph is not affiliated with ChileCompra or the University of Chile.
Source documents remain attributable to their publishers. Normalized English
evidence excerpts are identified as reviewed translations and do not replace
the original Spanish records.

## Piper voice synthesis

The submission demo narration was rendered locally with the MIT-licensed
`rhasspy/piper` engine and the MIT-licensed `en_US-lessac-medium` Piper voice.
Neither the Piper executable nor the voice model is redistributed in this
repository; only the generated narration embedded in the demo video is stored.
