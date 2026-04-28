'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/pcpacman.jsdos` from Internet Archive item
 * [`msdos_festival_PCPACMAN`] (`PCPACMAN.ZIP`, freeware). Injects
 * `dosbox-pcpacman.conf` as `.jsdos/dosbox.conf` and launches `PACPC.EXE`.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/pcpacman.json`; this build only
 * needs the DOSBox template. Requires network, `curl`, `unzip`, and `zip`.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Flat freeware archive mirrored on Internet Archive. */
const PCPACMAN_ZIP_URL = 'https://archive.org/download/msdos_festival_PCPACMAN/PCPACMAN.ZIP';

/** @type {string} MD5 of `PCPACMAN.ZIP` per reproducible source download. */
const EXPECTED_PCPACMAN_ZIP_MD5 = '11ade62f1e00ea50b5e75f76d6e695e8';

/** @type {readonly string[]} File set shipped in `PCPACMAN.ZIP` (flat layout). */
const SHAREWARE_FILES = [
  'PACPC.EXE',
  'PACPC.DOC',
  'FILE_ID.DIZ',
];

/** @type {number} Expected `PACPC.EXE` size in bytes for the source build. */
const EXPECTED_EXE_BYTES = 269390;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-pcpacman.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'pcpacman.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcpacman-jsdos-'));
  const zipPath = path.join(workDir, 'PCPACMAN.ZIP');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${PCPACMAN_ZIP_URL}\n`);
  run('curl', ['-fsSL', PCPACMAN_ZIP_URL, '-o', zipPath]);

  const gotMd5 = md5File(zipPath);
  if (gotMd5 !== EXPECTED_PCPACMAN_ZIP_MD5) {
    throw new Error(`Unexpected PCPACMAN.ZIP MD5 (got ${gotMd5}, expected ${EXPECTED_PCPACMAN_ZIP_MD5})`);
  }

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting PCPACMAN.ZIP\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const exePath = path.join(extractDir, 'PACPC.EXE');
  if (!fs.existsSync(exePath)) {
    throw new Error('PCPACMAN.ZIP did not contain PACPC.EXE');
  }
  if (fs.statSync(exePath).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected PACPC.EXE size (got ${fs.statSync(exePath).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`PCPACMAN.ZIP did not contain ${name}`);
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
  process.stdout.write('pcpacman.jsdos build complete.\n');
}

main();
