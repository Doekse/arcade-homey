'use strict';

/**
 * @file Converts per-game control JSON files into a single runtime module.
 * This keeps runtime UI wiring simple while making control updates declarative.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const CONTROLS_DIR = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'controls');
const OUTPUT_FILE = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'public', 'controls.js');

const CONTROL_SLOTS = Object.freeze([
  'up',
  'down',
  'left',
  'right',
  'a',
  'b',
  'x',
  'y',
  'menu',
  'select',
  'start',
]);

const CONTROL_MODES = Object.freeze(['hold', 'tap', 'sticky', 'tap-or-hold']);

const KBD_LOOKUP = Object.freeze({
  KBD_space: 32,
  KBD_apostrophe: 39,
  KBD_comma: 44,
  KBD_minus: 45,
  KBD_period: 46,
  KBD_slash: 47,
  KBD_0: 48,
  KBD_1: 49,
  KBD_2: 50,
  KBD_3: 51,
  KBD_4: 52,
  KBD_5: 53,
  KBD_6: 54,
  KBD_7: 55,
  KBD_8: 56,
  KBD_9: 57,
  KBD_semicolon: 59,
  KBD_equal: 61,
  KBD_a: 65,
  KBD_b: 66,
  KBD_c: 67,
  KBD_d: 68,
  KBD_e: 69,
  KBD_f: 70,
  KBD_g: 71,
  KBD_h: 72,
  KBD_i: 73,
  KBD_j: 74,
  KBD_k: 75,
  KBD_l: 76,
  KBD_m: 77,
  KBD_n: 78,
  KBD_o: 79,
  KBD_p: 80,
  KBD_q: 81,
  KBD_r: 82,
  KBD_s: 83,
  KBD_t: 84,
  KBD_u: 85,
  KBD_v: 86,
  KBD_w: 87,
  KBD_x: 88,
  KBD_y: 89,
  KBD_z: 90,
  KBD_leftbracket: 91,
  KBD_backslash: 92,
  KBD_rightbracket: 93,
  KBD_graveaccent: 96,
  KBD_world1: 161,
  KBD_world2: 162,
  KBD_esc: 256,
  KBD_enter: 257,
  KBD_tab: 258,
  KBD_backspace: 259,
  KBD_insert: 260,
  KBD_delete: 261,
  KBD_right: 262,
  KBD_left: 263,
  KBD_down: 264,
  KBD_up: 265,
  KBD_pageup: 266,
  KBD_pagedown: 267,
  KBD_home: 268,
  KBD_end: 269,
  KBD_capslock: 280,
  KBD_scrolllock: 281,
  KBD_numlock: 282,
  KBD_printscreen: 283,
  KBD_pause: 284,
  KBD_f1: 290,
  KBD_f2: 291,
  KBD_f3: 292,
  KBD_f4: 293,
  KBD_f5: 294,
  KBD_f6: 295,
  KBD_f7: 296,
  KBD_f8: 297,
  KBD_f9: 298,
  KBD_f10: 299,
  KBD_f11: 300,
  KBD_f12: 301,
  KBD_f13: 302,
  KBD_f14: 303,
  KBD_f15: 304,
  KBD_f16: 305,
  KBD_f17: 306,
  KBD_f18: 307,
  KBD_f19: 308,
  KBD_f20: 309,
  KBD_f21: 310,
  KBD_f22: 311,
  KBD_f23: 312,
  KBD_f24: 313,
  KBD_f25: 314,
  KBD_kp0: 320,
  KBD_kp1: 321,
  KBD_kp2: 322,
  KBD_kp3: 323,
  KBD_kp4: 324,
  KBD_kp5: 325,
  KBD_kp6: 326,
  KBD_kp7: 327,
  KBD_kp8: 328,
  KBD_kp9: 329,
  KBD_kpdecimal: 330,
  KBD_kpdivide: 331,
  KBD_kpmultiply: 332,
  KBD_kpsubtract: 333,
  KBD_kpadd: 334,
  KBD_kpenter: 335,
  KBD_kpequal: 336,
  KBD_leftshift: 340,
  KBD_leftctrl: 341,
  KBD_leftalt: 342,
  KBD_leftsuper: 343,
  KBD_rightshift: 344,
  KBD_rightctrl: 345,
  KBD_rightalt: 346,
  KBD_rightsuper: 347,
  KBD_menu: 348,
});

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  throw new Error(message);
}

/**
 * @param {unknown} value
 * @param {string} fieldPath
 * @returns {string}
 */
