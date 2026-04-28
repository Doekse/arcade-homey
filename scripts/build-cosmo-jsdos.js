'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/cosmo.jsdos` from Internet Archive item
 * [`CosmosCosmicAdventure`] (`cosmo.ZIP`, shareware episode 1 v1.20). Injects
 * `dosbox-cosmo.conf` as `.jsdos/dosbox.conf` and launches `COSMO1.EXE`.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/cosmo.json`; this build only
 * needs the DOSBox template. Requires network, `curl`, `unzip`, and `zip`.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Flat shareware archive mirrored on Internet Archive. */
const COSMO_ZIP_URL = 'https://archive.org/download/CosmosCosmicAdventure/cosmo.ZIP';

/** @type {string} MD5 of `cosmo.ZIP` per IA metadata (stable source verification). */
const EXPECTED_COSMO_ZIP_MD5 = 'c469226644324b32df8c3e081ebc9c4b';

/** @type {readonly string[]} Episode-1 file set shipped in `cosmo.ZIP` (flat layout). */
const SHAREWARE_FILES = [
  'COSMO1.EXE',
  'COSMO1.STN',
  'COSMO1.VOL',
  'file_id.diz',
];

/** @type {number} Expected `COSMO1.EXE` size in bytes for v1.20 shareware. */
const EXPECTED_EXE_BYTES = 62081;

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
 * @param {string} filePath
 * @returns {string}
 */
function md5File(filePath) {
  const h = crypto.createHash('md5');
  h.update(fs.readFileSync(filePath));
  return h.digest('hex');
}

/**
 * @returns {void}
 */
function main() {
  const bundleDir = path.join(REPO_ROOT, 'widgets', 'homeyarcade', 'build', 'jsdos-bundle');
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-cosmo.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'cosmo.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosmo-jsdos-'));
  const zipPath = path.join(workDir, 'cosmo.ZIP');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${COSMO_ZIP_URL}\n`);
  run('curl', ['-fsSL', COSMO_ZIP_URL, '-o', zipPath]);

  const gotMd5 = md5File(zipPath);
  if (gotMd5 !== EXPECTED_COSMO_ZIP_MD5) {
    throw new Error(`Unexpected cosmo.ZIP MD5 (got ${gotMd5}, expected ${EXPECTED_COSMO_ZIP_MD5})`);
  }

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting cosmo.ZIP\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const exePath = path.join(extractDir, 'COSMO1.EXE');
  if (!fs.existsSync(exePath)) {
    throw new Error('cosmo.ZIP did not contain COSMO1.EXE');
  }
  if (fs.statSync(exePath).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected COSMO1.EXE size (got ${fs.statSync(exePath).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`cosmo.ZIP did not contain ${name}`);
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
  process.stdout.write('cosmo.jsdos build complete.\n');
}

main();
