# Contributing

Thanks for taking a look at Schemato. The project is intentionally small: each input parser turns a schema into a shared `Shape`, and each renderer turns that `Shape` into one target language.

## Local Setup

```bash
npm install
npm run dev
npm run build
```

Schemato uses static export, so `npm run build` should complete without a server.

## Adding an Input Format

1. Add a parser in `lib/converters/<format>-shape.ts`.
2. Register it in `lib/converters/index.ts` with `bridge(parser, target)` for each target.
3. Add format metadata and a sample in `lib/formats.ts`.
4. Run `npm run build` and test at least one generated page.

## Adding an Output Language

1. Add a renderer in `lib/converters/renderers.ts`.
2. Register it in `RENDERERS`.
3. Add format metadata in `lib/formats.ts`.
4. Verify JSON, JSON Schema, and one non-JSON input produce useful output.

## Pull Requests

Good PRs are small and concrete. Please include:

- What conversion path changed.
- A short example input and generated output.
- Any known limitations.

For bug fixes, include the pasted schema or a reduced reproduction when possible.
