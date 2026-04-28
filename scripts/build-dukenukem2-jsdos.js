'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/dukenukem2.jsdos` from the flat Apogee shareware
 * `duke2.ZIP` on Internet Archive item [`DukeNukemIi`](https://archive.org/details/DukeNukemIi)
 * (matches `VENDOR.DOC` file list and sizes). Adds `dosbox-dukenukem2.conf` as `.jsdos/dosbox.conf`
 * and generates `NUKEM2.-GT` from `widgets/homeyarcade/build/controls/dukenukem2.json` so the
 * build-time keyboard defaults stay aligned with handheld mappings. Requires network, `curl`,
 * `unzip`, and `zip`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const CONTROLS_DIR = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'controls');

/** @type {string} Flat shareware archive mirrored on Internet Archive. */
const DUKE2_ZIP_URL = 'https://archive.org/download/DukeNukemIi/duke2.ZIP';

/** @type {readonly string[]} Filenames inside `duke2.ZIP` (flat layout; Apogee shareware set). */
const SHAREWARE_FILES = [
  'DN2HELP.EXE',
  'NUKEM2.CMP',
  'NUKEM2.EXE',
  'NUKEM2.F1',
  'NUKEM2.F2',
  'NUKEM2.F3',
  'NUKEM2.F4',
  'NUKEM2.F5',
  'ORDER.FRM',
  'VENDOR.DOC',
];

/** @type {number} Expected `NUKEM2.EXE` size in bytes (see `VENDOR.DOC` in the shareware ZIP). */
const EXPECTED_EXE_BYTES = 58852;

/** @type {number} `NUKEM2.-GT` payload size (UINT16 fields through `iGameSpeed`; see ModdingWiki). */
const NUKEM2_GT_BYTES = 36;

const DOS_SCAN_CODES = Object.freeze({
  KBD_up: 72,
  KBD_down: 80,
  KBD_left: 75,
  KBD_right: 77,
  KBD_leftctrl: 29,
  KBD_space: 57,
  KBD_leftalt: 56,
});

/**
 * @param {string} keyName
 * @returns {number}
 */
function toDosScanCode(keyName) {
  const scan = DOS_SCAN_CODES[keyName];
  if (scan === undefined) {
    throw new Error(`Unsupported control key for Duke Nukem II cfg generation: ${keyName}`);
  }
  return scan;
}

/**
 * Preserves historical Duke2 bundle behavior by sourcing jump from A and fire from Y.
 *
 * @returns {{key_up: number, key_down: number, key_left: number, key_right: number, key_jump: number, key_fire: number}}
 */
function readNukem2BindingsFromControlsJson() {
  const configPath = path.join(CONTROLS_DIR, 'dukenukem2.json');
  /** @type {{ controls?: Record<string, { key?: string }> }} */
  const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const controls = parsed.controls;
  if (!controls) {
    throw new Error(`Invalid controls JSON (missing controls object): ${configPath}`);
  }
  return {
    key_up: toDosScanCode(String(controls.up?.key)),
    key_down: toDosScanCode(String(controls.down?.key)),
    key_left: toDosScanCode(String(controls.left?.key)),
    key_right: toDosScanCode(String(controls.right?.key)),
    key_jump: toDosScanCode(String(controls.a?.key)),
    key_fire: toDosScanCode(String(controls.y?.key)),
  };
}

/**
 * Writes Apogee `NUKEM2.-GT` so the game boots with handheld-aligned keys without requiring in-game setup.
 *
 * @param {string} destPath
 * @param {{key_up: number, key_down: number, key_left: number, key_right: number, key_jump: number, key_fire: number}} bindings
 * @returns {void}
 */
function writeNukem2Gt(destPath, bindings) {
  const buf = Buffer.alloc(NUKEM2_GT_BYTES, 0);
  let o = 0;

  buf.writeUInt16LE(bindings.key_up, o);
  o += 2;
  buf.writeUInt16LE(bindings.key_down, o);
  o += 2;
  buf.writeUInt16LE(bindings.key_left, o);
  o += 2;
  buf.writeUInt16LE(bindings.key_right, o);
  o += 2;
  buf.writeUInt16LE(bindings.key_jump, o);
  o += 2;
  buf.writeUInt16LE(bindings.key_fire, o);
  o += 2;
  buf.writeUInt16LE(1, o);
  o += 2;
  buf.writeUInt16LE(1, o);
  o += 2;
  buf.writeUInt16LE(1, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(1, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(0, o);
  o += 2;
  buf.writeUInt16LE(4, o);
  o += 2;

  if (o !== NUKEM2_GT_BYTES) {
    throw new Error(`NUKEM2.-GT writer offset bug: ${o} !== ${NUKEM2_GT_BYTES}`);
  }
  fs.writeFileSync(destPath, buf);
}

/**
 * @param {string} src
 * @param {string} dest
 * @returns {void}
 */
function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fs.readFileSync(src));
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {import('child_process').SpawnSyncOptionsWithStringEncoding} [opts]
 * @returns {void}
 */
function run(cmd, args, opts) {
  const base = { encoding: 'utf8', stdio: 'inherit' };
  const merged = opts !== undefined ? Object.assign(base, opts) : base;
  const res = spawnSync(cmd, args, merged);
  if (res.error) {
    throw res.error;
  }
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited with ${res.status}`);
  }
}

/**
 * @returns {void}
 */
function main() {
  const bundleDir = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'jsdos-bundle');
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-dukenukem2.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }
  const nukem2Bindings = readNukem2BindingsFromControlsJson();

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'dukenukem2.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dukenukem2-jsdos-'));
  const zipPath = path.join(workDir, 'duke2.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${DUKE2_ZIP_URL}\n`);
  run('curl', ['-fsSL', DUKE2_ZIP_URL, '-o', zipPath]);

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting duke2.ZIP\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const exePath = path.join(extractDir, 'NUKEM2.EXE');
  if (!fs.existsSync(exePath)) {
    throw new Error('duke2.ZIP did not contain NUKEM2.EXE');
  }
  if (fs.statSync(exePath).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected NUKEM2.EXE size (got ${fs.statSync(exePath).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`duke2.ZIP did not contain ${name}`);
    }
  }

  fs.mkdirSync(path.join(stagingDir, '.jsdos'), { recursive: true });
  copyFile(dosboxConfSrc, path.join(stagingDir, '.jsdos', 'dosbox.conf'));
  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    copyFile(path.join(extractDir, name), path.join(stagingDir, name));
  }
  writeNukem2Gt(path.join(stagingDir, 'NUKEM2.-GT'), nukem2Bindings);
  if (fs.statSync(path.join(stagingDir, 'NUKEM2.-GT')).size !== NUKEM2_GT_BYTES) {
    throw new Error('NUKEM2.-GT size mismatch after write');
  }

  fs.rmSync(outFile, { force: true });
  process.stdout.write(`Writing ${outFile}\n`);
  run('zip', ['-r', '-q', outFile, '.'], { cwd: stagingDir });

  fs.rmSync(workDir, { recursive: true, force: true });
  process.stdout.write('dukenukem2.jsdos build complete.\n');
}

main();
