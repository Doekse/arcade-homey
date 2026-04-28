'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/doom.jsdos` from id Software's official
 * shareware installer (`doom19s.zip` on idgames mirrors) plus the committed DOSBox
 * profile under `widgets/homeyarcade/build/jsdos-bundle/`. It generates `DOOMCAB.CFG`
 * from `widgets/homeyarcade/build/controls/doom.json` so handheld mappings and build-time
 * defaults stay in sync. Run after changing dosbox.conf or controls JSON; requires network,
 * `unzip`, `zip`, and devDependency `7zip-bin`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * 7-Zip is loaded only for this build script so the Homey runtime bundle stays lean.
 */
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const sevenBin = require('7zip-bin');

const REPO_ROOT = path.join(__dirname, '..');
const CONTROLS_DIR = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'controls');

/** @type {string} Official shareware distribution (PKZIP self-extractor split across .1/.2). */
const DOOM19S_URL = 'https://youfailit.net/pub/idgames/idstuff/doom/doom19s.zip';

/** @type {number} Expected DOOM1.WAD (v1.9 shareware) size in bytes — rejects wrong archives. */
const EXPECTED_WAD_BYTES = 4196020;

/** @type {number} Expected DOOM.EXE (v1.9 shareware) size in bytes. */
const EXPECTED_EXE_BYTES = 709905;

/**
 * Shift keys intentionally share scan code 54 to match legacy DOOMCAB behavior.
 */
const DOS_SCAN_CODES = Object.freeze({
  KBD_up: 72,
  KBD_down: 80,
  KBD_left: 75,
  KBD_right: 77,
  KBD_leftctrl: 29,
  KBD_space: 57,
  KBD_leftalt: 56,
  KBD_leftshift: 54,
  KBD_rightshift: 54,
});

const DOOM_CAB_TEMPLATE_LINES = Object.freeze([
  'mouse_sensitivity\t\t5',
  'sfx_volume\t\t8',
  'music_volume\t\t8',
  'show_messages\t\t1',
  'key_right\t\t{{key_right}}',
  'key_left\t\t{{key_left}}',
  'key_up\t\t{{key_up}}',
  'key_down\t\t{{key_down}}',
  'key_strafeleft\t\t51',
  'key_straferight\t\t52',
  'key_fire\t\t{{key_fire}}',
  'key_use\t\t{{key_use}}',
  'key_strafe\t\t{{key_strafe}}',
  'key_speed\t\t{{key_speed}}',
  'use_mouse\t\t1',
  'mouseb_fire\t\t0',
  'mouseb_strafe\t\t1',
  'mouseb_forward\t\t2',
  'use_joystick\t\t0',
  'joyb_fire\t\t0',
  'joyb_strafe\t\t1',
  'joyb_use\t\t3',
  'joyb_speed\t\t2',
  'screenblocks\t\t9',
  'detaillevel\t\t0',
  'showmessages\t\t1',
  'comport\t\t2',
  'snd_channels\t\t3',
  'snd_musicdevice\t\t3',
  'snd_sfxdevice\t\t3',
  'snd_sbport\t\t544',
  'snd_sbirq\t\t5',
  'snd_sbdma\t\t1',
  'snd_mport\t\t0',
  'usegamma\t\t0',
  'chatmacro0\t\t"no macro"',
  'chatmacro1\t\t"no macro"',
  'chatmacro2\t\t"no macro"',
  'chatmacro3\t\t"no macro"',
  'chatmacro4\t\t"no macro"',
  'chatmacro5\t\t"no macro"',
  'chatmacro6\t\t"no macro"',
  'chatmacro7\t\t"no macro"',
  'chatmacro8\t\t"no macro"',
  'chatmacro9\t\t"no macro"',
]);

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
 * @param {string} keyName
 * @returns {number}
 */
function toDosScanCode(keyName) {
  const scan = DOS_SCAN_CODES[keyName];
  if (scan === undefined) {
    throw new Error(`Unsupported control key for DOOM cfg generation: ${keyName}`);
  }
  return scan;
}

/**
 * @returns {string}
 */
