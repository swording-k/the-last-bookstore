# Hackathon Polish Design

## Goal

Turn "The Last Bookstore" into a stronger Tencent Cloud Hackathon submission by making the digital-collapse premise visible in the playable opening, tightening the first-minute experience, and removing public-source deployment risks.

## Contest Fit

The contest asks for a browser-accessible game with AI-assisted creation or AI-enabled play. This project fits the Narrative Games track: a seven-day bookstore story where AI-assisted assets, fallback AI dialogue, book guidance, and diary generation support the player fantasy.

## Product Target

The first 10 seconds should communicate: the digital world collapsed, cloud knowledge vanished, paper books became civilization's last memory, and this shop is the final operating bookstore in the region.

The first 3 minutes should prove: the player listens to a visitor, chooses a response, recommends a book, and sees why the recommendation matters emotionally and socially.

## Scope

- Add visible title-screen premise copy without replacing the current warm identity.
- Rewrite Day 1 morning narrative to carry "The Great Disconnect" into gameplay.
- Make recommendation feedback describe books as scarce knowledge and emotional aid after the collapse.
- Make night diary summaries use the same post-digital-world frame.
- Remove hard-coded API keys from public source and make LLM use opt-in local configuration.
- Update submission docs so GitHub Pages is valid and Vercel is recommended only as a backup mirror.

## Non-Goals

- No new NPCs, inventory economy, map, or large systems.
- No paid deployment work or account-bound Vercel operation from this environment.
- No reliance on a live LLM key for core gameplay.

## Validation

- `node tests/hackathon-contract.test.mjs` must pass.
- Browser smoke test must prove title screen, Day 1 narrative, doorbell, first dialogue, book recommendation path, and no obvious console-blocking failures.
- Source scan must show no `sk-...` API key pattern in public files.
