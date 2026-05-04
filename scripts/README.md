# Scripts

Repository maintenance scripts are grouped by workflow:

- `check/`: validation scripts that read or optionally fix content metadata.
- `radar/`: AI Radar generation, asset, audio, and fetch helpers.
- `lib/`: shared utilities used by scripts.
- `local/`: local-only or one-off workflow helpers that are not public npm entrypoints.

The historical scripts in this directory root are compatibility wrappers. Prefer adding new implementation code inside a workflow directory and wiring `package.json` to that path.
