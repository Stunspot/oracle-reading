# Oracle Reading

**Tarot, astrology, runes, and I Ching readings—for people and their AI assistants.**

A free reading studio and a complete assistant skill. Draw cards or runes, cast the I Ching, or explore known chart placements. See the exact basis, read original symbolism, keep an optional private journal, and bring the same reading into Nova or another assistant for deeper interpretation.

## Open the studio

[Open Oracle Reading in your browser](https://stunspot.github.io/oracle-reading/), or download it for local use.

Download and extract the complete release ZIP. On Windows, double-click **Launch Oracle Reading.cmd** with Python 3.10+ installed. Keep its terminal open. On any platform:

```sh
python serve.py
```

Open the exact address printed in the terminal. The launcher opens it for you. The server prefers port 8765 and selects an available port when it is occupied. Use --port only when you want a specific port. Use `python3` if that is your Python command. Native browser modules require this HTTP launch; opening index.html directly gives launch guidance. The studio has no external dependencies or model subscription and works without internet through its local server.

## Give your assistant the skill

Copy **skills/oracle-reading** into your harness's skill directory, or attach the complete ZIP in a supported assistant project and ask **“Install this Augment.”** All runtime references and the optional Python helper are inside that skill folder. Installation support varies by host. Try: **“Use Oracle Reading. Help me understand a work transition through a three-card reading.”**

## What you can do

| Method | Included |
|---|---|
| Tarot | 78 RWS-style cards, one/three-card spreads, optional reversals, physical draws |
| Runes | 24 Elder Futhark characters, one/three-rune spreads, modern reflective meanings |
| I Ching | Fair three-coin casts or physical totals, 64 King Wen figures, exact changing lines and related figure |
| Astrology | Symbolic interpretation of supplied planet/sign/known-house placements; no chart calculations |

The studio provides original symbol commentary and reflection prompts. **Deepen with AI** copies a complete brief for your chosen assistant; no model runs secretly in the app. The installable skill supplies conversational synthesis, context and tradition-specific craft.

## Private by choice

Questions stay in the active page until you explicitly save them to this browser's journal. No account, analytics or cloud store. Exported files and AI briefs include the question and notes shown on screen; review them before sharing. Journal entries can be reopened, exported or deleted with undo. Browser storage can be unavailable or cleared; export important entries. Local journals belong to the exact browser address, including its port. When a fallback port changes, entries stay at the previous address; use export/import to carry readings between addresses, or use a fixed available --port for a consistent local journal.

## Limits and sources

Respectful spiritual practice and honest interpretation go together. Readings invite meaning and agency; they do not establish medical facts, hidden private thoughts or guaranteed future events. Current astrology needs verified chart/ephemeris data. Detailed classical I Ching work uses your chosen translation. Rune meanings are modern practice, not a reconstructed universal ancient rite.

See [Provenance](PROVENANCE.md), [Reading contract](docs/CONTRACT.md) and the tradition references in the skill. Original code/text: MIT. Created by **stunspot / Collaborative Dynamics**.

## Development

No build step or dependency installation. `python -B tests/check.py` checks catalog structure, independent figure mapping, casting fixtures and metadata parity. Run `node tests/engine.mjs` for the browser-domain engine checks. Structural tests do not establish accessibility conformance. Build both release archives with `python tools/package.py --extraction-root "C:/Users/you/Downloads/Oracle Reading"`. Support and corrections: [GitHub Issues](https://github.com/Stunspot/oracle-reading/issues).
