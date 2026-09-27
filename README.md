# Bee Swarm Simulator History Archive

An interactive historical timeline covering **Bee Swarm Simulator** updates, community milestones, major exploit waves, controversies, clone/copyright incidents, and other notable moments in the game's history.

🌐 **Live site:** https://loomyre.github.io/BSSHistory/

## What is included

The timeline is organized into several event types:

- 🟦 **Major Update** — large content releases and major changes
- 🟨 **Update / Patch** — regular updates, balance changes, fixes, and smaller additions
- 🟪 **Community Milestone** — leaderboard records, community achievements, visits, and other notable milestones
- 🟥 **Incident** — controversies, takedowns, clone/copyright events, and other notable disruptions
- 🔴 **Exploit** — major exploit waves, glitch abuse, leaderboard manipulation, and related enforcement events

Each timeline point opens a recent-apps-inspired update viewer with a centered reading card, adjacent update previews, categorized patch notes, artwork, and source links where available.

## Features

- Horizontally draggable historical timeline
- Smooth mouse-wheel scrolling across the timeline
- Middle-mouse drag scrolling
- Edge pull / bounce interaction at the ends of the timeline
- Click-only event opening, so dragging does not accidentally open an update
- Chronological update and community history
- Separate visual categories for updates, milestones, incidents, and exploits
- Dark glass update cards with adjacent previews, desktop arrow navigation, and touch swipe navigation
- Patch notes automatically grouped into sections such as **New content**, **Quests & events**, **Balance & fixes**, and **Other changes**
- Improved handling of older patch-note formatting so short bullet lines remain attached to the correct section
- Update-specific artwork stored locally in `assets/images/`
- Source-backed event descriptions
- Responsive layout with a full-width footer aligned to the main content
- Animated modal transitions and timeline interactions
- Mobile-friendly layout
- GitHub Pages compatible — no framework or build process required

## Update viewer controls

- **Desktop:** click and drag the update cards, click a neighboring card, use the arrow buttons, or press the left/right arrow keys
- **Touchscreen:** swipe horizontally to switch updates; scroll vertically inside the selected card to read
- **Close:** use the ✕ button, click outside the viewer, or press Escape

## Timeline controls

- **Left mouse drag** — move left and right through the timeline
- **Mouse wheel** — smoothly scroll the timeline horizontally
- **Middle mouse drag** — pan the timeline directly
- **Click a date or marker** — open that event
- **Esc / close button** — close the update panel

## Project structure

```text
BSSHistory/
├── index.html
├── README.md
└── assets/images/
    ├── BeeSwarmActualFirstIcon.webp
    ├── BSSGamesIcon.webp
    ├── BSSStickerUpdateIcon.webp
    ├── BSSRoboBearUpdateThumb.webp
    └── ...
```

The site is intentionally contained in a single `index.html` file with inline HTML, CSS, and JavaScript, making it easy to host directly with GitHub Pages.

## Sources

Information in the archive is compiled from community-maintained Bee Swarm Simulator wikis, historical patch-note archives, public leaderboard records, Roblox pages, Reddit discussions, videos, and other public community resources.

The archive is intended as a historical reference. Some older events—especially exploit incidents and community controversies—are documented primarily through surviving community reports rather than official technical statements. Where evidence is uncertain or disputed, the timeline is written to reflect that uncertainty rather than presenting speculation as fact.

## Contributing

Corrections, missing historical events, stronger primary sources, more accurate update artwork, and patch-note formatting fixes are welcome. When adding historical claims, include a public source whenever possible and avoid presenting unverified community claims as confirmed fact.

## Credits

Created by **@misra_c** with assistance from **ChatGPT 5.6 Sol**.

Bee Swarm Simulator was created by **Onett**. This archive is a community project and is not an official Bee Swarm Simulator or Roblox website.
