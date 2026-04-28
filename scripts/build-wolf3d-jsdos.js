'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/wolf3d.jsdos` from the v1.4 shareware file set
 * (`wolf3dsw.zip` on Internet Archive item `wolf3dsw`) plus `dosbox-wolf3d.conf` under
 * `widgets/homeyarcade/build/jsdos-bundle/`.
 *
 * Wolf3D writes `CONFIG.WL1` on first launch. We intentionally do not ship a generated config,
 * because hand-crafted bytes can be version-sensitive and have caused runtime crashes when a
 * level starts.
 *
 * Run after changing those inputs; requires network, `unzip`, and `zip`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Shareware v1.4 episode-1 data (WL1 + WOLF3D.EXE), mirrored for stable HTTPS. */
const WOLF3DSW_ZIP_URL = 'https://archive.org/download/wolf3dsw/wolf3dsw.zip';

/** @type {readonly string[]} Shareware filenames expected inside `wolf3dsw.zip` (flat layout). */
const SHAREWARE_FILES = [
  'AUDIOHED.WL1',
  'AUDIOT.WL1',
  'GAMEMAPS.WL1',
  'MAPHEAD.WL1',
  'VGADICT.WL1',
  'VGAGRAPH.WL1',
  'VGAHEAD.WL1',
  'VSWAP.WL1',
  'WOLF3D.EXE',
];

/** @type {number} Expected WOLF3D.EXE size in bytes for the mirrored shareware build. */
const EXPECTED_EXE_BYTES = 109959;

/** @type {number} Expected VSWAP.WL1 size in bytes for the mirrored shareware build. */
const EXPECTED_VSWAP_BYTES = 742912;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-wolf3d.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'wolf3d.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wolf3d-jsdos-'));
  const zipPath = path.join(workDir, 'wolf3dsw.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${WOLF3DSW_ZIP_URL}\n`);
  run('curl', ['-fsSL', WOLF3DSW_ZIP_URL, '-o', zipPath]);

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting wolf3dsw.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const wolfExe = path.join(extractDir, 'WOLF3D.EXE');
  const vswap = path.join(extractDir, 'VSWAP.WL1');
  if (!fs.existsSync(wolfExe)) {
    throw new Error('wolf3dsw.zip did not contain WOLF3D.EXE');
  }
  if (fs.statSync(wolfExe).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected WOLF3D.EXE size (got ${fs.statSync(wolfExe).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }
  if (!fs.existsSync(vswap)) {
    throw new Error('wolf3dsw.zip did not contain VSWAP.WL1');
  }
  if (fs.statSync(vswap).size !== EXPECTED_VSWAP_BYTES) {
    throw new Error(
      `Unexpected VSWAP.WL1 size (got ${fs.statSync(vswap).size}, expected ${EXPECTED_VSWAP_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`wolf3dsw.zip did not contain ${name}`);
    }
  }

  fs.mkdirSync(path.join(stagingDir, '.jsdos'), { recursive: true });
  copyFile(dosboxConfSrc, path.join(stagingDir, '.jsdos', 'dosbox.conf'));
  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    copyFile(path.join(extractDir, name), path.join(stagingDir, name));
  }

  fs.rmSync(outFile, { force: true });
  process.stdout.write(`Writing ${outFile}\n`);
  run('zip', ['-r', '-q', outFile, '.'], { cwd: stagingDir });

  fs.rmSync(workDir, { recursive: true, force: true });
  process.stdout.write('wolf3d.jsdos build complete.\n');
}

main();
