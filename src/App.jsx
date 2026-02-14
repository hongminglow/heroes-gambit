import { useEffect, useRef, useState } from "react";

/* ═══════════════════ CONSTANTS ═══════════════════ */
const MAX_BOARD = 7;
const HAND_LIMIT = 10;
const TURN_TIME = 45;
const MAX_MANA = 10;
const COMBAT_STEP_MS = 650;

const MUSIC_SRC =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

/* ── Card pool (local assets) ── */
const CARDS = [
  {
    id: "warrior-guard",
    name: "Warrior Guard",
    cost: 1,
    atk: 1,
    hp: 4,
    art: "/assets/card_warrior_2.jpg",
  },
  {
    id: "warrior-veteran",
    name: "Warrior Veteran",
    cost: 3,
    atk: 3,
    hp: 6,
    art: "/assets/card_warrior_3.jpg",
  },
  {
    id: "assassin",
    name: "Assassin",
    cost: 2,
    atk: 4,
    hp: 1,
    art: "/assets/card_assasin.jpg",
  },
  {
    id: "shadow-assassin",
    name: "Shadow Assassin",
    cost: 4,
    atk: 6,
    hp: 2,
    art: "/assets/card_assasin_2.jpg",
  },
  {
    id: "mage-apprentice",
    name: "Mage Apprentice",
    cost: 2,
    atk: 3,
    hp: 3,
    art: "/assets/card_mage_2.jpg",
  },
  {
    id: "storm-mage",
    name: "Storm Mage",
    cost: 4,
    atk: 6,
    hp: 3,
    art: "/assets/card_mage_3.jpg",
  },
  {
    id: "arcane-lord",
    name: "Arcane Lord",
    cost: 5,
    atk: 7,
    hp: 4,
    art: "/assets/card_mage_4.jpg",
  },
  {
    id: "dragon",
    name: "Dragon",
    cost: 7,
    atk: 8,
    hp: 8,
    art: "/assets/card_dragon.jpg",
  },
];

/* ── Heroes ── */
const HEROES = {
  warrior: {
    key: "warrior",
    name: "Warrior King",
    hp: 36,
    startMana: 1,
    art: "/assets/card_dragon.jpg",
    optionArt: "/assets/card_warrior_option.jpg",
    desc: "Tank · High HP frontline",
  },
  mage: {
    key: "mage",
    name: "Arcane Magus",
    hp: 24,
    startMana: 3,
    art: "/assets/card_dragon.jpg",
    optionArt: "/assets/card_mage_option.jpg",
    desc: "Tempo · Starts with extra mana",
  },
};

const ENEMY_HERO = {
  name: "Dark Overlord",
  hp: 30,
  art: "/assets/card_dragon_2.jpg",
};

/* ═══════════════════ HELPERS ═══════════════════ */
const randId = () => Math.random().toString(36).slice(2, 9);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(heroKey = "neutral") {
  const warriorMix = [
    "warrior-guard",
    "warrior-guard",
    "warrior-guard",
    "warrior-guard",
    "warrior-veteran",
    "warrior-veteran",
    "warrior-veteran",
    "warrior-veteran",
    "assassin",
    "assassin",
    "assassin",
    "shadow-assassin",
    "shadow-assassin",
    "shadow-assassin",
    "mage-apprentice",
    "warrior-guard",
    "warrior-veteran",
    "assassin",
    "shadow-assassin",
    "dragon",
    "dragon",
  ];

  const mageMix = [
    "mage-apprentice",
    "mage-apprentice",
    "mage-apprentice",
    "mage-apprentice",
    "storm-mage",
    "storm-mage",
    "storm-mage",
    "storm-mage",
    "arcane-lord",
    "arcane-lord",
    "arcane-lord",
    "assassin",
    "assassin",
    "mage-apprentice",
    "storm-mage",
    "arcane-lord",
    "shadow-assassin",
    "warrior-veteran",
    "dragon",
    "dragon",
    "assassin",
  ];

  const neutralMix = [
    "warrior-guard",
    "warrior-veteran",
    "assassin",
    "shadow-assassin",
    "mage-apprentice",
    "storm-mage",
    "arcane-lord",
    "dragon",
    "warrior-guard",
    "warrior-veteran",
    "assassin",
    "shadow-assassin",
    "mage-apprentice",
    "storm-mage",
    "arcane-lord",
    "dragon",
    "warrior-guard",
    "assassin",
    "mage-apprentice",
    "storm-mage",
  ];

  const ids =
    heroKey === "warrior"
      ? warriorMix
      : heroKey === "mage"
        ? mageMix
        : neutralMix;

  return shuffle(
    ids.map((id) => ({ ...CARDS.find((c) => c.id === id), uid: randId() })),
  );
}