function expectString(value, fieldPath) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(`${fieldPath} must be a non-empty string`);
  }
  return value;
}

/**
 * @param {string} keyName
 * @param {string} fieldPath
 * @returns {number}
 */
function resolveKbdKey(keyName, fieldPath) {
  const code = KBD_LOOKUP[keyName];
  if (code == null) {
    fail(`${fieldPath} has unknown key "${keyName}"`);
  }
  return code;
}

/**
 * @param {Record<string, unknown>} control
 * @param {string} gameId
 * @param {string} slot
 * @returns {{ key: number, action: string, mode: string, tapMouse?: boolean, tapKey?: number, tapHoldMs?: number }}
 */
function normalizeControl(control, gameId, slot) {
  const fieldBase = `controls/${gameId}.json controls.${slot}`;
  const keyName = expectString(control.key, `${fieldBase}.key`);
  const action = expectString(control.action, `${fieldBase}.action`);
  const mode = control.mode === undefined ? 'hold' : expectString(control.mode, `${fieldBase}.mode`);
  if (!CONTROL_MODES.includes(mode)) {
    fail(`${fieldBase}.mode must be one of: ${CONTROL_MODES.join(', ')}`);
  }

  /** @type {{ key: number, action: string, mode: string, tapMouse?: boolean, tapKey?: number, tapHoldMs?: number }} */
  const normalized = {
    key: resolveKbdKey(keyName, `${fieldBase}.key`),
    action,
    mode,
  };

  if (control.tapMouse !== undefined) {
    if (typeof control.tapMouse !== 'boolean') {
      fail(`${fieldBase}.tapMouse must be a boolean when provided`);
    }
    normalized.tapMouse = control.tapMouse;
  }
  if (control.tapKey !== undefined) {
    if (typeof control.tapKey !== 'string') {
      fail(`${fieldBase}.tapKey must be a KBD_* string when provided`);
    }
    normalized.tapKey = resolveKbdKey(control.tapKey, `${fieldBase}.tapKey`);
  }
  if (control.tapHoldMs !== undefined) {
    if (!Number.isInteger(control.tapHoldMs) || control.tapHoldMs <= 0) {
      fail(`${fieldBase}.tapHoldMs must be a positive integer when provided`);
    }
    normalized.tapHoldMs = control.tapHoldMs;
  }

  if (mode !== 'tap-or-hold') {
    if (control.tapMouse !== undefined || control.tapKey !== undefined || control.tapHoldMs !== undefined) {
      fail(
        `${fieldBase} uses tap-only options but mode is "${mode}"; these options are only valid with "tap-or-hold"`,
      );
    }
  }

  return normalized;
}

/**
 * @param {string} filePath
 * @returns {{ id: string, bundle: string, controls: Record<string, { key: number, action: string, mode: string, tapMouse?: boolean, tapKey?: number, tapHoldMs?: number }> }}
 */
