'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/plbmpong.jsdos` from PLBM Pong-Out
 * shareware archive `plbmpong.zip`. Injects `dosbox-plbmpong.conf` as `.jsdos/dosbox.conf`
 * and launches `PLBMPONG.EXE`. Handheld mappings live in
 * `widgets/homeyarcade/build/controls/plbmpong.json`; this build only needs the DOSBox
 * template. Requires network, `curl`, `unzip`, and `zip`.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Shareware archive mirrored by DOSGames. */
const PLBMPONG_ZIP_URL = 'https://dosgames.com/files/plbmpong.zip';

/** @type {string} MD5 of `plbmpong.zip` per reproducible source download. */
const EXPECTED_PLBMPONG_ZIP_MD5 = '48d5783e3021f966d0da96d2479984e0';

/** @type {readonly string[]} File set shipped in `plbmpong.zip` (flat layout). */
const SHAREWARE_FILES = [
  'PLBMPONG.EXE',
  'KPSFX.DBK',
  'KPSFX.DBO',
  'PONG001.LCR',
  'PLBMPONG.GSK',
  'PLBMPONG.GSO',
  'ORDER.TXT',
  'PLBM.LCR',
  'README.TXT',
  'FILE_ID.DIZ',
];

/** @type {number} Expected `PLBMPONG.EXE` size in bytes for the source build. */
const EXPECTED_EXE_BYTES = 174016;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-plbmpong.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'plbmpong.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plbmpong-jsdos-'));
  const zipPath = path.join(workDir, 'plbmpong.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${PLBMPONG_ZIP_URL}\n`);
  run('curl', ['-fL', '--retry', '4', '--retry-delay', '1', '-A', 'Mozilla/5.0', PLBMPONG_ZIP_URL, '-o', zipPath]);

  const gotMd5 = md5File(zipPath);
  if (gotMd5 !== EXPECTED_PLBMPONG_ZIP_MD5) {
    throw new Error(
      `Unexpected plbmpong.zip MD5 (got ${gotMd5}, expected ${EXPECTED_PLBMPONG_ZIP_MD5})`,
    );
  }

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting plbmpong.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const exePath = path.join(extractDir, 'PLBMPONG.EXE');
  if (!fs.existsSync(exePath)) {
    throw new Error('plbmpong.zip did not contain PLBMPONG.EXE');
  }
  if (fs.statSync(exePath).size !== EXPECTED_EXE_BYTES) {
    throw new Error(
      `Unexpected PLBMPONG.EXE size (got ${fs.statSync(exePath).size}, expected ${EXPECTED_EXE_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`plbmpong.zip did not contain ${name}`);
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
  process.stdout.write('plbmpong.jsdos build complete.\n');
}

main();
