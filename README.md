# com.doekse.arcade

Play MS-DOS games on Homey dashboards.

## Third-party game data (HomeyArcade widget)

The widget ships js-dos bundles under `widgets/homeyarcade/public/game/`:

- **`doom.jsdos`** — DOOM shareware (episode 1 only): `DOOM.EXE` and `DOOM1.WAD` from id Software’s official `doom19s` distribution. DOOM is a registered trademark of id Software / ZeniMax Media; the shareware game data is © id Software and is included here under id’s historical **shareware** terms for free non-commercial redistribution. This repository does **not** ship the registered or Ultimate DOOM IWADs.

- **`wolf3d.jsdos`** — Wolfenstein 3-D **shareware** (episode 1, v1.4): `WOLF3D.EXE` and `*.WL1` data from the `wolf3dsw.zip` set mirrored on Internet Archive item [`wolf3dsw`](https://archive.org/details/wolf3dsw). Wolfenstein is a registered trademark of ZeniMax Media; the bundled files are the historical Apogee-distributed shareware episode only.

- **`duke3d.jsdos`** — Duke Nukem 3D **shareware** (v1.3d, episode 1): game files taken from the same ZIP the [js-dos Duke 3D demo](https://js-dos.com/Duke%20Nukem%203d/) loads (`Duke Nukem 3d-@digitalwalt.zip` on `js-dos.com/cdn/upload/…`, originally uploaded for that player). Duke Nukem is a registered trademark; the bundled content is the historical **shareware** episode only.

- **`heretic.jsdos`** — Heretic **shareware** (v1.2, episode 1): `HERETIC.EXE` and `HERETIC1.WAD` from Raven’s official `htic_v12.zip` distribution on idgames mirrors (same DEICE layout as the classic [js-dos Heretic player](https://js-dos.com/games/heretic.exe.html)). Heretic is a registered trademark; the bundled files are the historical **shareware** episode only.

- **`dukenukem2.jsdos`** — Duke Nukem II **shareware** (episode 1): flat `duke2.ZIP` from Internet Archive item [`DukeNukemIi`](https://archive.org/details/DukeNukemIi), matching Apogee’s `VENDOR.DOC` file list. Build reads `widgets/homeyarcade/build/controls/dukenukem2.json` and writes binary `NUKEM2.-GT` (Apogee settings layout). Duke Nukem is a registered trademark; the bundled files are the historical **shareware** episode only.

- **`aliencarnage.jsdos`** — **Alien Carnage** (originally *Halloween Harry*) **shareware** (v1.2): flat `harry.zip` from Internet Archive item [`Halloween-harry-sw1`](https://archive.org/details/Halloween-harry-sw1). Handheld mappings are defined in `widgets/homeyarcade/build/controls/aliencarnage.json` (`HH1.EXE` itself does not load a separate controls file). The bundled files are the historical Apogee-distributed **shareware** episode only (launcher `HH1.EXE`).

- **`cosmo.jsdos`** — **Cosmo's Cosmic Adventure** **shareware** (episode 1, v1.20): `cosmo.ZIP` from Internet Archive item [`CosmosCosmicAdventure`](https://archive.org/details/CosmosCosmicAdventure) (file set: `COSMO1.EXE`, `COSMO1.STN`, `COSMO1.VOL`, `file_id.diz`). Handheld mappings are defined in `widgets/homeyarcade/build/controls/cosmo.json` (the game uses built-in defaults and does not load a separate controls file). The bundled files are the historical Apogee-distributed **shareware** episode only.

- **`keen4.jsdos`** — **Commander Keen 4: Secret of the Oracle** **shareware** (episode 4): `keen4.zip` from Internet Archive item [`Keen4e-sw`](https://archive.org/details/Keen4e-sw) (file set: `KEEN4E.EXE`, `GAMEMAPS.CK4`, `AUDIO.CK4`, `EGAGRAPH.CK4`, plus docs/orderware files). Handheld mappings are defined in `widgets/homeyarcade/build/controls/keen4.json` (the game uses built-in defaults and does not load a separate controls file). Commander Keen is a registered trademark; the bundled files are the historical Apogee-distributed **shareware** episode only.

- **`pcpacman.jsdos`** — **PCPacman** (PAC PC, freeware): `PCPACMAN.ZIP` from Internet Archive item [`msdos_festival_PCPACMAN`](https://archive.org/details/msdos_festival_PCPACMAN) (file set: `PACPC.EXE`, `PACPC.DOC`, `FILE_ID.DIZ`). Handheld mappings are defined in `widgets/homeyarcade/build/controls/pcpacman.json` (the game uses built-in defaults and does not load a separate controls file). The bundled files are the historical freeware DOS release by James P. Rowan.

- **`monsterbash.jsdos`** — **Monster Bash** **shareware** (v2.1, episode 1): `1bash21.zip` from RGB Classic Games ([`classicdosgames.com` mirror](http://classicdosgames.com/files/games/apogee/1bash21.zip)). The download wraps `MBSW21.SHR`; the build extracts `BASH1.EXE`, `BASH1.DAT`, `ORDER.FRM`, and `VENDOR.DOC` from that self-extracting shareware payload. Handheld mappings are defined in `widgets/homeyarcade/build/controls/monsterbash.json` (the game uses built-in defaults and does not load a separate controls file). The bundled files are the historical Apogee-distributed **shareware** episode only.

- **`plbmpong.jsdos`** — **PLBM Pong-Out** **shareware**: `plbmpong.zip` from DOSGames ([`dosgames.com` mirror](https://dosgames.com/game/plbm-pong-out/); direct file source used by the build: `https://dosgames.com/files/plbmpong.zip`). The build packages `PLBMPONG.EXE` plus required data/docs (`KPSFX.DBK`, `KPSFX.DBO`, `PONG001.LCR`, `PLBMPONG.GSK`, `PLBMPONG.GSO`, `ORDER.TXT`, `PLBM.LCR`, `README.TXT`, `FILE_ID.DIZ`). Handheld mappings are defined in `widgets/homeyarcade/build/controls/plbmpong.json` (the game uses built-in defaults and does not load a separate controls file). The bundled files are the historical PLBM shareware distribution.

To rebuild bundles after editing `widgets/homeyarcade/build/jsdos-bundle/dosbox*.conf` or `widgets/homeyarcade/build/controls/*.json`:

- DOOM: `npm run build:doom-jsdos`
- Wolfenstein 3D: `npm run build:wolf3d-jsdos`
- Duke Nukem 3D: `npm run build:duke3d-jsdos`
- Heretic: `npm run build:heretic-jsdos`
- Duke Nukem II: `npm run build:dukenukem2-jsdos`
- Alien Carnage: `npm run build:aliencarnage-jsdos`
- Cosmo's Cosmic Adventure: `npm run build:cosmo-jsdos`
- Commander Keen 4: `npm run build:keen4-jsdos`
- PCPacman: `npm run build:pcpacman-jsdos`
- Monster Bash: `npm run build:monsterbash-jsdos`
- PLBM Pong-Out: `npm run build:plbmpong-jsdos`
- All: `npm run build:game-bundles`

Build scripts require `curl`, `unzip`, `zip`, network access, and devDependency `7zip-bin` (used for DOOM’s and Heretic’s PKZIP self-extractors only).