function buildDoomCabCfgText() {
  const configPath = path.join(CONTROLS_DIR, 'doom.json');
  /** @type {{ controls?: Record<string, { key?: string }> }} */
  const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const controls = parsed.controls;
  if (!controls) {
    throw new Error(`Invalid controls JSON (missing controls object): ${configPath}`);
  }
  const values = {
    key_up: toDosScanCode(String(controls.up?.key)),
    key_down: toDosScanCode(String(controls.down?.key)),
    key_left: toDosScanCode(String(controls.left?.key)),
    key_right: toDosScanCode(String(controls.right?.key)),
    key_fire: toDosScanCode(String(controls.a?.key)),
    key_use: toDosScanCode(String(controls.b?.key)),
    key_strafe: toDosScanCode(String(controls.y?.key)),
    key_speed: toDosScanCode(String(controls.x?.key)),
  };
  const text = DOOM_CAB_TEMPLATE_LINES
    .join('\n')
    .replace('{{key_right}}', String(values.key_right))
    .replace('{{key_left}}', String(values.key_left))
    .replace('{{key_up}}', String(values.key_up))
    .replace('{{key_down}}', String(values.key_down))
    .replace('{{key_fire}}', String(values.key_fire))
    .replace('{{key_use}}', String(values.key_use))
    .replace('{{key_strafe}}', String(values.key_strafe))
    .replace('{{key_speed}}', String(values.key_speed));
  return `${text}\n`;
}

/**
 * @returns {void}
 */
function main() {
  const { path7za } = sevenBin;
  if (!fs.existsSync(path7za)) {
    throw new Error(`7zip-bin missing binary at ${path7za} (run npm install)`);
  }
  try {
    fs.chmodSync(path7za, 0o755);
  } catch (_unused) {
    /**
     * Missing chmod capability is acceptable when the binary is already executable.
     */
  }

  const bundleDir = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'jsdos-bundle');
  const dosboxConfSrc = path.join(bundleDir, 'dosbox.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }
  const doomCabCfgText = buildDoomCabCfgText();

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'doom.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doom-jsdos-'));
  const zipPath = path.join(workDir, 'doom19s.zip');
  const combinedPath = path.join(workDir, 'combined.bin');
  const extractDir = path.join(workDir, 'seven-out');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${DOOM19S_URL}\n`);
  run('curl', ['-fsSL', DOOM19S_URL, '-o', zipPath]);

  process.stdout.write('Extracting doom19s.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', workDir]);

  const part1 = path.join(workDir, 'DOOMS_19.1');
  const part2 = path.join(workDir, 'DOOMS_19.2');
  if (!fs.existsSync(part1) || !fs.existsSync(part2)) {
    throw new Error('doom19s.zip did not contain DOOMS_19.1 / DOOMS_19.2');
  }

  fs.writeFileSync(
    combinedPath,
    Buffer.concat([fs.readFileSync(part1), fs.readFileSync(part2)]),
  );

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Unpacking shareware PKZIP (7za)\n');
  run(path7za, [
    'e',
    '-y',
    `-o${extractDir}`,
    combinedPath,
    'DOOM.EXE',
    'DOOM1.WAD',
  ]);

  const doomExe = path.join(extractDir, 'DOOM.EXE');
  const doomWad = path.join(extractDir, 'DOOM1.WAD');
  if (fs.statSync(doomWad).size !== EXPECTED_WAD_BYTES) {
    throw new Error(
      `Unexpected DOOM1.WAD size (got ${fs.statSync(doomWad).size}, expected ${EXPECTED_WAD_BYTES})`,
    );
  }
  if (fs.statSync(doomExe).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected DOOM.EXE size (got ${fs.statSync(doomExe).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }

  fs.mkdirSync(path.join(stagingDir, '.jsdos'), { recursive: true });
  copyFile(dosboxConfSrc, path.join(stagingDir, '.jsdos', 'dosbox.conf'));
  fs.writeFileSync(path.join(stagingDir, 'DOOMCAB.CFG'), doomCabCfgText, 'utf8');
  copyFile(doomExe, path.join(stagingDir, 'DOOM.EXE'));
  copyFile(doomWad, path.join(stagingDir, 'DOOM1.WAD'));

  fs.rmSync(outFile, { force: true });
  process.stdout.write(`Writing ${outFile}\n`);
  run('zip', ['-r', '-q', outFile, '.'], { cwd: stagingDir });

  fs.rmSync(workDir, { recursive: true, force: true });
  process.stdout.write('doom.jsdos build complete.\n');
}

main();
