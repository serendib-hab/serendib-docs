---
description: Mandatory rules for writing, updating, and formatting documentation in serendib-v3
globs: ["docs/**/*.md", "docs/**/*.mts", "docs/**/*.vue"]
---

# Documentation Standards for Serendib HAB

## 1. Vocabulary & Terminology Protocol
- **Rule**: Every technical term, protocol, library, or engineering pattern introduced into any doc must have a corresponding anchor entry in `docs/guide/glossary.md`.
- **Glossary Format**:
  ```markdown
  ### Term Name {#term-anchor}
  - **Plain Explanation**: Jargon-free description of what this is.
  - **Analogy**: Grounded real-world metaphor.
  - **Why We Use It**: Practical engineering reason for Serendib.
  ```
- **Cross-Linking**: In all guides and specs, link the term to its glossary anchor: `[Term Name](/guide/glossary#term-anchor)`.

## 2. No Emojis in Documentation
- Do not use emojis in titles, headers, navigation configs, diagrams, or tables.
- Maintain a clean, professional engineering tone.

## 3. Strict Mermaid Diagramming Guidelines
- **Parentheses in Labels**: Always wrap edge labels with parentheses in double quotes:
  - Correct: `-->|"Fetch Batch (50 msgs)"|`
  - Incorrect: `-->|Fetch Batch (50 msgs)|` (causes parser crash)
- **Explicit Edges**: Do not chain or combine targets with `&`:
  - Correct: `A --> C` and `B --> C`
  - Incorrect: `A & B --> C`
- **Subgraphs**: Use explicit spacing: `subgraph SubgraphId ["Clean Title"]`.
- **Direction**: Use `flowchart TB` or `flowchart LR`.