/* ═══════════════════ SFX (Web Audio API) ═══════════════════ */
let _ctx = null;
function actx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function sfx(type) {
  try {
    const c = actx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime;
    switch (type) {
      case "play":
        o.type = "sine";
        o.frequency.setValueAtTime(520, t);
        o.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        g.gain.value = 0.1;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.start(t);
        o.stop(t + 0.15);
        break;
      case "hit":
        o.type = "sawtooth";
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
        g.gain.value = 0.08;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t);
        o.stop(t + 0.22);
        break;
      case "tick":
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.06;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        o.start(t);
        o.stop(t + 0.05);
        break;
      case "end":
        o.type = "triangle";
        o.frequency.setValueAtTime(380, t);
        o.frequency.linearRampToValueAtTime(620, t + 0.12);
        g.gain.value = 0.08;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.start(t);
        o.stop(t + 0.2);
        break;
      case "death":
        o.type = "sawtooth";
        o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.35);
        g.gain.value = 0.12;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        o.start(t);
        o.stop(t + 0.38);
        break;
      case "draw":
        o.type = "sine";
        o.frequency.setValueAtTime(440, t);
        o.frequency.exponentialRampToValueAtTime(660, t + 0.08);
        g.gain.value = 0.06;
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.start(t);
        o.stop(t + 0.12);
        break;
      default:
        break;
    }
  } catch {
    /* swallow audio errors */
  }
}

