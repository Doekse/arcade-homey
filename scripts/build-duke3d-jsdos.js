'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/duke3d.jsdos` from the same game ZIP used on
 * [js-dos.com’s Duke Nukem 3D demo](https://js-dos.com/Duke%20Nukem%203d/) (`Duke Nukem 3d-@digitalwalt.zip`
 * under `js-dos.com/cdn/upload/…`), which mirrors v1.3d shareware with `DUKE3D.CFG` already present.
 * Adds `widgets/homeyarcade/build/jsdos-bundle/dosbox-duke3d.conf` as `.jsdos/dosbox.conf`.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/duke3d.json`; this build only
 * packages the game files and DOSBox template. Requires network, `curl`, `unzip`, and `zip`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Game bundle as published for the classic js-dos Duke 3D player (GitHub-backed CDN). */
const JS_DOS_DUKE_ZIP_URL =
  'https://js-dos.com/cdn/upload/Duke%20Nukem%203d-%40digitalwalt.zip';

/** @type {string} Root folder inside the ZIP (all game files live here). */
const ZIP_GAME_DIR = 'DUKE3D';

/** @type {number} Expected DUKE3D.EXE (v1.3d shareware) size in bytes. */
const EXPECTED_EXE_BYTES = 1178963;

/** @type {number} Expected DUKE3D.GRP (v1.3d shareware episode 1) size in bytes. */
const EXPECTED_GRP_BYTES = 11035779;

/**
 * Copies regular files from `srcDir` into `destDir` (single level; skips subdirectories).
 *
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {void}
 */
function copyFlatGameFiles(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (let i = 0; i < entries.length; i += 1) {
    const ent = entries[i];
    if (!ent.isFile()) {
      continue;
    }
    const from = path.join(srcDir, ent.name);
    const to = path.join(destDir, ent.name);
    fs.copyFileSync(from, to);
  }
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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-duke3d.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'duke3d.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'duke3d-jsdos-'));
  const bundleZip = path.join(workDir, 'jsdos-duke.zip');
  const extractDir = path.join(workDir, 'extract');
  const gameSrcDir = path.join(extractDir, ZIP_GAME_DIR);
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${JS_DOS_DUKE_ZIP_URL}\n`);
  run('curl', ['-fsSL', JS_DOS_DUKE_ZIP_URL, '-o', bundleZip]);

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting js-dos Duke bundle\n');
  run('unzip', ['-q', '-o', bundleZip, '-d', extractDir]);

  if (!fs.existsSync(gameSrcDir)) {
    throw new Error(`ZIP did not contain ${ZIP_GAME_DIR}/ (unexpected layout)`);
  }

  const dukeExe = path.join(gameSrcDir, 'DUKE3D.EXE');
  const dukeGrp = path.join(gameSrcDir, 'DUKE3D.GRP');
  if (!fs.existsSync(dukeExe) || !fs.existsSync(dukeGrp)) {
    throw new Error(`${ZIP_GAME_DIR}/ did not contain DUKE3D.EXE / DUKE3D.GRP`);
  }
  if (fs.statSync(dukeExe).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected DUKE3D.EXE size (got ${fs.statSync(dukeExe).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }
  if (fs.statSync(dukeGrp).size !== EXPECTED_GRP_BYTES) {
    throw new Error(
      `Unexpected DUKE3D.GRP size (got ${fs.statSync(dukeGrp).size}, expected ${EXPECTED_GRP_BYTES})`,
    );
  }
  if (!fs.existsSync(path.join(gameSrcDir, 'DUKE3D.CFG'))) {
    throw new Error(`${ZIP_GAME_DIR}/ did not contain DUKE3D.CFG`);
  }

  fs.mkdirSync(path.join(stagingDir, '.jsdos'), { recursive: true });
  fs.copyFileSync(dosboxConfSrc, path.join(stagingDir, '.jsdos', 'dosbox.conf'));
  copyFlatGameFiles(gameSrcDir, stagingDir);

  fs.rmSync(outFile, { force: true });
  process.stdout.write(`Writing ${outFile}\n`);
  run('zip', ['-r', '-q', outFile, '.'], { cwd: stagingDir });

  fs.rmSync(workDir, { recursive: true, force: true });
  process.stdout.write('duke3d.jsdos build complete.\n');
}

main();