function parseControlConfig(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    fail(`${path.basename(filePath)} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!isObject(parsed)) {
    fail(`${path.basename(filePath)} must contain a JSON object`);
  }

  const id = expectString(parsed.id, `${path.basename(filePath)}.id`);
  const bundle = expectString(parsed.bundle, `${path.basename(filePath)}.bundle`);

  if (!isObject(parsed.controls)) {
    fail(`${path.basename(filePath)}.controls must be an object`);
  }

  const slotKeys = Object.keys(parsed.controls);
  const unknownSlots = slotKeys.filter((slot) => !CONTROL_SLOTS.includes(slot));
  if (unknownSlots.length > 0) {
    fail(`${path.basename(filePath)} has unknown control slots: ${unknownSlots.join(', ')}`);
  }
  const missingSlots = CONTROL_SLOTS.filter((slot) => !slotKeys.includes(slot));
  if (missingSlots.length > 0) {
    fail(`${path.basename(filePath)} is missing control slots: ${missingSlots.join(', ')}`);
  }

  /** @type {Record<string, { key: number, action: string, mode: string, tapMouse?: boolean, tapKey?: number, tapHoldMs?: number }>} */
  const controls = {};
  for (const slot of CONTROL_SLOTS) {
    const control = parsed.controls[slot];
    if (!isObject(control)) {
      fail(`${path.basename(filePath)}.controls.${slot} must be an object`);
    }
    controls[slot] = normalizeControl(control, id, slot);
  }

  return { id, bundle, controls };
}

/**
 * @param {Record<string, unknown> | unknown[]} value
 * @returns {string}
 */
function toLiteral(value) {
  return JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
}

/**
 * @returns {void}
 */
function main() {
  const files = fs
    .readdirSync(CONTROLS_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    fail(`No control config files found in ${CONTROLS_DIR}`);
  }

  /** @type {Record<string, { key: number, action: string, mode: string, tapMouse?: boolean, tapKey?: number, tapHoldMs?: number }>} */
  const gameControlConfig = {};
  /** @type {Record<string, Record<string, number>>} */
  const gameControlKeys = {};
  /** @type {Record<string, string>} */
  const gameBundleUrls = {};

  for (const fileName of files) {
    const fullPath = path.join(CONTROLS_DIR, fileName);
    const config = parseControlConfig(fullPath);

    if (gameControlConfig[config.id] !== undefined) {
      fail(`Duplicate game id "${config.id}" found in ${fileName}`);
    }

    gameControlConfig[config.id] = config.controls;
    gameBundleUrls[config.id] = config.bundle;

    /** @type {Record<string, number>} */
    const keyMap = {};
    for (const slot of CONTROL_SLOTS) {
      keyMap[slot] = config.controls[slot].key;
    }
    gameControlKeys[config.id] = keyMap;
  }

  if (gameBundleUrls.doom === undefined) {
    fail('Missing required "doom" config; it is required as the runtime fallback');
  }

  const out = `'use strict';

/* AUTO-GENERATED -- DO NOT EDIT */
(function (global) {
  'use strict';

  var GAME_CONTROL_KEYS = Object.freeze(${toLiteral(gameControlKeys)});

  var GAME_CONTROL_CONFIG = Object.freeze(${toLiteral(gameControlConfig)});

  var GAME_BUNDLE_URLS = Object.freeze(${toLiteral(gameBundleUrls)});

  var DEFAULT_GAME_ID = 'doom';

  var KNOWN_GAME_IDS = Object.keys(GAME_BUNDLE_URLS);

  /**
   * @param {Record<string, unknown>} settings
   * @returns {string}
   */
  function resolveGameId(settings) {
    var g = String(settings.game || DEFAULT_GAME_ID);
    for (var i = 0; i < KNOWN_GAME_IDS.length; i += 1) {
      if (g === KNOWN_GAME_IDS[i]) return g;
    }
    return DEFAULT_GAME_ID;
  }

  /**
   * @param {Record<string, unknown>} settings
   * @returns {string}
   */
  function resolveGameBundleUrl(settings) {
    var id = resolveGameId(settings);
    var url = GAME_BUNDLE_URLS[id];
    return url != null ? url : GAME_BUNDLE_URLS[DEFAULT_GAME_ID];
  }

  global.HomeyArcadeControls = Object.freeze({
    DEFAULT_GAME_ID: DEFAULT_GAME_ID,
    GAME_CONTROL_KEYS: GAME_CONTROL_KEYS,
    GAME_CONTROL_CONFIG: GAME_CONTROL_CONFIG,
    GAME_BUNDLE_URLS: GAME_BUNDLE_URLS,
    resolveGameId: resolveGameId,
    resolveGameBundleUrl: resolveGameBundleUrl,
  });
})(typeof window !== 'undefined' ? window : globalThis);
`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, out, 'utf8');
  process.stdout.write(`Built ${OUTPUT_FILE}\n`);
}

main();
