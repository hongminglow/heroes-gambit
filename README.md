# Heroes Gambit — Card Battle Rules

A Hearthstone-inspired fan-hand battler rebuilt with local art and bespoke animations.

---

## Objective

Reduce the enemy hero's HP to **0** before yours reaches 0.

## Hero Selection

| Hero             | HP  | Starting Mana | Style                                         |
| ---------------- | --- | ------------- | --------------------------------------------- |
| **Warrior King** | 36  | 1             | Frontline tank — beefy minions + Assassin mix |
| **Arcane Magus** | 24  | 3             | Tempo burst — higher mana + spell-like mages  |

## Turn Flow

Every round follows the same cycle:

1. **Your Turn** — Mana refills (max +1 each round, cap 10). You draw 1 card.
   - Click a fan-shaped card to play it if you can afford it (green outline = playable).
   - **Undo** returns the last played card to **its original hand slot**.
   - **End Turn** switches to Combat phase.
2. **Player Combat** — Board minions attack automatically one at a time (watch the damage floats, shakes, and death effects).
3. **Enemy Turn** — AI draws, gains mana, and slams greedy cards onto its board.
4. **Enemy Combat** — Enemy minions retaliate with the same animated routine.
5. **Next Round** — Mana increases again and you grab a fresh card (with draw glow).

## Board

- 7 minions maximum per side.
- Cards summon directly in place — no lanes, just tabletop positioning.
- Combat is turn-based but animated so you can follow each attack, death, and hero damage.

## Cards

| Card            | Cost | ATK | HP  | Flavor                                         |
| --------------- | ---- | --- | --- | ---------------------------------------------- |
| Warrior Guard   | 1    | 1   | 4   | Cheap defender that keeps the board sticky     |
| Warrior Veteran | 3    | 3   | 6   | Durable bruiser for trades                     |
| Assassin        | 2    | 4   | 1   | Burst damage that dies fast                    |
| Shadow Assassin | 4    | 6   | 2   | High-risk high-reward finisher                 |
| Mage Apprentice | 2    | 3   | 3   | Early tempo push for mages                     |
| Storm Mage      | 4    | 6   | 3   | Lightning striker with decent damage           |
| Arcane Lord     | 5    | 7   | 4   | Threat that punishes multiple opponents        |
| Dragon          | 7    | 8   | 8   | Legendary finisher with balanced survivability |

Each hero's deck is themed: Warrior gets extra low-cost beef plus multiple Assassins, Mage leans into spellcasters with supplementary Assassins and a couple of Warriors for tempo.

## Hand Display

Cards fan out at the bottom with a subtle curve. Hovering reveals the card, clicking animates it flying onto the board, and newly drawn cards briefly glow.

## UI & Visuals

- **Timer:** 45-second turn timer is centered and pulses red when under 10 seconds. If time hits 0, the turn auto-ends with the relevant sfx.
- **Hero Heads:** Both player and enemy hero avatars now use the new dragon-themed art (`card_dragon.jpg` for player, `card_dragon_2.jpg` for enemy).
- **Undo/End buttons:** Icon-only buttons with SVG glyphs for a cleaner UI.
- **Combat:** Damage is accompanied by floating red numbers, cards shake when hit, dying cards shrink into nothing, and combat proceeds step-by-step so every hit is visible.
- **Draw Animation:** Newly drawn cards flash a golden glow when they appear in hand.

## Audio

- Single ambient loop (SoundHelix track).
- Custom Web Audio SFX: card play, hit, timer tick, end-turn chime, death rumble, and draw shimmer.

## Win / Loss

- Victory when enemy hero HP hits 0.
- Defeat when your hero HP hits 0.
- Overlay prompts with a **New Match** button.

---

## Development

```bash
cd heroes-gambit-game
npm install
npm run dev
```

The project builds via `npm run build` and can be deployed to any static host (Netlify, Vercel, GitHub Pages, etc.).

---

Still tracking any Construct 3 bridge: this is React/Vite, not a `.c3p` file, so it can't run _inside_ Construct 3 editor without a full rebuild.
