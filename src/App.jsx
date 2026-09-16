import React, { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient.js";

/* ---- lightweight inline-SVG icon set (replaces lucide-react for a dependency-free HTML build) ---- */
function makeIcon(paths) {
  return function Icon({ size = 16, color = "currentColor", className = "", style = {}, title }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      >
        {title ? <title>{title}</title> : null}
        {paths}
      </svg>
    );
  };
}

const HomeIcon = makeIcon(<><path d="M3 10l9-7 9 7" /><path d="M9 21V12h6v9" /></>);
const ClipboardPlus = makeIcon(<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6" /><path d="M12 10.5v6" /><path d="M9 13.5h6" /></>);
const LineChart = makeIcon(<><path d="M3 3v18h18" /><path d="M7 16l4-5 3 3 5-7" /></>);
const CalendarRange = makeIcon(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>);
const Users = makeIcon(<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" /><circle cx="17.5" cy="9.5" r="2.4" /><path d="M15.5 14.3c2.7.4 4.7 2.4 4.7 5.7" /></>);
const FileSearch = makeIcon(<><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5" /><circle cx="10.8" cy="15" r="2.2" /><path d="M12.6 16.8L14.5 18.7" /></>);
const Target = makeIcon(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.7" fill="currentColor" /></>);
const BookOpenText = makeIcon(<><path d="M12 6.2c-2-1.6-5.2-2.1-8.2-1.1v13.2c3-1 6.2-.5 8.2 1.1 2-1.6 5.2-2.1 8.2-1.1V5.1c-3-1-6.2-.5-8.2 1.1z" /></>);
const Trash2 = makeIcon(<><path d="M4 6.5h16" /><path d="M8.5 6.5v-2a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v2" /><path d="M18 6.5L17 20a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 20L6 6.5" /></>);
const ChevronLeft = makeIcon(<polyline points="15 18 9 12 15 6" />);
const CheckCircle2 = makeIcon(<><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.6 2.6L16 9.3" /></>);
const XCircle = makeIcon(<><circle cx="12" cy="12" r="9" /><path d="M9.2 9.2l5.6 5.6" /><path d="M14.8 9.2l-5.6 5.6" /></>);
const LockIcon = makeIcon(<><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V7.5a4 4 0 118 0v3" /></>);
const LogOut = makeIcon(<><path d="M9.5 21H5.5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><path d="M21 12H9.5" /></>);
const Flag = makeIcon(<><path d="M5 3v18" /><path d="M5 4h12.5l-2.7 4.2L17.5 12H5" /></>);
/* ============================================================================
   HIDDEN YARDS — special-teams field-position tracker
   Single-file interactive prototype. All data lives in React state
   (no backend / no localStorage) so it resets on reload — that's expected
   for a click-through demo.
============================================================================ */

/* ---------------------------- design tokens / css --------------------------- */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

    .hy-root, .hy-root * { box-sizing: border-box; }
    .hy-root {
      --turf-900:#122922;
      --turf-800:#173A2E;
      --turf-700:#1F4C3B;
      --turf-600:#2C6349;
      --chalk-50:#F8F6EF;
      --chalk-100:#F0EBDC;
      --chalk-200:#E4DCC5;
      --ink-900:#1B211D;
      --ink-700:#3A423C;
      --ink-500:#6B736C;
      --gold-500:#C99A44;
      --gold-600:#AD8134;
      --rust-500:#B3492D;
      --rust-050:#F7E7E1;
      --good-600:#2E6E4E;
      --good-050:#E5F1EA;
      --line:#DCD4BC;
      font-family: 'Inter', sans-serif;
      color: var(--ink-900);
      background: var(--chalk-50);
      min-height: 100%;
      width: 100%;
    }
    .hy-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
    .hy-mono { font-family: 'IBM Plex Mono', monospace; }

    .hy-eyebrow {
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 11.5px;
      color: var(--gold-600);
      font-weight: 600;
    }

    .hy-shell { display: flex; min-height: 640px; background: var(--chalk-50); }
    .hy-sidebar {
      width: 236px; flex-shrink: 0; background: var(--turf-900);
      color: var(--chalk-50); padding: 22px 16px 18px; display: flex; flex-direction: column;
    }
    .hy-side-brand { display:flex; align-items:center; gap:10px; padding: 0 6px 18px; border-bottom: 1px solid rgba(248,246,239,0.14); margin-bottom: 16px; }
    .hy-side-brand .mark { width: 34px; height: 34px; border-radius: 7px; background: linear-gradient(155deg, var(--gold-500), var(--gold-600)); display:flex; align-items:center; justify-content:center; color: var(--turf-900); font-weight:700; font-family:'Oswald',sans-serif; font-size:16px; flex-shrink:0; }
    .hy-side-brand .name { font-family:'Oswald',sans-serif; font-size: 16.5px; font-weight:600; line-height:1.1; }
    .hy-side-brand .tag { font-size: 10.5px; color: rgba(248,246,239,0.55); letter-spacing:0.05em; }

    .hy-side-section-label { font-family:'Oswald',sans-serif; font-size:10.5px; text-transform:uppercase; letter-spacing:0.14em; color: rgba(248,246,239,0.45); margin: 14px 8px 6px; }
    .hy-navitem {
      display:flex; align-items:center; gap:10px; width:100%; text-align:left;
      padding: 9px 10px; border-radius: 7px; border:none; background:transparent; cursor:pointer;
      color: rgba(248,246,239,0.86); font-size: 13.5px; font-weight:500; margin-bottom:2px;
      transition: background .12s ease, color .12s ease;
    }
    .hy-navitem:hover { background: rgba(248,246,239,0.08); }
    .hy-navitem.active { background: var(--gold-500); color: var(--turf-900); font-weight:600; }
    .hy-navitem .badge-lock { margin-left:auto; opacity:0.6; }
    .hy-navitem.active .badge-lock { opacity:0.55; }

    .hy-side-foot { margin-top:auto; padding-top:14px; border-top:1px solid rgba(248,246,239,0.14); }
    .hy-side-acct { font-size:12px; color: rgba(248,246,239,0.7); padding: 4px 8px 10px; line-height:1.5;}
    .hy-side-acct b { color:#fff; font-family:'Oswald',sans-serif; font-weight:500; letter-spacing:0.01em; }

    .hy-main { flex:1; min-width:0; padding: 26px 34px 48px; overflow-y:auto; }
    .hy-page-head { display:flex; align-items:flex-end; justify-content:space-between; gap: 16px; margin-bottom: 18px; flex-wrap:wrap; }
    .hy-page-title { font-family:'Oswald',sans-serif; font-size: 27px; font-weight:600; color: var(--turf-900); line-height:1.1; }
    .hy-page-sub { color: var(--ink-500); font-size: 13.5px; margin-top:4px; max-width: 560px; }

    .hy-back { display:inline-flex; align-items:center; gap:5px; background:none; border:none; cursor:pointer; color: var(--ink-500); font-size:12.5px; font-weight:600; padding: 2px 0 10px; }
    .hy-back:hover { color: var(--turf-800); }

    /* yard ruler signature element */
    .hy-ruler-wrap { width:100%; }
    .hy-ruler-caption { display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:10.5px; color: var(--ink-500); margin-top:4px; }

    .hy-card { background:#fff; border:1px solid var(--line); border-radius:11px; padding: 18px 20px; }
    .hy-card + .hy-card { margin-top:14px; }
    .hy-card-title { font-family:'Oswald',sans-serif; font-size:14.5px; font-weight:600; color: var(--turf-900); text-transform:uppercase; letter-spacing:0.05em; margin-bottom: 12px; display:flex; align-items:center; gap:8px;}

    .hy-grid { display:grid; gap:14px; }
    .hy-grid.cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .hy-grid.cols-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .hy-grid.cols-4 { grid-template-columns: repeat(4, minmax(0,1fr)); }
    @media (max-width: 900px){ .hy-grid.cols-3, .hy-grid.cols-4 { grid-template-columns: repeat(2,minmax(0,1fr)); } }

    .hy-tool-btn { display:flex; flex-direction:column; gap:10px; align-items:flex-start; text-align:left; background:#fff; border:1px solid var(--line); border-radius:12px; padding:16px 16px 14px; cursor:pointer; transition: border-color .12s ease, transform .12s ease, box-shadow .12s ease; }
    .hy-tool-btn:hover { border-color: var(--turf-600); box-shadow: 0 4px 14px rgba(23,58,46,0.08); transform: translateY(-1px); }
    .hy-tool-btn .ic { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; background: var(--turf-800); color: var(--chalk-50); }
    .hy-tool-btn.paid .ic { background: var(--gold-500); color: var(--turf-900); }
    .hy-tool-btn .t { font-family:'Oswald',sans-serif; font-size:15px; font-weight:600; color:var(--turf-900); }
    .hy-tool-btn .d { font-size:12px; color: var(--ink-500); line-height:1.45; }
    .hy-tool-btn .paidtag { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color: var(--gold-600); font-weight:700; }

    .hy-stat-tile { border:1px solid var(--line); border-radius:10px; padding: 12px 14px; background: var(--chalk-50); }
    .hy-stat-tile .l { font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color: var(--ink-500); font-weight:600; margin-bottom:5px; }
    .hy-stat-tile .v { font-family:'IBM Plex Mono',monospace; font-size:21px; font-weight:600; color: var(--turf-900); }
    .hy-stat-tile .v.small { font-size: 16px; }
    .hy-stat-tile .n { font-size: 10.5px; color: var(--ink-500); margin-top:4px; }

    .hy-btn { font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600; border-radius:8px; padding: 9px 16px; border:1px solid transparent; cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition: filter .1s ease, background .12s ease; }
    .hy-btn:active { filter: brightness(0.95); }
    .hy-btn.primary { background: var(--turf-800); color:#fff; }
    .hy-btn.primary:hover { background: var(--turf-900); }
    .hy-btn.gold { background: var(--gold-500); color: var(--turf-900); }
    .hy-btn.gold:hover { background: var(--gold-600); }
    .hy-btn.ghost { background:#fff; border-color: var(--line); color: var(--ink-700); }
    .hy-btn.ghost:hover { border-color: var(--turf-600); }
    .hy-btn.danger { background: var(--rust-050); color: var(--rust-500); }
    .hy-btn.danger:hover { background: #f0d4cb; }
    .hy-btn:disabled { opacity:0.45; cursor:not-allowed; }
    .hy-btn.block { width:100%; justify-content:center; }
    .hy-btn.sm { padding: 6px 11px; font-size:12px; }

    .hy-field { display:flex; flex-direction:column; gap:5px; }
    .hy-label { font-size:12px; font-weight:600; color: var(--ink-700); }
    .hy-hint { font-size: 11px; color: var(--ink-500); }
    .hy-input, .hy-select, textarea.hy-input {
      font-family:'Inter',sans-serif; font-size: 13.5px; padding: 9px 11px; border-radius:7px;
      border:1px solid var(--line); background:#fff; color: var(--ink-900); width:100%;
    }
    .hy-input:focus, .hy-select:focus, textarea.hy-input:focus { outline: 2px solid var(--turf-600); outline-offset:1px; border-color: var(--turf-600); }
    .hy-row { display:flex; gap:10px; }
    .hy-row > * { flex:1; min-width:0; }
    .hy-check { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ink-700); cursor:pointer; }

    .hy-toggle-side { display:flex; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    .hy-toggle-side button { flex:1; padding:10px 12px; border:none; background:#fff; font-family:'Oswald',sans-serif; font-weight:600; font-size:13px; cursor:pointer; color: var(--ink-700); }
    .hy-toggle-side button.on.us { background: var(--turf-800); color:#fff; }
    .hy-toggle-side button.on.opp { background: var(--rust-500); color:#fff; }
    .hy-toggle-side button + button { border-left:1px solid var(--line); }

    .hy-playtype-grid { display:grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap:10px; }
    @media (max-width:900px){ .hy-playtype-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
    .hy-playtype-btn { display:flex; flex-direction:column; align-items:center; gap:8px; padding: 16px 8px; border-radius:10px; border:1.5px dashed var(--line); background: var(--chalk-50); cursor:pointer; font-family:'Oswald',sans-serif; font-weight:600; color: var(--turf-800); font-size:13px; }
    .hy-playtype-btn:hover { border-color: var(--turf-600); border-style:solid; background:#fff; }
    .hy-playtype-btn .ic { width:34px; height:34px; border-radius:50%; background: var(--turf-800); color:#fff; display:flex; align-items:center; justify-content:center; }

    .hy-play-row { display:flex; align-items:center; gap:12px; padding: 10px 12px; border:1px solid var(--line); border-radius:9px; background:#fff; }
    .hy-play-row + .hy-play-row { margin-top:8px; }
    .hy-play-row .tag { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:3px 8px; border-radius:5px; background: var(--chalk-100); color: var(--turf-800); flex-shrink:0; }
    .hy-play-row .tag.us { background: var(--turf-800); color:#fff; }
    .hy-play-row .tag.opp { background: var(--rust-500); color:#fff; }
    .hy-play-row .desc { font-size:12.5px; color: var(--ink-700); flex:1; }
    .hy-play-row .desc b { color: var(--turf-900); }

    .hy-badge { display:inline-flex; align-items:center; gap:5px; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:4px 9px; border-radius:5px; }
    .hy-badge.win { background: var(--good-050); color: var(--good-600); }
    .hy-badge.loss { background: var(--rust-050); color: var(--rust-500); }
    .hy-badge.progress { background: var(--chalk-100); color: var(--ink-700); }

    .hy-table { width:100%; border-collapse: collapse; font-size: 13px; }
    .hy-table th { text-align:left; font-family:'Oswald',sans-serif; font-size:10.5px; text-transform:uppercase; letter-spacing:0.07em; color: var(--ink-500); padding: 8px 10px; border-bottom: 1.5px solid var(--turf-800); }
    .hy-table td { padding: 9px 10px; border-bottom: 1px solid var(--line); font-family:'IBM Plex Mono',monospace; }
    .hy-table td.label-cell { font-family:'Inter',sans-serif; font-weight:600; color: var(--ink-700); }
    .hy-table tr:last-child td { border-bottom:none; }

    .hy-empty { text-align:center; padding: 40px 20px; color: var(--ink-500); }
    .hy-empty .ic { width:46px; height:46px; border-radius:50%; background: var(--chalk-100); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color: var(--turf-700); }

    .hy-toast { position:fixed; bottom: 22px; left:50%; transform:translateX(-50%); background: var(--turf-900); color:#fff; padding: 11px 20px; border-radius:9px; font-size:13px; font-weight:600; box-shadow: 0 8px 24px rgba(0,0,0,0.22); z-index:50; display:flex; align-items:center; gap:8px; }

    .hy-auth-wrap { min-height: 640px; display:flex; align-items:center; justify-content:center; background: var(--turf-900); padding: 30px; }
    .hy-auth-card { width: 420px; max-width:100%; background: var(--chalk-50); border-radius:16px; padding: 30px 30px 26px; box-shadow: 0 24px 60px rgba(0,0,0,0.35); }
    .hy-auth-mark { width:46px; height:46px; border-radius:10px; background: linear-gradient(155deg, var(--gold-500), var(--gold-600)); display:flex; align-items:center; justify-content:center; color: var(--turf-900); font-weight:700; font-family:'Oswald',sans-serif; font-size:20px; margin-bottom:14px; }

    .hy-stopwatch { display:flex; align-items:center; gap:10px; border:1px solid var(--line); border-radius:8px; padding: 8px 10px; background: var(--chalk-50); }
    .hy-stopwatch .time { font-family:'IBM Plex Mono',monospace; font-size:18px; font-weight:600; color: var(--turf-900); min-width:64px; }
    .hy-stopwatch button { border:none; background: #fff; border:1px solid var(--line); border-radius:6px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; color: var(--turf-800); }
    .hy-stopwatch button:hover { border-color: var(--turf-600); }

    .hy-benchbar-track { height:8px; border-radius:5px; background: var(--chalk-100); position:relative; overflow:hidden; }
    .hy-benchbar-fill { height:100%; border-radius:5px; }

    .hy-resource-card { display:flex; gap:16px; border:1px solid var(--line); border-radius:12px; padding:18px; background:#fff; align-items:flex-start; }
    .hy-resource-card .ic { width:52px; height:52px; border-radius:10px; background: var(--turf-800); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .hy-resource-card h4 { font-family:'Oswald',sans-serif; font-size:16px; margin:0 0 4px; color: var(--turf-900); }
    .hy-resource-card p { font-size:12.5px; color: var(--ink-500); margin: 0 0 10px; line-height:1.5; }
    .hy-price { font-family:'IBM Plex Mono',monospace; font-weight:600; color: var(--turf-900); font-size:15px; margin-right:12px; }
  `}</style>
);

/* ------------------------------- helpers ------------------------------- */

let uidCounter = 1;
const uid = () => `id_${uidCounter++}_${Math.random().toString(36).slice(2, 7)}`;

// Unified 0-100 field scale where 0 = our own goal line, 100 = opponent's goal line.
const posFromSideYard = (side, yard) => {
  const y = Number(yard);
  if (Number.isNaN(y)) return null;
  return side === "our" ? y : 100 - y;
};

// Format a 0-100 position back into "Our 35" / "Their 22" / "Midfield" style label.
const formatPos = (pos) => {
  if (pos === null || pos === undefined || Number.isNaN(pos)) return "—";
  const r = Math.round(pos);
  if (r === 50) return "Midfield (50)";
  return r < 50 ? `Our ${r}` : `Their ${100 - r}`;
};

const avg = (arr) => {
  const vals = arr.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};
const sum = (arr) => arr.filter((v) => v !== null && v !== undefined && !Number.isNaN(v)).reduce((a, b) => a + b, 0);
const fmt1 = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : n.toFixed(1));
const fmt2 = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : n.toFixed(2));
const fmt0 = (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : Math.round(n).toString());
const pct = (made, att) => (att ? Math.round((made / att) * 100) : null);
const clampHangtime = (v) => {
  if (v === "") return v;
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n > 7 ? "7" : v;
};

const LEVELS = ["Youth", "High School", "College"];

/* --------------------------- per-play computed math --------------------------- */

function computeKickoff(p) {
  const kickedFromPos = posFromSideYard(p.kickedFromSide, p.kickedFromYard);
  const landedPos = posFromSideYard(p.landedSide, p.landedYard);
  const downedPos = posFromSideYard(p.downedSide, p.downedYard);
  const grossYards = kickedFromPos !== null && landedPos !== null ? Math.abs(landedPos - kickedFromPos) : null;
  const netYards = kickedFromPos !== null && downedPos !== null ? Math.abs(downedPos - kickedFromPos) : null;
  const returnYards = grossYards !== null && netYards !== null ? grossYards - netYards : null;
  return { kickedFromPos, landedPos, downedPos, grossYards, netYards, returnYards };
}
function computePunt(p) {
  const losPos = posFromSideYard(p.losSide, p.losYard);
  const landedPos = posFromSideYard(p.landedSide, p.landedYard);
  const downedPos = posFromSideYard(p.downedSide, p.downedYard);
  const grossYards = losPos !== null && landedPos !== null ? Math.abs(landedPos - losPos) : null;
  const netYards = losPos !== null && downedPos !== null ? Math.abs(downedPos - losPos) : null;
  const returnYards = grossYards !== null && netYards !== null ? grossYards - netYards : null;
  return { losPos, landedPos, downedPos, grossYards, netYards, returnYards };
}
function computeDrive(p) {
  const startPos = posFromSideYard(p.startSide, p.startYard);
  return { startPos };
}

/* Aggregate stats for one game (or a merged set of plays across a season) */
function computeGameStats(plays) {
  const kickoffs = plays.filter((p) => p.type === "kickoff").map((p) => ({ ...p, ...computeKickoff(p) }));
  const punts = plays.filter((p) => p.type === "punt").map((p) => ({ ...p, ...computePunt(p) }));
  const pats = plays.filter((p) => p.type === "pat");
  const fgs = plays.filter((p) => p.type === "fieldgoal");
  const drives = plays.filter((p) => p.type === "drive").map((p) => ({ ...p, ...computeDrive(p) }));

  const ourKO = kickoffs.filter((p) => p.side === "us");
  const oppKO = kickoffs.filter((p) => p.side === "opponent");
  const ourPunts = punts.filter((p) => p.side === "us");
  const oppPunts = punts.filter((p) => p.side === "opponent");

  // starting field position sources
  const usStarts = [];
  const oppStarts = [];
  kickoffs.concat(punts).forEach((p) => {
    const downed = p.downedPos;
    if (downed === null) return;
    if (p.side === "us") oppStarts.push(downed); // we kicked -> they start there
    else usStarts.push(downed); // they kicked -> we start there
  });
  drives.forEach((d) => {
    if (d.startPos === null) return;
    if (d.for === "our") usStarts.push(d.startPos);
    else oppStarts.push(d.startPos);
  });

  const ourAvgDist = avg(usStarts); // distance from our own goal
  const theirAvgDist = oppStarts.length ? 100 - avg(oppStarts) : null; // distance from their own goal
  const fieldPosDiff = ourAvgDist !== null && theirAvgDist !== null ? ourAvgDist - theirAvgDist : null;

  const ourPatMade = pats.filter((p) => p.side === "us" && p.converted === "yes").length;
  const ourPatAtt = pats.filter((p) => p.side === "us").length;
  const oppPatMade = pats.filter((p) => p.side === "opponent" && p.converted === "yes").length;
  const oppPatAtt = pats.filter((p) => p.side === "opponent").length;

  const ourFgMade = fgs.filter((p) => p.side === "us" && p.converted === "yes").length;
  const ourFgAtt = fgs.filter((p) => p.side === "us").length;
  const oppFgMade = fgs.filter((p) => p.side === "opponent" && p.converted === "yes").length;
  const oppFgAtt = fgs.filter((p) => p.side === "opponent").length;

  return {
    kickoffs, punts, pats, fgs, drives, ourKO, oppKO, ourPunts, oppPunts,
    ourAvgDist, theirAvgDist, fieldPosDiff,
    touchbacks: kickoffs.filter((p) => p.touchback).length,
    ourTouchbacks: ourKO.filter((p) => p.touchback).length,
    oppTouchbacks: oppKO.filter((p) => p.touchback).length,
    avgGrossKickoff: avg(ourKO.map((p) => p.grossYards)),
    avgNetKickoff: avg(ourKO.map((p) => p.netYards)),
    avgKickoffHangtime: avg(ourKO.map((p) => Number(p.hangtime)).filter((n) => !Number.isNaN(n))),
    avgKickoffReturnYards: avg(oppKO.map((p) => p.returnYards)),
    avgGrossPunt: avg(ourPunts.map((p) => p.grossYards)),
    avgNetPunt: avg(ourPunts.map((p) => p.netYards)),
    avgPuntHangtime: avg(ourPunts.map((p) => Number(p.hangtime)).filter((n) => !Number.isNaN(n))),
    avgGrossPuntAgainst: avg(oppPunts.map((p) => p.grossYards)),
    avgNetPuntAgainst: avg(oppPunts.map((p) => p.netYards)),
    avgPuntReturnYards: avg(oppPunts.map((p) => p.returnYards)),
    puntReturnUs: sum(oppPunts.map((p) => p.returnYards)),
    puntReturnOpp: sum(ourPunts.map((p) => p.returnYards)),
    koNetUs: sum(ourKO.map((p) => p.netYards)),
    koNetOpp: sum(oppKO.map((p) => p.netYards)),
    koReturnUs: sum(oppKO.map((p) => p.returnYards)),
    koReturnOpp: sum(ourKO.map((p) => p.returnYards)),
    puntNetUs: sum(ourPunts.map((p) => p.netYards)),
    puntNetOpp: sum(oppPunts.map((p) => p.netYards)),
    ourPatPct: pct(ourPatMade, ourPatAtt), oppPatPct: pct(oppPatMade, oppPatAtt),
    ourFgPct: pct(ourFgMade, ourFgAtt), oppFgPct: pct(oppFgMade, oppFgAtt),
    ourPatAtt, oppPatAtt, ourFgAtt, oppFgAtt,
    avgPatSnapToKick: avg(pats.filter((p) => p.side === "us").map((p) => Number(p.snapToKick)).filter((n) => !Number.isNaN(n))),
    avgFgSnapToKick: avg(fgs.filter((p) => p.side === "us").map((p) => Number(p.snapToKick)).filter((n) => !Number.isNaN(n))),
  };
}

/* ------------------------------- mock peer data (benchmarking) ------------------------------- */
// A single-user prototype has no shared backend yet, so peer figures below are
// illustrative sample data for each competitive Level, clearly labeled as such.
const PEER_SETS = {
  Youth: { schools: 14, avgNetPunt: 21.5, avgGrossKickoff: 34.0, fieldPosDiff: -1.5, patPct: 78, fgPct: 38, puntHangtime: 3.2, kickoffHangtime: 3.0 },
  "High School": { schools: 42, avgNetPunt: 29.5, avgGrossKickoff: 41.0, fieldPosDiff: 0.8, patPct: 90, fgPct: 58, puntHangtime: 3.9, kickoffHangtime: 3.6 },
  College: { schools: 21, avgNetPunt: 38.5, avgGrossKickoff: 55.0, fieldPosDiff: 2.1, patPct: 97, fgPct: 74, puntHangtime: 4.4, kickoffHangtime: 3.9 },
};

/* ------------------------------------ atoms ------------------------------------ */

function Btn({ variant = "ghost", className = "", ...props }) {
  return <button className={`hy-btn ${variant} ${className}`} {...props} />;
}

function Field({ label, hint, children }) {
  return (
    <div className="hy-field">
      <span className="hy-label">{label}</span>
      {children}
      {hint && <span className="hy-hint">{hint}</span>}
    </div>
  );
}

function SideYardInput({ sideValue, yardValue, onSideChange, onYardChange, sideLabels = ["our", "their"] }) {
  return (
    <div className="hy-row">
      <select className="hy-select" value={sideValue} onChange={(e) => onSideChange(e.target.value)}>
        <option value={sideLabels[0]}>Our</option>
        <option value={sideLabels[1]}>Their</option>
      </select>
      <input
        className="hy-input"
        type="number"
        min={1}
        max={49}
        placeholder="1–49"
        value={yardValue}
        onChange={(e) => onYardChange(e.target.value)}
      />
    </div>
  );
}

function UsOppToggle({ value, onChange }) {
  return (
    <div className="hy-toggle-side">
      <button type="button" className={value === "us" ? "on us" : ""} onClick={() => onChange("us")}>Us</button>
      <button type="button" className={value === "opponent" ? "on opp" : ""} onClick={() => onChange("opponent")}>Opponent</button>
    </div>
  );
}



function YardRuler({ marker, opponentMarker, height = 34 }) {
  // 0..100 scale drawn left(our goal)->right(their goal). Ticks every 10, labeled like real yard markers.
  const w = 640;
  const ticks = [0, 10, 20, 30, 40, 50, 40, 30, 20, 10, 0];
  return (
    <div className="hy-ruler-wrap">
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <rect x="0" y={height / 2 - 1.5} width={w} height="3" rx="1.5" fill="var(--chalk-200)" />
        {ticks.map((t, i) => {
          const x = (i / (ticks.length - 1)) * w;
          return (
            <line key={i} x1={x} y1={height / 2 - 8} x2={x} y2={height / 2 + 8} stroke="var(--ink-500)" strokeWidth="1.4" opacity="0.5" />
          );
        })}
        {marker !== null && marker !== undefined && (
          <g transform={`translate(${(marker / 100) * w},${height / 2})`}>
            <circle r="7" fill="var(--turf-700)" stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {opponentMarker !== null && opponentMarker !== undefined && (
          <g transform={`translate(${(opponentMarker / 100) * w},${height / 2})`}>
            <circle r="7" fill="var(--rust-500)" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      <div className="hy-ruler-caption">
        <span>OUR GOAL</span>
        <span>MIDFIELD</span>
        <span>THEIR GOAL</span>
      </div>
    </div>
  );
}

function StatTile({ label, value, note, small }) {
  return (
    <div className="hy-stat-tile">
      <div className="l">{label}</div>
      <div className={`v ${small ? "small" : ""}`}>{value}</div>
      {note && <div className="n">{note}</div>}
    </div>
  );
}

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="hy-toast">
      <CheckCircle2 size={16} />
      {text}
    </div>
  );
}

/* ------------------------------------ Sign up ------------------------------------ */

function AuthPage({ onAuthed, onToast }) {
  const [mode, setMode] = useState("signup"); // 'signup' | 'signin'
  const [schoolName, setSchoolName] = useState("");
  const [level, setLevel] = useState("High School");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const valid =
    email.trim().includes("@") &&
    password.length >= 6 &&
    (!isSignup || schoolName.trim());

  const submit = async () => {
    setTouched(true);
    setError("");
    if (!valid) return;
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              school_name: schoolName.trim(),
              level,
            },
          },
        });
        if (signUpError) throw signUpError;

        // The database trigger (handle_new_user) creates the profiles row
        // automatically from this metadata -- no client-side insert needed,
        // which also avoids RLS errors for unconfirmed users with no session yet.

        if (!data.session) {
          onToast?.("Check your email to confirm your account, then sign in.");
          setMode("signin");
          setBusy(false);
          return;
        }

        onAuthed({ schoolName: schoolName.trim(), level, email: email.trim() });
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;

        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profileFetchError) throw profileFetchError;

        onAuthed({
          schoolName: profile?.school_name || "",
          level: profile?.level || "High School",
          email: data.user.email,
        });
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hy-root">
      <GlobalStyle />
      <div className="hy-auth-wrap">
        <div className="hy-auth-card">
          <div className="hy-auth-mark">HY</div>
          <div className="hy-eyebrow">Special teams, quantified</div>
          <h1 className="hy-display" style={{ fontSize: 26, fontWeight: 600, color: "var(--turf-900)", margin: "4px 0 4px" }}>
            {isSignup ? "Create your Hidden Yards account" : "Sign in to Hidden Yards"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-500)", margin: "0 0 20px", lineHeight: 1.5 }}>
            Use your special teams to help improve field position, score more points, and win more games.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isSignup && (
              <>
                <Field label="School name">
                  <input className="hy-input" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Riverside High School" />
                </Field>
                <Field label="Level">
                  <select className="hy-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="Your email">
              <input className="hy-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@school.edu" />
            </Field>
            <Field label="Password" hint="At least 6 characters">
              <input className="hy-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            {touched && !valid && (
              <div style={{ fontSize: 12, color: "var(--rust-500)" }}>
                {isSignup ? "Add a school name, a valid email, and a 6+ character password." : "Add a valid email and password."}
              </div>
            )}
            {error && <div style={{ fontSize: 12, color: "var(--rust-500)" }}>{error}</div>}
            <Btn
              variant="primary"
              className="block"
              style={{ marginTop: 4, padding: "11px 16px" }}
              onClick={submit}
              disabled={busy}
            >
              {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </Btn>
            <button
              type="button"
              onClick={() => { setMode(isSignup ? "signin" : "signup"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--ink-500)", fontSize: 12.5, cursor: "pointer", padding: 4 }}
            >
              {isSignup ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------ Sidebar / Shell ------------------------------------ */

const NAV_FREE = [
  { key: "enter-game", label: "Enter New Game", icon: ClipboardPlus },
  { key: "game-analysis", label: "Game Analysis", icon: LineChart },
  { key: "season-analysis", label: "Season Analysis", icon: CalendarRange },
];
const NAV_PAID = [
  { key: "benchmarking", label: "Benchmarking", icon: Users },
  { key: "data-review", label: "Data Review", icon: FileSearch },
  { key: "kicker-coaching", label: "Kicker Fix Coaching", icon: Target },
  { key: "resources", label: "Resources", icon: BookOpenText },
];

function Sidebar({ user, page, onNav, onSignOut }) {
  return (
    <div className="hy-sidebar">
      <div className="hy-side-brand">
        <div className="mark">HY</div>
        <div>
          <div className="name">Hidden Yards</div>
        </div>
      </div>

      <button className={`hy-navitem ${page === "home" ? "active" : ""}`} onClick={() => onNav("home")}>
        <HomeIcon size={16} /> Home
      </button>

      <div className="hy-side-section-label">Free tools</div>
      {NAV_FREE.map((n) => (
        <button key={n.key} className={`hy-navitem ${page === n.key ? "active" : ""}`} onClick={() => onNav(n.key)}>
          <n.icon size={16} /> {n.label}
        </button>
      ))}

      <div className="hy-side-section-label">Paid tools</div>
      {NAV_PAID.map((n) => (
        <button key={n.key} className={`hy-navitem ${page === n.key ? "active" : ""}`} onClick={() => onNav(n.key)}>
          <n.icon size={16} /> {n.label} <LockIcon size={11} className="badge-lock" />
        </button>
      ))}

      <div className="hy-side-foot">
        <div className="hy-side-acct">
          <b>{user.schoolName}</b><br />
          {user.level} · {user.email}
        </div>
        <button className="hy-navitem" onClick={onSignOut}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------ Home ------------------------------------ */

function HomePage({ user, games, onNav }) {
  const finalized = games.filter((g) => g.finalized);
  const wins = finalized.filter((g) => g.outcome === "Win").length;
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">{user.level} · {user.schoolName}</div>
          <div className="hy-page-title">Welcome back, Coach</div>
          <div className="hy-page-sub">
            {finalized.length
              ? `${wins}-${finalized.length - wins} on the season across ${finalized.length} finalized game${finalized.length === 1 ? "" : "s"}. Keep logging every kick.`
              : "Log your first game to start seeing where the hidden yards are coming from."}
          </div>
        </div>
      </div>

      <div style={{ height: 6 }} />
      <div className="hy-card-title" style={{ marginBottom: 10 }}>Free tools</div>
      <div className="hy-grid cols-3">
        <ToolButton icon={ClipboardPlus} title="Enter New Game" desc="Log kickoffs, punts, PATs, field goals, and drives live as the game happens." onClick={() => onNav("enter-game")} />
        <ToolButton icon={LineChart} title="Game Analysis" desc="Field position, hangtime, and return numbers for any game you've logged." onClick={() => onNav("game-analysis")} />
        <ToolButton icon={CalendarRange} title="Season Analysis" desc="Every game rolled into one season-long special teams picture." onClick={() => onNav("season-analysis")} />
      </div>

      <div style={{ height: 26 }} />
      <div className="hy-card-title" style={{ marginBottom: 10 }}>Paid tools</div>
      <div className="hy-grid cols-4">
        <ToolButton paid icon={Users} title="Benchmarking" desc="See how your special teams stack up against your Level's peer set." onClick={() => onNav("benchmarking")} />
        <ToolButton paid icon={FileSearch} title="Data Review" desc="A Hidden Yards analyst reviews your season data with you." onClick={() => onNav("data-review")} />
        <ToolButton paid icon={Target} title="Kicker Fix Coaching" desc="1-on-1 kicking and punting consulting from film and stats." onClick={() => onNav("kicker-coaching")} />
        <ToolButton paid icon={BookOpenText} title="Resources" desc="Guides and the Hidden Yards book, built for special teams coaches." onClick={() => onNav("resources")} />
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, title, desc, onClick, paid }) {
  return (
    <button className={`hy-tool-btn ${paid ? "paid" : ""}`} onClick={onClick}>
      <div className="ic"><Icon size={17} /></div>
      <div className="t">{title}</div>
      <div className="d">{desc}</div>
    </button>
  );
}

/* ------------------------------------ Enter New Game ------------------------------------ */

function EnterGamePage({ game, setGame, onFinalizeGame, onNav, onToast }) {
  const [activePlayType, setActivePlayType] = useState(null); // 'kickoff'|'punt'|'pat'|'fieldgoal'|'drive'|null
  const [editingPlay, setEditingPlay] = useState(null); // the play object currently being edited, or null
  const [finalizing, setFinalizing] = useState(false);

  // no game started yet -> collect date & opponent
  if (!game) {
    return <NewGameSetup onStart={(date, opponent) => setGame({ id: uid(), date, opponent, plays: [], finalized: false })} />;
  }

  if (finalizing) {
    return (
      <FinalizeForm
        game={game}
        onCancel={() => setFinalizing(false)}
        onFinalize={(outcome, ourScore, oppScore) => {
          onFinalizeGame({ ...game, finalized: true, outcome, ourScore, oppScore });
          setFinalizing(false);
        }}
      />
    );
  }

  const startNewPlay = (type) => { setEditingPlay(null); setActivePlayType(type); };
  const startEditPlay = (play) => { setActivePlayType(null); setEditingPlay(play); };

  const addPlay = (play) => {
    setGame({ ...game, plays: [...game.plays, { ...play, id: uid() }] });
    setActivePlayType(null);
  };
  const saveEditedPlay = (play) => {
    setGame({ ...game, plays: game.plays.map((p) => (p.id === editingPlay.id ? { ...play, id: editingPlay.id } : p)) });
    setEditingPlay(null);
  };
  const removePlay = (id) => setGame({ ...game, plays: game.plays.filter((p) => p.id !== id) });

  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Live game entry</div>
          <div className="hy-page-title">vs {game.opponent}</div>
          <div className="hy-page-sub">{game.date} · {game.plays.length} play{game.plays.length === 1 ? "" : "s"} logged</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={() => onToast("Game saved.")}>Save game</Btn>
          <Btn variant="gold" onClick={() => setFinalizing(true)}>Finalize game</Btn>
        </div>
      </div>

      {editingPlay ? (
        <PlayForm
          type={editingPlay.type}
          initial={editingPlay}
          editing
          onCancel={() => setEditingPlay(null)}
          onSave={saveEditedPlay}
        />
      ) : activePlayType ? (
        <PlayForm
          type={activePlayType}
          onCancel={() => setActivePlayType(null)}
          onSave={addPlay}
        />
      ) : (
        <div className="hy-card">
          <div className="hy-card-title"><Flag size={15} /> Add a play</div>
          <div className="hy-playtype-grid">
            <PlayTypeButton icon={Flag} label="Kickoff" onClick={() => startNewPlay("kickoff")} />
            <PlayTypeButton icon={Flag} label="Punt" onClick={() => startNewPlay("punt")} />
            <PlayTypeButton icon={Flag} label="PAT" onClick={() => startNewPlay("pat")} />
            <PlayTypeButton icon={Flag} label="Field Goal" onClick={() => startNewPlay("fieldgoal")} />
            <PlayTypeButton icon={Flag} label="Drive" onClick={() => startNewPlay("drive")} />
          </div>
        </div>
      )}

      <div className="hy-card">
        <div className="hy-card-title">Plays logged this game</div>
        {game.plays.length === 0 ? (
          <div className="hy-empty">
            <div className="ic"><Flag size={20} /></div>
            No plays yet — add one above to get started.
          </div>
        ) : (
          [...game.plays].reverse().map((p) => (
            <PlayRow key={p.id} play={p} onEdit={() => startEditPlay(p)} onRemove={() => removePlay(p.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function PlayTypeButton({ icon: Icon, label, onClick }) {
  return (
    <button className="hy-playtype-btn" onClick={onClick}>
      <div className="ic"><Icon size={15} /></div>
      {label}
    </button>
  );
}

function NewGameSetup({ onStart }) {
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const valid = date && opponent.trim();
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Free tool</div>
          <div className="hy-page-title">Enter New Game</div>
          <div className="hy-page-sub">Start with the basics — you'll log plays live once the game is created.</div>
        </div>
      </div>
      <div className="hy-card" style={{ maxWidth: 420 }}>
        <div className="hy-grid cols-2" style={{ marginBottom: 14 }}>
          <Field label="Game date">
            <input className="hy-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Opponent">
            <input className="hy-input" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="e.g. Central High" />
          </Field>
        </div>
        <Btn variant="primary" className="block" disabled={!valid} onClick={() => onStart(date, opponent.trim())}>
          Start logging plays
        </Btn>
      </div>
    </div>
  );
}

function FinalizeForm({ game, onCancel, onFinalize }) {
  const [outcome, setOutcome] = useState("Win");
  const [ourScore, setOurScore] = useState("");
  const [oppScore, setOppScore] = useState("");
  const valid = ourScore !== "" && oppScore !== "";
  return (
    <div>
      <button className="hy-back" onClick={onCancel}><ChevronLeft size={14} /> Back to game</button>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Finalize game</div>
          <div className="hy-page-title">vs {game.opponent}</div>
          <div className="hy-page-sub">Locks in the outcome and score, plus every play you've entered. This can't be edited afterward.</div>
        </div>
      </div>
      <div className="hy-card" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Outcome">
            <select className="hy-select" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
              <option>Win</option>
              <option>Loss</option>
            </select>
          </Field>
          <div className="hy-row">
            <Field label="Our score">
              <input className="hy-input" type="number" min="0" value={ourScore} onChange={(e) => setOurScore(e.target.value)} />
            </Field>
            <Field label="Opponent score">
              <input className="hy-input" type="number" min="0" value={oppScore} onChange={(e) => setOppScore(e.target.value)} />
            </Field>
          </div>
          <Btn variant="gold" className="block" disabled={!valid} onClick={() => onFinalize(outcome, Number(ourScore), Number(oppScore))}>
            Finalize game
          </Btn>
        </div>
      </div>
    </div>
  );
}

function PlayRow({ play, onEdit, onRemove }) {
  const sideTag = play.type === "drive" ? play.for : play.side;
  const tagClass = sideTag === "us" || sideTag === "our" ? "us" : "opp";
  const tagLabel = sideTag === "us" || sideTag === "our" ? "US" : sideTag === "opponent" || sideTag === "their" ? "OPP" : "—";

  let desc = "";
  if (play.type === "kickoff") {
    const c = computeKickoff(play);
    desc = <>Kickoff from <b>{play.kickedFromSide === "our" ? "Our" : "Their"} {play.kickedFromYard}</b>, landed at <b>{formatPos(c.landedPos)}</b>, downed at <b>{formatPos(c.downedPos)}</b>{play.touchback ? " (touchback)" : ""} · gross {fmt1(c.grossYards)} / net {fmt1(c.netYards)} yds{play.hangtime ? ` · ${play.hangtime}s hang` : ""}</>;
  } else if (play.type === "punt") {
    const c = computePunt(play);
    desc = <>Punt from <b>{play.losSide === "our" ? "Our" : "Their"} {play.losYard}</b>, downed at <b>{formatPos(c.downedPos)}</b> · gross {fmt1(c.grossYards)} / net {fmt1(c.netYards)} yds{play.hangtime ? ` · ${play.hangtime}s hang` : ""}</>;
  } else if (play.type === "pat") {
    desc = <>PAT attempt — <b>{play.converted === "yes" ? "Good" : "No good"}</b>{play.snapToKick ? ` · snap-to-kick ${play.snapToKick}s` : ""}</>;
  } else if (play.type === "fieldgoal") {
    desc = <>Field goal, {play.distance} yds — <b>{play.converted === "yes" ? "Good" : "No good"}</b>{play.snapToKick ? ` · snap-to-kick ${play.snapToKick}s` : ""}</>;
  } else if (play.type === "drive") {
    desc = <>Drive start via <b>{play.startType}</b> at <b>{formatPos(computeDrive(play).startPos)}</b></>;
  }

  return (
    <div className="hy-play-row">
      <span className={`tag ${tagClass}`}>{tagLabel}</span>
      <span className="tag" style={{ background: "var(--chalk-100)", color: "var(--ink-700)" }}>{play.type}</span>
      <span className="desc">{desc}{play.notes ? <span style={{ color: "var(--ink-500)" }}> — “{play.notes}”</span> : null}</span>
      {onEdit && <Btn variant="ghost" className="sm" onClick={onEdit}>Edit</Btn>}
      <Btn variant="ghost" className="sm" onClick={onRemove}><Trash2 size={13} /></Btn>
    </div>
  );
}

/* ---- individual play forms ---- */

function PlayForm({ type, initial, editing, onCancel, onSave }) {
  const [side, setSide] = useState(initial?.side || "us");

  // kickoff
  const [koFromSide, setKoFromSide] = useState(initial?.kickedFromSide || "our");
  const [koFromYard, setKoFromYard] = useState(initial?.kickedFromYard || "");
  const [koLandedSide, setKoLandedSide] = useState(initial?.landedSide || "their");
  const [koLandedYard, setKoLandedYard] = useState(initial?.landedYard || "");
  const [koDownedSide, setKoDownedSide] = useState(initial?.downedSide || "their");
  const [koDownedYard, setKoDownedYard] = useState(initial?.downedYard || "");
  const [koHang, setKoHang] = useState(initial?.hangtime || "");
  const [koTouchback, setKoTouchback] = useState(initial?.touchback || false);
  const [koNotes, setKoNotes] = useState(initial?.notes || "");

  // punt
  const [pLosSide, setPLosSide] = useState(initial?.losSide || "our");
  const [pLosYard, setPLosYard] = useState(initial?.losYard || "");
  const [pLandedSide, setPLandedSide] = useState(initial?.landedSide || "their");
  const [pLandedYard, setPLandedYard] = useState(initial?.landedYard || "");
  const [pDownedSide, setPDownedSide] = useState(initial?.downedSide || "their");
  const [pDownedYard, setPDownedYard] = useState(initial?.downedYard || "");
  const [pHang, setPHang] = useState(initial?.hangtime || "");
  const [pNotes, setPNotes] = useState(initial?.notes || "");

  // pat / fg
  const [converted, setConverted] = useState(initial?.converted || "yes");
  const [snapToKick, setSnapToKick] = useState(initial?.snapToKick || "");
  const [fgDistance, setFgDistance] = useState(initial?.distance || "");

  // drive
  const [driveFor, setDriveFor] = useState(initial?.for || "our");
  const [driveStartType, setDriveStartType] = useState(initial?.startType || "Turnover");
  const [driveStartSide, setDriveStartSide] = useState(initial?.startSide || "our");
  const [driveStartYard, setDriveStartYard] = useState(initial?.startYard || "");

  useEffect(() => {
    if (type === "kickoff" && koTouchback) {
      if (side === "us") { setKoDownedSide("their"); setKoDownedYard("20"); setKoLandedSide("their"); setKoLandedYard("1"); }
      else { setKoDownedSide("our"); setKoDownedYard("20"); setKoLandedSide("our"); setKoLandedYard("1"); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [koTouchback, side]);

  const titles = editing
    ? { kickoff: "Edit kickoff", punt: "Edit punt", pat: "Edit PAT", fieldgoal: "Edit field goal", drive: "Edit drive" }
    : { kickoff: "New kickoff", punt: "New punt", pat: "New PAT", fieldgoal: "New field goal", drive: "New drive" };

  const save = () => {
    if (type === "kickoff") {
      onSave({ type, side, kickedFromSide: koFromSide, kickedFromYard: koFromYard, landedSide: koLandedSide, landedYard: koLandedYard, downedSide: koDownedSide, downedYard: koDownedYard, hangtime: koHang, touchback: koTouchback, notes: koNotes.slice(0, 150) });
    } else if (type === "punt") {
      onSave({ type, side, losSide: pLosSide, losYard: pLosYard, landedSide: pLandedSide, landedYard: pLandedYard, downedSide: pDownedSide, downedYard: pDownedYard, hangtime: pHang, notes: pNotes.slice(0, 150) });
    } else if (type === "pat") {
      onSave({ type, side, converted, snapToKick });
    } else if (type === "fieldgoal") {
      onSave({ type, side, distance: fgDistance, converted, snapToKick });
    } else if (type === "drive") {
      onSave({ type, for: driveFor, startType: driveStartType, startSide: driveStartSide, startYard: driveStartYard });
    }
  };

  let ready = false;
  if (type === "kickoff") ready = koFromYard && koLandedYard && koDownedYard;
  else if (type === "punt") ready = pLosYard && pLandedYard && pDownedYard;
  else if (type === "pat") ready = true;
  else if (type === "fieldgoal") ready = fgDistance;
  else if (type === "drive") ready = driveStartYard;

  return (
    <div className="hy-card">
      <button className="hy-back" onClick={onCancel}><ChevronLeft size={14} /> {editing ? "Cancel" : "Choose a different play"}</button>
      <div className="hy-card-title">{titles[type]}</div>

      {type !== "drive" && (
        <div style={{ marginBottom: 16, maxWidth: 320 }}>
          <Field label="Who's kicking?">
            <UsOppToggle value={side} onChange={setSide} />
          </Field>
        </div>
      )}

      {type === "kickoff" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
          <Field label="Kicked from"><SideYardInput sideValue={koFromSide} yardValue={koFromYard} onSideChange={setKoFromSide} onYardChange={setKoFromYard} /></Field>
          <Field label="Landed at"><SideYardInput sideValue={koLandedSide} yardValue={koLandedYard} onSideChange={setKoLandedSide} onYardChange={setKoLandedYard} /></Field>
          <label className="hy-check">
            <input type="checkbox" checked={koTouchback} onChange={(e) => setKoTouchback(e.target.checked)} />
            Touchback (auto-sets Landed At to the 1 and Downed At to the 20)
          </label>
          <Field label="Downed at"><SideYardInput sideValue={koDownedSide} yardValue={koDownedYard} onSideChange={setKoDownedSide} onYardChange={setKoDownedYard} /></Field>
          <Field label="Hangtime (seconds)" hint="Max 7 seconds">
            <input className="hy-input" type="number" step="0.1" min="0" max="7" value={koHang} onChange={(e) => setKoHang(clampHangtime(e.target.value))} placeholder="e.g. 3.8" />
          </Field>
          <Field label="Notes" hint={`${koNotes.length}/150`}>
            <textarea className="hy-input" rows={2} maxLength={150} value={koNotes} onChange={(e) => setKoNotes(e.target.value)} />
          </Field>
        </div>
      )}

      {type === "punt" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
          <Field label="Line of scrimmage"><SideYardInput sideValue={pLosSide} yardValue={pLosYard} onSideChange={setPLosSide} onYardChange={setPLosYard} /></Field>
          <Field label="Landed at"><SideYardInput sideValue={pLandedSide} yardValue={pLandedYard} onSideChange={setPLandedSide} onYardChange={setPLandedYard} /></Field>
          <Field label="Downed at"><SideYardInput sideValue={pDownedSide} yardValue={pDownedYard} onSideChange={setPDownedSide} onYardChange={setPDownedYard} /></Field>
          <Field label="Hangtime (seconds)" hint="Max 7 seconds">
            <input className="hy-input" type="number" step="0.1" min="0" max="7" value={pHang} onChange={(e) => setPHang(clampHangtime(e.target.value))} placeholder="e.g. 4.1" />
          </Field>
          <Field label="Notes" hint={`${pNotes.length}/150`}>
            <textarea className="hy-input" rows={2} maxLength={150} value={pNotes} onChange={(e) => setPNotes(e.target.value)} />
          </Field>
        </div>
      )}

      {type === "pat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380 }}>
          <Field label="Was this PAT converted?">
            <select className="hy-select" value={converted} onChange={(e) => setConverted(e.target.value)}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Snap-to-kick time (seconds)">
            <input className="hy-input" type="number" step="0.1" value={snapToKick} onChange={(e) => setSnapToKick(e.target.value)} placeholder="e.g. 1.3" />
          </Field>
        </div>
      )}

      {type === "fieldgoal" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380 }}>
          <Field label="Distance (yards)">
            <input className="hy-input" type="number" min={1} max={49} value={fgDistance} onChange={(e) => setFgDistance(e.target.value)} placeholder="1–49" />
          </Field>
          <Field label="Was this field goal converted?">
            <select className="hy-select" value={converted} onChange={(e) => setConverted(e.target.value)}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field label="Snap-to-kick time (seconds)">
            <input className="hy-input" type="number" step="0.1" value={snapToKick} onChange={(e) => setSnapToKick(e.target.value)} placeholder="e.g. 1.3" />
          </Field>
        </div>
      )}

      {type === "drive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
          <Field label="Who is this drive for?">
            <select className="hy-select" value={driveFor} onChange={(e) => setDriveFor(e.target.value)}>
              <option value="our">Our</option>
              <option value="their">Their</option>
            </select>
          </Field>
          <Field label="How did the drive start?">
            <select className="hy-select" value={driveStartType} onChange={(e) => setDriveStartType(e.target.value)}>
              <option>Turnover</option>
              <option>Turnover on Downs</option>
              <option>Blocked Punt</option>
              <option>Safety</option>
            </select>
          </Field>
          <Field label="Starting field position"><SideYardInput sideValue={driveStartSide} yardValue={driveStartYard} onSideChange={setDriveStartSide} onYardChange={setDriveStartYard} /></Field>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Btn variant="primary" disabled={!ready} onClick={save}>{editing ? "Save changes" : "Save"}</Btn>
      </div>
    </div>
  );
}

/* ------------------------------------ Game Analysis ------------------------------------ */

function GameAnalysisListPage({ games, onOpen }) {
  if (!games.length) {
    return (
      <EmptyState
        title="Game Analysis"
        message="You haven't logged a game yet. Head to Enter New Game to log your first kickoff, punt, PAT, or field goal."
      />
    );
  }
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Free tool</div>
          <div className="hy-page-title">Game Analysis</div>
          <div className="hy-page-sub">Pick a game to see field position, hangtime, and return numbers.</div>
        </div>
      </div>
      <div className="hy-card">
        {games.map((g) => (
          <div key={g.id} className="hy-play-row" style={{ cursor: "pointer" }} onClick={() => onOpen(g.id)}>
            <span className={`hy-badge ${g.finalized ? (g.outcome === "Win" ? "win" : "loss") : "progress"}`}>
              {g.finalized ? g.outcome : "In progress"}
            </span>
            <span className="desc"><b>vs {g.opponent}</b> — {g.date} {g.finalized ? `· ${g.ourScore}-${g.oppScore}` : `· ${g.plays.length} plays logged`}</span>
            <Btn variant="ghost" className="sm">View</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Free tool</div>
          <div className="hy-page-title">{title}</div>
        </div>
      </div>
      <div className="hy-card">
        <div className="hy-empty">
          <div className="ic"><Flag size={20} /></div>
          {message}
        </div>
      </div>
    </div>
  );
}

function GameAnalysisDetailPage({ game, onBack, onBreakdown }) {
  const s = computeGameStats(game.plays);
  return (
    <div>
      <button className="hy-back" onClick={onBack}><ChevronLeft size={14} /> All games</button>
      <div className="hy-page-head">
        <div>
          <span className={`hy-badge ${game.finalized ? (game.outcome === "Win" ? "win" : "loss") : "progress"}`}>{game.finalized ? game.outcome : "In progress"}</span>
          <div className="hy-page-title" style={{ marginTop: 8 }}>vs {game.opponent}</div>
          <div className="hy-page-sub">{game.date}{game.finalized ? ` · Final score ${game.ourScore}-${game.oppScore}` : ""}</div>
        </div>
        <Btn variant="gold" onClick={onBreakdown}>Game breakdown</Btn>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Game highlights</div>
        <div className="hy-grid cols-4">
          <StatTile label="Opponent" value={game.opponent} small />
          <StatTile label="Outcome" value={game.finalized ? game.outcome : "TBD"} small />
          <StatTile label="Points scored" value={game.finalized ? game.ourScore : "—"} />
          <StatTile label="Opponent points" value={game.finalized ? game.oppScore : "—"} />
        </div>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Field position</div>
        <div className="hy-grid cols-3">
          <StatTile label="Us — avg. starting position" value={formatPos(s.ourAvgDist)} />
          <StatTile label="Opponent — avg. starting position" value={s.theirAvgDist === null ? "—" : `Their ${fmt0(s.theirAvgDist)}`} />
          <StatTile
            label="Difference"
            value={s.fieldPosDiff === null ? "—" : `${s.fieldPosDiff > 0 ? "+" : ""}${fmt1(s.fieldPosDiff)} yds`}
            note={s.fieldPosDiff === null ? "" : s.fieldPosDiff >= 0 ? "In our favor" : "In their favor"}
          />
        </div>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Our performance</div>
        <div className="hy-grid cols-4">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. gross kickoff yards" value={fmt1(s.avgGrossKickoff)} />
            <StatTile label="Avg. net kickoff yards" value={fmt1(s.avgNetKickoff)} />
            <StatTile label="Average kickoff hangtime" value={s.avgKickoffHangtime === null ? "—" : `${fmt1(s.avgKickoffHangtime)}s`} />
            <StatTile label="Touchbacks" value={`${s.ourTouchbacks} of ${s.ourKO.length}`} note={s.ourKO.length ? `${pct(s.ourTouchbacks, s.ourKO.length)}% of our kickoffs` : "No kickoffs logged yet"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. gross punt yards" value={fmt1(s.avgGrossPunt)} />
            <StatTile label="Avg. net punt yards" value={fmt1(s.avgNetPunt)} />
            <StatTile label="Avg. punt hangtime" value={s.avgPuntHangtime === null ? "—" : `${fmt1(s.avgPuntHangtime)}s`} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. punt return yards" value={fmt1(s.avgPuntReturnYards)} />
            <StatTile label="Avg. kickoff return yards" value={fmt1(s.avgKickoffReturnYards)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="PAT %" value={s.ourPatPct === null ? "—" : `${s.ourPatPct}%`} note={`${s.ourPatAtt} attempts`} />
            <StatTile label="Field goal %" value={s.ourFgPct === null ? "—" : `${s.ourFgPct}%`} note={`${s.ourFgAtt} attempts`} />
            <StatTile label="PAT avg. snap-to-kick" value={s.avgPatSnapToKick === null ? "—" : `${fmt2(s.avgPatSnapToKick)}s`} />
            <StatTile label="Field goal avg. snap-to-kick" value={s.avgFgSnapToKick === null ? "—" : `${fmt2(s.avgFgSnapToKick)}s`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GameBreakdownPage({ game, onBack }) {
  const s = computeGameStats(game.plays);
  const rows = [
    { label: "Kickoffs (net yards)", us: s.koNetUs, opp: s.koNetOpp },
    { label: "Kickoff returns (yards)", us: s.koReturnUs, opp: s.koReturnOpp },
    { label: "Punts (net yards)", us: s.puntNetUs, opp: s.puntNetOpp },
    { label: "Punt returns (yards)", us: s.puntReturnUs, opp: s.puntReturnOpp },
  ];
  const totalUs = sum(rows.map((r) => r.us));
  const totalOpp = sum(rows.map((r) => r.opp));
  return (
    <div>
      <button className="hy-back" onClick={onBack}><ChevronLeft size={14} /> Back to game analysis</button>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Game breakdown</div>
          <div className="hy-page-title">vs {game.opponent}</div>
          <div className="hy-page-sub">Every play logged, plus a head-to-head on net special teams yardage.</div>
        </div>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Head-to-head — net yards</div>
        <table className="hy-table">
          <thead><tr><th>Category</th><th>Us</th><th>Opponent</th><th>Edge</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="label-cell">{r.label}</td>
                <td>{fmt1(r.us)}</td>
                <td>{fmt1(r.opp)}</td>
                <td style={{ color: r.us === r.opp ? "var(--ink-500)" : r.us > r.opp ? "var(--good-600)" : "var(--rust-500)" }}>
                  {r.us === r.opp ? "Even" : r.us > r.opp ? `Us +${fmt1(r.us - r.opp)}` : `Opp +${fmt1(r.opp - r.us)}`}
                </td>
              </tr>
            ))}
            <tr style={{ background: "var(--chalk-100)" }}>
              <td className="label-cell" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.03em" }}>Total</td>
              <td style={{ fontWeight: 700 }}>{fmt1(totalUs)}</td>
              <td style={{ fontWeight: 700 }}>{fmt1(totalOpp)}</td>
              <td style={{ fontWeight: 700, color: totalUs === totalOpp ? "var(--ink-500)" : totalUs > totalOpp ? "var(--good-600)" : "var(--rust-500)" }}>
                {totalUs === totalOpp ? "Tied" : `Winner: ${totalUs > totalOpp ? "Us" : "Opponent"}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">All plays ({game.plays.length})</div>
        {game.plays.length === 0 ? (
          <div className="hy-empty"><div className="ic"><Flag size={20} /></div>No plays logged for this game.</div>
        ) : (
          [
            { label: "Us — Kickoff", plays: s.ourKO },
            { label: "Opponent — Kickoff", plays: s.oppKO },
            { label: "Us — Punt", plays: s.ourPunts },
            { label: "Opponent — Punt", plays: s.oppPunts },
            { label: "Us — Kickoff Return", plays: s.oppKO, note: "Same plays as Opponent — Kickoff, shown from our return" },
            { label: "Opponent — Kickoff Return", plays: s.ourKO, note: "Same plays as Us — Kickoff, shown from their return" },
            { label: "Us — Punt Return", plays: s.oppPunts, note: "Same plays as Opponent — Punt, shown from our return" },
            { label: "Opponent — Punt Return", plays: s.ourPunts, note: "Same plays as Us — Punt, shown from their return" },
            { label: "Us — PAT", plays: s.pats.filter((p) => p.side === "us") },
            { label: "Opponent — PAT", plays: s.pats.filter((p) => p.side === "opponent") },
            { label: "Us — Field Goal", plays: s.fgs.filter((p) => p.side === "us") },
            { label: "Opponent — Field Goal", plays: s.fgs.filter((p) => p.side === "opponent") },
            { label: "Us — Drive", plays: s.drives.filter((p) => p.for === "our") },
            { label: "Opponent — Drive", plays: s.drives.filter((p) => p.for === "their") },
          ].map((group) =>
            group.plays.length === 0 ? null : (
              <div key={group.label} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--turf-800)", marginBottom: 6 }}>
                  {group.label} <span style={{ color: "var(--ink-500)", fontWeight: 500 }}>({group.plays.length})</span>
                </div>
                {group.note && <div style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 6 }}>{group.note}</div>}
                {group.plays.map((p) => <PlayRow key={`${group.label}-${p.id}`} play={p} onRemove={() => {}} />)}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

/* ------------------------------------ Season Analysis ------------------------------------ */

function SeasonAnalysisPage({ games }) {
  const finalized = games.filter((g) => g.finalized);
  if (!finalized.length) {
    return <EmptyState title="Season Analysis" message="Finalize at least one game to see your season-long special teams numbers." />;
  }
  const allPlays = finalized.flatMap((g) => g.plays);
  const s = computeGameStats(allPlays);
  const wins = finalized.filter((g) => g.outcome === "Win").length;
  const pointsFor = sum(finalized.map((g) => g.ourScore));
  const pointsAgainst = sum(finalized.map((g) => g.oppScore));
  const h2hRows = [
    { label: "Kickoffs (net yards)", us: s.koNetUs, opp: s.koNetOpp },
    { label: "Kickoff returns (yards)", us: s.koReturnUs, opp: s.koReturnOpp },
    { label: "Punts (net yards)", us: s.puntNetUs, opp: s.puntNetOpp },
    { label: "Punt returns (yards)", us: s.puntReturnUs, opp: s.puntReturnOpp },
  ];
  const h2hTotalUs = sum(h2hRows.map((r) => r.us));
  const h2hTotalOpp = sum(h2hRows.map((r) => r.opp));

  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Free tool</div>
          <div className="hy-page-title">Season Analysis</div>
          <div className="hy-page-sub">Your Summarized Performance For The Season</div>
        </div>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Record</div>
        <div className="hy-grid cols-4">
          <StatTile label="Record" value={`${wins}-${finalized.length - wins}`} />
          <StatTile label="Points for" value={pointsFor} />
          <StatTile label="Points against" value={pointsAgainst} />
          <StatTile label="Field position diff" value={s.fieldPosDiff === null ? "—" : `${s.fieldPosDiff > 0 ? "+" : ""}${fmt1(s.fieldPosDiff)}`} />
        </div>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Head-to-head — net yards (season)</div>
        <table className="hy-table">
          <thead><tr><th>Category</th><th>Us</th><th>Opponent</th><th>Edge</th></tr></thead>
          <tbody>
            {h2hRows.map((r) => (
              <tr key={r.label}>
                <td className="label-cell">{r.label}</td>
                <td>{fmt1(r.us)}</td>
                <td>{fmt1(r.opp)}</td>
                <td style={{ color: r.us === r.opp ? "var(--ink-500)" : r.us > r.opp ? "var(--good-600)" : "var(--rust-500)" }}>
                  {r.us === r.opp ? "Even" : r.us > r.opp ? `Us +${fmt1(r.us - r.opp)}` : `Opp +${fmt1(r.opp - r.us)}`}
                </td>
              </tr>
            ))}
            <tr style={{ background: "var(--chalk-100)" }}>
              <td className="label-cell" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.03em" }}>Total</td>
              <td style={{ fontWeight: 700 }}>{fmt1(h2hTotalUs)}</td>
              <td style={{ fontWeight: 700 }}>{fmt1(h2hTotalOpp)}</td>
              <td style={{ fontWeight: 700, color: h2hTotalUs === h2hTotalOpp ? "var(--ink-500)" : h2hTotalUs > h2hTotalOpp ? "var(--good-600)" : "var(--rust-500)" }}>
                {h2hTotalUs === h2hTotalOpp ? "Tied" : `Winner: ${h2hTotalUs > h2hTotalOpp ? "Us" : "Opponent"}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="hy-card">
        <div className="hy-card-title">Season data points</div>
        <div className="hy-grid cols-4">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. gross kickoff yards" value={fmt1(s.avgGrossKickoff)} />
            <StatTile label="Avg. net kickoff yards" value={fmt1(s.avgNetKickoff)} />
            <StatTile label="Average kickoff hangtime" value={s.avgKickoffHangtime === null ? "—" : `${fmt1(s.avgKickoffHangtime)}s`} />
            <StatTile label="Touchbacks" value={`${s.ourTouchbacks} of ${s.ourKO.length}`} note={s.ourKO.length ? `${pct(s.ourTouchbacks, s.ourKO.length)}% of our kickoffs` : "No kickoffs logged yet"} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. gross punt yards" value={fmt1(s.avgGrossPunt)} />
            <StatTile label="Avg. net punt yards" value={fmt1(s.avgNetPunt)} />
            <StatTile label="Avg. punt hangtime" value={s.avgPuntHangtime === null ? "—" : `${fmt1(s.avgPuntHangtime)}s`} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="Avg. punt return yards" value={fmt1(s.avgPuntReturnYards)} />
            <StatTile label="Avg. kickoff return yards" value={fmt1(s.avgKickoffReturnYards)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StatTile label="PAT %" value={s.ourPatPct === null ? "—" : `${s.ourPatPct}%`} note={`${s.ourPatAtt} attempts`} />
            <StatTile label="Field goal %" value={s.ourFgPct === null ? "—" : `${s.ourFgPct}%`} note={`${s.ourFgAtt} attempts`} />
            <StatTile label="PAT avg. snap-to-kick" value={s.avgPatSnapToKick === null ? "—" : `${fmt2(s.avgPatSnapToKick)}s`} />
            <StatTile label="Field goal avg. snap-to-kick" value={s.avgFgSnapToKick === null ? "—" : `${fmt2(s.avgFgSnapToKick)}s`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------ Benchmarking (paid) ------------------------------------ */

function BenchRow({ label, mine, peer, higherIsBetter = true, suffix = "" }) {
  if (mine === null || mine === undefined) mine = 0;
  const max = Math.max(Math.abs(mine), Math.abs(peer), 1) * 1.15;
  const ahead = higherIsBetter ? mine >= peer : mine <= peer;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
        <span style={{ fontWeight: 600, color: "var(--ink-700)" }}>{label}</span>
        <span className="hy-mono">
          <b style={{ color: "var(--turf-800)" }}>{fmt1(mine)}{suffix}</b>
          <span style={{ color: "var(--ink-500)" }}> vs peer {fmt1(peer)}{suffix}</span>
        </span>
      </div>
      <div className="hy-benchbar-track">
        <div className="hy-benchbar-fill" style={{ width: `${Math.min(100, (Math.abs(mine) / max) * 100)}%`, background: ahead ? "var(--good-600)" : "var(--rust-500)" }} />
      </div>
    </div>
  );
}

function BenchmarkingPage({ user, games }) {
  const finalized = games.filter((g) => g.finalized);
  const peer = PEER_SETS[user.level];
  if (!finalized.length) {
    return <EmptyState title="Benchmarking" message="Finalize at least one game so we have your Season Analysis numbers to compare against your peer set." />;
  }
  const allPlays = finalized.flatMap((g) => g.plays);
  const s = computeGameStats(allPlays);

  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Paid tool</div>
          <div className="hy-page-title">Benchmarking</div>
          <div className="hy-page-sub">Your season vs. the {user.level} peer set ({peer.schools} schools, sample data for this preview).</div>
        </div>
      </div>
      <div className="hy-card">
        <div className="hy-card-title">My school vs. peer set</div>
        <BenchRow label="Field position differential" mine={s.fieldPosDiff} peer={peer.fieldPosDiff} suffix=" yds" />
        <BenchRow label="Avg. net punt" mine={s.avgNetPunt} peer={peer.avgNetPunt} suffix=" yds" />
        <BenchRow label="Avg. gross kickoff" mine={s.avgGrossKickoff} peer={peer.avgGrossKickoff} suffix=" yds" />
        <BenchRow label="Punt hangtime" mine={s.avgPuntHangtime} peer={peer.puntHangtime} suffix="s" />
        <BenchRow label="Kickoff hangtime" mine={s.avgKickoffHangtime} peer={peer.kickoffHangtime} suffix="s" />
        <BenchRow label="PAT conversion" mine={s.ourPatPct} peer={peer.patPct} suffix="%" />
        <BenchRow label="FG conversion" mine={s.ourFgPct} peer={peer.fgPct} suffix="%" />
      </div>
      <div className="hy-card">
        <table className="hy-table">
          <thead><tr><th>Metric</th><th>My school</th><th>Peer set ({user.level})</th></tr></thead>
          <tbody>
            <tr><td className="label-cell">Field position differential</td><td>{fmt1(s.fieldPosDiff)}</td><td>{fmt1(peer.fieldPosDiff)}</td></tr>
            <tr><td className="label-cell">Avg. net punt</td><td>{fmt1(s.avgNetPunt)}</td><td>{fmt1(peer.avgNetPunt)}</td></tr>
            <tr><td className="label-cell">Avg. gross kickoff</td><td>{fmt1(s.avgGrossKickoff)}</td><td>{fmt1(peer.avgGrossKickoff)}</td></tr>
            <tr><td className="label-cell">PAT %</td><td>{s.ourPatPct ?? "—"}</td><td>{peer.patPct}</td></tr>
            <tr><td className="label-cell">FG %</td><td>{s.ourFgPct ?? "—"}</td><td>{peer.fgPct}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------ Data Review / Kicker Coaching / Resources ------------------------------------ */

function DataReviewPage() {
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Paid tool</div>
          <div className="hy-page-title">Data Review</div>
          <div className="hy-page-sub">A Hidden Yards analyst sits down with your season data and helps you turn it into a practice plan.</div>
        </div>
      </div>
      <div className="hy-card">
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-700)", margin: "0 0 16px" }}>
          Send us a season, and we'll walk your staff through where you're winning and losing hidden yards —
          punt coverage lanes, kickoff hangtime trends, and where your starting field position is being decided.
          You'll get a recorded session plus a written summary your staff can revisit all season.
        </p>
        <Btn variant="gold">Request a data review</Btn>
      </div>
    </div>
  );
}

function KickerCoachingPage() {
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Paid tool</div>
          <div className="hy-page-title">Kicker Fix Coaching</div>
        </div>
      </div>
      <div className="hy-card">
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-700)", margin: 0 }}>
          At Hidden Yards, we offer kicking and punting consulting for kickers of all ages and skill levels.
          We can review your game film, practice film, and statistics to help you find and fix the small
          mechanical and mental issues that show up as missed field goals, short hangtime, or inconsistent
          snap-to-kick times — and turn them into a focused plan you can work on between games.
        </p>
        <div style={{ marginTop: 18 }}>
          <Btn variant="gold">Book a consulting session</Btn>
        </div>
      </div>
    </div>
  );
}

function ResourcesPage({ onToast }) {
  return (
    <div>
      <div className="hy-page-head">
        <div>
          <div className="hy-eyebrow">Paid tool</div>
          <div className="hy-page-title">Resources</div>
          <div className="hy-page-sub">Guides and reading built specifically for special teams coaches.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="hy-resource-card">
          <div className="ic"><Target size={22} /></div>
          <div style={{ flex: 1 }}>
            <h4>101 Tips for Kickers</h4>
            <p>A field-tested collection of mechanics, mindset, and game-day routines for kickers and punters at every level.</p>
            <span className="hy-price">$19</span>
            <Btn variant="primary" className="sm" onClick={() => onToast("Added to cart — checkout would happen here.")}>Buy now</Btn>
          </div>
        </div>
        <div className="hy-resource-card">
          <div className="ic"><BookOpenText size={22} /></div>
          <div style={{ flex: 1 }}>
            <h4>The Hidden Yards Book</h4>
            <p>The philosophy behind Hidden Yards: why field position wins games, and how to coach special teams like it matters.</p>
            <span className="hy-price">$29</span>
            <Btn variant="primary" className="sm" onClick={() => onToast("Added to cart — checkout would happen here.")}>Buy now</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------ App shell ------------------------------------ */

function HiddenYardsApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [games, setGames] = useState([]); // includes in-progress + finalized
  const [activeGameId, setActiveGameId] = useState(null);
  const [viewGameId, setViewGameId] = useState(null);
  const [breakdownGameId, setBreakdownGameId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (t) => setToast(t);

  // Load a user's profile + games from Supabase.
  const loadUserData = async (authUser) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    const { data: gameRows, error: gamesError } = await supabase
      .from("games")
      .select("payload")
      .eq("user_id", authUser.id)
      .order("updated_at", { ascending: true });

    if (gamesError) console.error("Failed to load games:", gamesError.message);

    setUser({
      id: authUser.id,
      schoolName: profile?.school_name || "",
      level: profile?.level || "High School",
      email: authUser.email,
    });
    setGames((gameRows || []).map((r) => r.payload));
  };

  // On mount, restore an existing session if there is one.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        loadUserData(session.user).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setGames([]);
        setActiveGameId(null);
        setPage("home");
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Persist a game (insert or update) to Supabase whenever it changes.
  const persistGame = async (game) => {
    if (!user?.id) return;
    const { error } = await supabase.from("games").upsert({
      id: game.id,
      user_id: user.id,
      finalized: !!game.finalized,
      payload: game,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("Failed to save game:", error.message);
  };

  const activeGame = games.find((g) => g.id === activeGameId) || null;
  const setActiveGame = (updated) => {
    setActiveGameId(updated.id);
    setGames((prev) => {
      const exists = prev.some((g) => g.id === updated.id);
      return exists ? prev.map((g) => (g.id === updated.id ? updated : g)) : [...prev, updated];
    });
    persistGame(updated);
  };
  const finalizeGame = (finalized) => {
    setGames((prev) => prev.map((g) => (g.id === finalized.id ? finalized : g)));
    setActiveGameId(null);
    showToast("Game finalized — nice work.");
    setPage("home");
    persistGame(finalized);
  };

  const nav = (key) => {
    setViewGameId(null);
    setBreakdownGameId(null);
    setPage(key);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setGames([]);
    setActiveGameId(null);
    setPage("home");
  };

  if (authLoading) {
    return (
      <div className="hy-root">
        <GlobalStyle />
        <div className="hy-auth-wrap">
          <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onAuthed={(authedUser) => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) loadUserData(session.user);
          });
        }}
        onToast={showToast}
      />
    );
  }

  let body = null;
  if (page === "home") body = <HomePage user={user} games={games} onNav={nav} />;
  else if (page === "enter-game") body = <EnterGamePage game={activeGame} setGame={setActiveGame} onFinalizeGame={finalizeGame} onNav={nav} onToast={showToast} />;
  else if (page === "game-analysis") {
    if (breakdownGameId) {
      const g = games.find((x) => x.id === breakdownGameId);
      body = <GameBreakdownPage game={g} onBack={() => setBreakdownGameId(null)} />;
    } else if (viewGameId) {
      const g = games.find((x) => x.id === viewGameId);
      body = <GameAnalysisDetailPage game={g} onBack={() => setViewGameId(null)} onBreakdown={() => setBreakdownGameId(viewGameId)} />;
    } else {
      body = <GameAnalysisListPage games={games} onOpen={setViewGameId} />;
    }
  } else if (page === "season-analysis") body = <SeasonAnalysisPage games={games} />;
  else if (page === "benchmarking") body = <BenchmarkingPage user={user} games={games} />;
  else if (page === "data-review") body = <DataReviewPage />;
  else if (page === "kicker-coaching") body = <KickerCoachingPage />;
  else if (page === "resources") body = <ResourcesPage onToast={showToast} />;

  return (
    <div className="hy-root">
      <GlobalStyle />
      <div className="hy-shell">
        <Sidebar user={user} page={page} onNav={nav} onSignOut={signOut} />
        <div className="hy-main">{body}</div>
      </div>
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

export default HiddenYardsApp;
