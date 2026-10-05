# Oracle Reading

Give your AI the craft of tarot, astrology, runes and the I Ching—and a table it can lay beside your conversation.

Start by speaking naturally: **"Everything is shifting. Help me make sense of this transition."** Your AI listens, finds the question with you, chooses the practice, and reveals the symbols when they matter. Selene Astra's working craft informs reception, symbolic synthesis and the rhythm of the encounter. The table holds what you are looking at together.

## Give your AI the skill

Download the complete release or standalone skill ZIP from [GitHub releases](https://github.com/Stunspot/oracle-reading/releases). Attach it to your supported harness or project and say **"Install this Augment."** For manual installation, copy skills/oracle-reading into your harness's skill directory. Host installation support varies.

Try **"Use Oracle Reading. Lay a three-card reading with me."** You can also bring physical cards/runes, six I Ching totals bottom to top, or chart notes.

## The AI operates the table

The skill includes exact casting support and a renderer. Your existing AI is the reader. It writes a small reading state, calls the renderer and shows the result through your host's artifact mechanism. There is no separate chatbot, subscription, inference endpoint or provider setup.

```sh
python skills/oracle-reading/scripts/show.py skills/oracle-reading/examples/tables/tarot.json --output reading.html
```

Open the generated HTML directly. Python 3.10+ is needed to generate it; the file itself needs only a browser. Native inline rendering is available where the host supports it. The skill guides the AI through both paths, cast continuity and displayed-state checks.

[The public table](https://stunspot.github.io/oracle-reading/) accepts AI-generated reading links. On its own it waits for the conversation. Your AI can produce a link with show.py --url when you want a browser/shareable display. Local/inline is preferable for private questions: URL fragments can remain in browser history and copied links.

## Included practice

| Method | Shared visual |
|---|---|
| Tarot | Matching images for all 78 Rider-Waite-Smith cards, positions, orientation and deliberate reveal |
| Runes | 24 Elder Futhark glyphs, names and cast positions |
| I Ching | 64 King Wen figures, exact six-line casts, changing lines and related figure |
| Astrology |Known planets/signs/houses and supplied relationships, with dense contextual interpretation |

The host AI owns meaning, questions and synthesis. Exact scripts own randomness, arithmetic and stable cast validation. The table never substitutes catalog keywords for the encounter. Astrology uses actual supplied/verified data; no natal or current-sky calculator is included. Traditional I Ching line passages use your chosen translation.

## Privacy and continuity

No automatic journal, analytics, account or cloud record store. The AI uses files in your chosen workspace and persists/shares only at your requested scope. Revealing and focusing preserve the same cast. Quiet hides the table while you speak; clear creates a display with no personal payload. Earlier retained files remain yours to keep or delete.

Old oracle-reading/v1 exported records can be rendered as existing cast basis; browser journal data is not automatically migrated. Prior releases remain available. Version 0.2.0 replaces the earlier self-service studio with the AI-operated table.

## Sources and development

Created by stunspot / Collaborative Dynamics. The supplied Selene persona and knowledge base informed an actual multi-turn model-role expert consultation. Original sources remain private; named operative runtime prose is derived from that craft. See [Provenance](PROVENANCE.md) and [runtime contract](docs/CONTRACT.md).

Code and authored runtime text: MIT. Bundled historical tarot art: public domain, with individual sources in assets/cards/manifest.json within the skill. No dependency installation or frontend build step. Run python -B tests/check.py, python -B tests/table.py and node tests/table.mjs. Build archives with tools/package.py --extraction-root <realistic-destination>. [Issues](https://github.com/Stunspot/oracle-reading/issues).