/* helper: pause that works in async combat sequences */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════ COMPONENT ═══════════════════ */
export default function App() {
  /*
   * Phases:
   *   selection  → playerTurn → playerCombat → enemyTurn → enemyCombat
   *                                                         ↓
   *                                               (next round → playerTurn)
   *   victory / defeat  (terminal)
   */
  const [phase, setPhase] = useState("selection");
  const phaseRef = useRef("selection");
  const [banner, setBanner] = useState("");
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = useRef(null);

  const [player, setPlayer] = useState({
    hero: null,
    hp: 0,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    board: [],
  });

  const [enemy, setEnemy] = useState({
    hp: ENEMY_HERO.hp,
    mana: 1,
    maxMana: 1,
    hand: [],
    deck: [],
    board: [],
  });

  const playerRef = useRef(player);
  const enemyRef = useRef(enemy);

  const [lastPlayed, setLastPlayed] = useState(null);
  const [volume, setVolume] = useState(0.12);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  /* animation markers – uid → css class */
  const [animMarkers, setAnimMarkers] = useState({});
  /* floating damage numbers: [{uid, dmg, key}] */
  const [dmgFloats, setDmgFloats] = useState([]);
  /* drawn card glow uid */
  const [drawnUid, setDrawnUid] = useState(null);
  /* combat lock */
  const combatLock = useRef(false);

  /* ── keep refs in sync ── */
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  useEffect(() => {
    enemyRef.current = enemy;
  }, [enemy]);

  /* ── audio volume ── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  /* ── turn timer ── */
  useEffect(() => {
    if (phase !== "playerTurn") {
      clearInterval(timerRef.current);
      return;
    }
    setTimer(TURN_TIME);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          doEndTurn();
          return TURN_TIME;
        }
        if (prev <= 11) sfx("tick");
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── auto-advance phase ── */
  useEffect(() => {
    let t;
    if (phase === "playerCombat" && !combatLock.current) {
      combatLock.current = true;
      doPlayerCombatAnimated();
    } else if (phase === "enemyTurn") {
      t = setTimeout(doEnemyTurn, 900);
    } else if (phase === "enemyCombat" && !combatLock.current) {
      combatLock.current = true;
      doEnemyCombatAnimated();
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ───────── helpers ───────── */
  function flash(text) {
    setBanner(text);
    setTimeout(() => setBanner(""), 1500);
  }

  /* ═══ MATCH INIT ═══ */
  function startMatch(heroKey) {
    const h = HEROES[heroKey];
    const pd = buildDeck(heroKey);
    const ed = buildDeck("neutral");
    setPlayer({
      hero: h,
      hp: h.hp,
      mana: h.startMana,
      maxMana: h.startMana,
      hand: pd.slice(0, 4),
      deck: pd.slice(4),
      board: [],
    });
    setEnemy({
      hp: ENEMY_HERO.hp,
      mana: 1,
      maxMana: 1,
      hand: ed.slice(0, 4),
      deck: ed.slice(4),
      board: [],
    });
    setRound(1);
    setLastPlayed(null);
    audioRef.current?.play().catch(() => {});
    flash("YOUR TURN");
    setPhase("playerTurn");
  }

  /* ═══ PLAYER ACTIONS ═══ */
  function playCard(card) {
    if (phaseRef.current !== "playerTurn") return;
    if (card.cost > playerRef.current.mana) return;
    if (playerRef.current.board.length >= MAX_BOARD) return;
    const restoreIndex = playerRef.current.hand.findIndex(
      (c) => c.uid === card.uid,
    );
    sfx("play");
    const played = { ...card, placing: true, restoreIndex };
    setLastPlayed(played);
    setPlayer((p) => ({
      ...p,
      mana: p.mana - card.cost,
      hand: p.hand.filter((c) => c.uid !== card.uid),
      board: [...p.board, played],
    }));
    /* clear placing flag after animation */
    setTimeout(() => {
      setPlayer((p) => ({
        ...p,
        board: p.board.map((c) =>
          c.uid === card.uid ? { ...c, placing: false } : c,
        ),
      }));
    }, 500);
  }

  function undoPlay() {
    if (!lastPlayed || phaseRef.current !== "playerTurn") return;
    setPlayer((p) => {
      const cardToRestore = { ...lastPlayed, placing: false };
      const idx = Math.max(
        0,
        Math.min(cardToRestore.restoreIndex ?? p.hand.length, p.hand.length),
      );
      const nextHand = [...p.hand];
      nextHand.splice(idx, 0, cardToRestore);
      return {
        ...p,
        mana: p.mana + lastPlayed.cost,
        hand: nextHand,
        board: p.board.filter((c) => c.uid !== lastPlayed.uid),
      };
    });
    setLastPlayed(null);
  }

  function doEndTurn() {
    if (phaseRef.current !== "playerTurn") return;
    clearInterval(timerRef.current);
    sfx("end");
    setLastPlayed(null);
    setPlayer((p) => ({
      ...p,
      board: p.board.map((c) => ({ ...c, placing: false })),
    }));
    flash("BATTLE");
    setPhase("playerCombat");
  }

  /* ═══ COMBAT — player minions attack (animated) ═══ */
  async function doPlayerCombatAnimated() {
    const p = playerRef.current;
    const e = enemyRef.current;
    const pBoard = p.board.map((c) => ({ ...c }));
    const eBoard = e.board.map((c) => ({ ...c }));
    let eHp = e.hp;

    for (const atk of pBoard) {
      if (atk.hp <= 0) continue;
      const targets = eBoard.filter((c) => c.hp > 0);

      /* mark attacker */
      setAnimMarkers((m) => ({ ...m, [atk.uid]: "attacking" }));
      await wait(200);

      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const dmgToTarget = atk.atk;
        const dmgToAtk = target.atk;
        target.hp -= dmgToTarget;
        atk.hp -= dmgToAtk;
        sfx("hit");

        /* shake both + float damage */
        setAnimMarkers((m) => ({
          ...m,
          [atk.uid]: "shake",
          [target.uid]: "shake",
        }));
        setDmgFloats((f) => [
          ...f,
          { uid: target.uid, dmg: dmgToTarget, key: randId() },
          { uid: atk.uid, dmg: dmgToAtk, key: randId() },
        ]);
        await wait(COMBAT_STEP_MS);

        /* death animation */
        if (target.hp <= 0) {
          sfx("death");
          setAnimMarkers((m) => ({ ...m, [target.uid]: "dying" }));
          await wait(400);
        }
        if (atk.hp <= 0) {
          sfx("death");
          setAnimMarkers((m) => ({ ...m, [atk.uid]: "dying" }));
          await wait(400);
        }
      } else {
        eHp = Math.max(0, eHp - atk.atk);
        sfx("hit");
        setAnimMarkers((m) => ({ ...m, "enemy-hero": "shake" }));
        setDmgFloats((f) => [
          ...f,
          { uid: "enemy-hero", dmg: atk.atk, key: randId() },
        ]);
        await wait(COMBAT_STEP_MS);
      }

      /* update state after each step so UI reflects HP changes */
      setPlayer((prev) => ({ ...prev, board: pBoard.filter((c) => c.hp > 0) }));
      setEnemy((prev) => ({
        ...prev,
        hp: eHp,
        board: eBoard.filter((c) => c.hp > 0),
      }));
      setAnimMarkers({});
    }

    /* final cleanup */
    setDmgFloats([]);
    setAnimMarkers({});
    combatLock.current = false;

    if (eHp <= 0) {
      flash("VICTORY");
      setPhase("victory");
      return;
    }

    await wait(300);
    flash("ENEMY TURN");
    setPhase("enemyTurn");
  }

  /* ═══ ENEMY AI ═══ */
  function doEnemyTurn() {
    setEnemy((prev) => {
      const mm = Math.min(MAX_MANA, prev.maxMana + 1);
      let e = { ...prev, maxMana: mm, mana: mm };

      /* draw */
      if (e.deck.length > 0 && e.hand.length < HAND_LIMIT) {
        e = { ...e, hand: [...e.hand, e.deck[0]], deck: e.deck.slice(1) };
      }

      /* play cards greedily */
      let board = [...e.board];
      let hand = [...e.hand];
      let mana = e.mana;
      const sorted = [...hand].sort((a, b) => b.cost - a.cost);
      for (const card of sorted) {
        if (card.cost <= mana && board.length < MAX_BOARD) {
          board.push({ ...card });
          hand = hand.filter((c) => c.uid !== card.uid);
          mana -= card.cost;
        }
      }
      return { ...e, board, hand, mana };
    });

    setTimeout(() => {
      flash("BATTLE");
      setPhase("enemyCombat");
    }, 600);
  }

  /* ═══ COMBAT — enemy minions attack (animated) ═══ */
  async function doEnemyCombatAnimated() {
    const p = playerRef.current;
    const e = enemyRef.current;
    const pBoard = p.board.map((c) => ({ ...c }));
    const eBoard = e.board.map((c) => ({ ...c }));
    let pHp = p.hp;

    for (const atk of eBoard) {
      if (atk.hp <= 0) continue;
      const targets = pBoard.filter((c) => c.hp > 0);

      setAnimMarkers((m) => ({ ...m, [atk.uid]: "attacking" }));
      await wait(200);

      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const dmgToTarget = atk.atk;
        const dmgToAtk = target.atk;
        target.hp -= dmgToTarget;
        atk.hp -= dmgToAtk;
        sfx("hit");

        setAnimMarkers((m) => ({
          ...m,
          [atk.uid]: "shake",
          [target.uid]: "shake",
        }));
        setDmgFloats((f) => [
          ...f,
          { uid: target.uid, dmg: dmgToTarget, key: randId() },
          { uid: atk.uid, dmg: dmgToAtk, key: randId() },
        ]);
        await wait(COMBAT_STEP_MS);

        if (target.hp <= 0) {
          sfx("death");
          setAnimMarkers((m) => ({ ...m, [target.uid]: "dying" }));
          await wait(400);
        }
        if (atk.hp <= 0) {
          sfx("death");
          setAnimMarkers((m) => ({ ...m, [atk.uid]: "dying" }));
          await wait(400);
        }
      } else {
        pHp = Math.max(0, pHp - atk.atk);
        sfx("hit");
        setAnimMarkers((m) => ({ ...m, "player-hero": "shake" }));
        setDmgFloats((f) => [
          ...f,
          { uid: "player-hero", dmg: atk.atk, key: randId() },
        ]);
        await wait(COMBAT_STEP_MS);
      }

      setPlayer((prev) => ({
        ...prev,
        hp: pHp,
        board: pBoard.filter((c) => c.hp > 0),
      }));
      setEnemy((prev) => ({ ...prev, board: eBoard.filter((c) => c.hp > 0) }));
      setAnimMarkers({});
    }

    setDmgFloats([]);
    setAnimMarkers({});
    combatLock.current = false;

    const survivingP = pBoard.filter((c) => c.hp > 0);
    const survivingE = eBoard.filter((c) => c.hp > 0);
    setEnemy((prev) => ({ ...prev, board: survivingE }));

    if (pHp <= 0) {
      setPlayer((prev) => ({ ...prev, hp: pHp, board: survivingP }));
      flash("DEFEAT");
      setPhase("defeat");
      return;
    }

    /* ── next player turn with draw animation ── */
    await wait(300);
    setRound((r) => r + 1);
    setPlayer((prev) => {
      const mm = Math.min(MAX_MANA, prev.maxMana + 1);
      let next = { ...prev, hp: pHp, maxMana: mm, mana: mm, board: survivingP };
      if (next.deck.length > 0 && next.hand.length < HAND_LIMIT) {
        const drawn = next.deck[0];
        setDrawnUid(drawn.uid);
        sfx("draw");
        setTimeout(() => setDrawnUid(null), 600);
        next = {
          ...next,
          hand: [...next.hand, drawn],
          deck: next.deck.slice(1),
        };
      }
      return next;
    });
    flash("YOUR TURN");
    setPhase("playerTurn");
  }

  /* ═══ FAN HAND MATH ═══ */
  function fanStyle(i, n) {
    if (n <= 1) return { transform: "none", zIndex: 1 };
    const center = (n - 1) / 2;
    const off = i - center;
    const angle = off * (n > 7 ? 3.5 : n > 4 ? 5 : 8);
    const yOff = off * off * (n > 7 ? 2 : 3.5);
    return {
      transform: `rotate(${angle}deg) translateY(${yOff}px)`,
      zIndex: i,
    };
  }

  /* ═══════════════════ RENDER — SELECTION ═══════════════════ */
  if (phase === "selection") {
    return (
      <div className="game-root select-screen">
        <h1 className="title">Heroes Gambit</h1>
        <p className="sub">Choose your champion</p>
        <div className="hero-picks">
          {Object.values(HEROES).map((h) => (
            <button
              key={h.key}
              className="hero-pick"
              onClick={() => startMatch(h.key)}
            >
              <img src={h.optionArt ?? h.art} alt={h.name} />
              <h2>{h.name}</h2>
              <p>{h.desc}</p>
              <span>
                HP {h.hp} · Mana {h.startMana}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ═══════════════════ RENDER — GAME ═══════════════════ */
  const isMyTurn = phase === "playerTurn";
  const danger = timer <= 10;

  return (
    <div className="game-root playing">
      {/* background music */}
      <audio ref={audioRef} src={MUSIC_SRC} autoPlay loop />

      {/* phase banner */}
      {banner && (
        <div className="banner" key={`${banner}-${round}-${timer}`}>
          {banner}
        </div>
      )}

      {/* ── top bar ── */}
      <header className="topbar">
        <span className="topbar-title">Heroes Gambit</span>
        <span className="topbar-round">R{round}</span>
        <div className="topbar-audio">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
          />
        </div>
      </header>

      {/* ── centered timer ── */}
      <div className={`timer ${danger ? "timer--danger" : ""}`}>
        {isMyTurn ? timer : "—"}
      </div>

      {/* ── enemy hero bar ── */}
      <div
        className={`hbar enemy-hbar${animMarkers["enemy-hero"] === "shake" ? " anim-shake" : ""}`}
        style={{ position: "relative" }}
      >
        <img src={ENEMY_HERO.art} alt="Enemy" className="portrait" />
        <div className="hbar-info">
          <strong>{ENEMY_HERO.name}</strong>
          <span>
            ❤️&nbsp;{enemy.hp}&ensp;💎&nbsp;{enemy.mana}/{enemy.maxMana}
          </span>
        </div>
        <span className="hbar-deck" title="Enemy deck">
          🂠 {enemy.deck.length}
        </span>
        {dmgFloats
          .filter((d) => d.uid === "enemy-hero")
          .map((d) => (
            <span key={d.key} className="dmg-float">
              -{d.dmg}
            </span>
          ))}
      </div>

      {/* ── enemy board ── */}
      <div className="board">
        {enemy.board.length === 0 ? (
          <span className="board-empty">No enemy minions</span>
        ) : (
          enemy.board.map((c) => (
            <div
              key={c.uid}
              className={`minion enemy-minion${animMarkers[c.uid] ? ` anim-${animMarkers[c.uid]}` : ""}`}
              style={{ position: "relative" }}
            >
              <img src={c.art} alt={c.name} />
              <span className="mn">{c.name}</span>
              <span className="ms">
                ⚔{c.atk} ❤{c.hp}
              </span>
              {dmgFloats
                .filter((d) => d.uid === c.uid)
                .map((d) => (
                  <span key={d.key} className="dmg-float">
                    -{d.dmg}
                  </span>
                ))}
            </div>
          ))
        )}
      </div>

      {/* ── arena divider ── */}
      <hr className="divider" />

      {/* ── player board ── */}
      <div className="board">
        {player.board.length === 0 ? (
          <span className="board-empty">Your minions appear here</span>
        ) : (
          player.board.map((c) => (
            <div
              key={c.uid}
              className={`minion player-minion${c.placing ? " placing" : ""}${animMarkers[c.uid] ? ` anim-${animMarkers[c.uid]}` : ""}`}
              style={{ position: "relative" }}
            >
              <img src={c.art} alt={c.name} />
              <span className="mn">{c.name}</span>
              <span className="ms">
                ⚔{c.atk} ❤{c.hp}
              </span>
              {dmgFloats
                .filter((d) => d.uid === c.uid)
                .map((d) => (
                  <span key={d.key} className="dmg-float">
                    -{d.dmg}
                  </span>
                ))}
            </div>
          ))
        )}
      </div>

      {/* ── player hero bar ── */}
      <div
        className={`hbar player-hbar${animMarkers["player-hero"] === "shake" ? " anim-shake" : ""}`}
        style={{ position: "relative" }}
      >
        {player.hero && (
          <img
            src={player.hero.art}
            alt={player.hero.name}
            className="portrait"
          />
        )}
        <div className="hbar-info">
          <strong>{player.hero?.name}</strong>
          <span>
            ❤️&nbsp;{player.hp}&ensp;💎&nbsp;{player.mana}/{player.maxMana}
          </span>
        </div>
        <span className="hbar-deck" title="Your deck">
          🂠 {player.deck.length}
        </span>
        <div className="hbar-actions">
          {lastPlayed && isMyTurn && (
            <button
              type="button"
              className="ibtn undo-btn"
              onClick={undoPlay}
              title="Undo last card"
            >
              {/* SVG undo arrow */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10h10a5 5 0 0 1 0 10H9" />
                <polyline points="7 14 3 10 7 6" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="ibtn end-btn"
            onClick={doEndTurn}
            disabled={!isMyTurn}
            title="End Turn"
          >
            {/* SVG crossed swords */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20 L20 4" />
              <path d="M16 4 L20 4 L20 8" />
              <path d="M20 20 L4 4" />
              <path d="M8 4 L4 4 L4 8" />
            </svg>
          </button>
        </div>
        {dmgFloats
          .filter((d) => d.uid === "player-hero")
          .map((d) => (
            <span key={d.key} className="dmg-float">
              -{d.dmg}
            </span>
          ))}
      </div>

      {/* ── fan-shaped hand ── */}
      <div className="hand-fan">
        {player.hand.map((card, i) => {
          const canPlay =
            card.cost <= player.mana && player.board.length < MAX_BOARD;
          return (
            <button
              key={card.uid}
              type="button"
              className={`fcard${canPlay ? " playable" : " locked"}${isMyTurn ? "" : " off"}`}
              style={fanStyle(i, player.hand.length)}
              onClick={() => playCard(card)}
              disabled={!isMyTurn || !canPlay}
            >
              <span className="fc-cost">{card.cost}</span>
              <img src={card.art} alt={card.name} />
              <span className="fc-name">{card.name}</span>
              <span className="fc-stats">
                ⚔{card.atk}&ensp;❤{card.hp}
              </span>
              {drawnUid === card.uid && <span className="draw-glow" />}
            </button>
          );
        })}
      </div>

      {/* ── result overlay ── */}
      {(phase === "victory" || phase === "defeat") && (
        <div className="overlay">
          <div className="overlay-box">
            <h2>{phase === "victory" ? "⚔️ Victory!" : "💀 Defeat"}</h2>
            <button type="button" onClick={() => window.location.reload()}>
              New Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
