'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/keen4.jsdos` from Apogee shareware `keen4.zip`
 * on Internet Archive item [`Keen4e-sw`](https://archive.org/details/Keen4e-sw).
 * Injects `dosbox-keen4.conf` as `.jsdos/dosbox.conf` and launches `KEEN4E.EXE`.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/keen4.json`; Keen4E does not
 * load a separate controls file. Requires network, `curl`, `unzip`, and `zip`.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Official shareware archive mirrored on Internet Archive. */
const KEEN4_ZIP_URL = 'https://archive.org/download/Keen4e-sw/keen4.zip';

/** @type {string} MD5 of `keen4.zip` per reproducible source download. */
const EXPECTED_KEEN4_ZIP_MD5 = '278e73feb3cd8848108dbcc4353a2d15';

/** @type {readonly string[]} Files shipped in `keen4.zip` (shareware v1.4 episode 4 set). */
const SHAREWARE_FILES = [
  'KEEN4E.EXE',
  'GAMEMAPS.CK4',
  'AUDIO.CK4',
  'EGAGRAPH.CK4',
  'README.DOC',
  'LICENSE.DOC',
  'CATALOG.EXE',
  'ORDER.FRM',
  'DEALERS.EXE',
];

/** @type {number} Expected `KEEN4E.EXE` size in bytes for the shareware build. */
const EXPECTED_KEEN4_EXE_BYTES = 105108;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-keen4.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'keen4.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'keen4-jsdos-'));
  const zipPath = path.join(workDir, 'keen4.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${KEEN4_ZIP_URL}\n`);
  run('curl', ['-fL', '--retry', '4', '--retry-delay', '1', '-A', 'Mozilla/5.0', KEEN4_ZIP_URL, '-o', zipPath]);

  const gotMd5 = md5File(zipPath);
  if (gotMd5 !== EXPECTED_KEEN4_ZIP_MD5) {
    throw new Error(`Unexpected keen4.zip MD5 (got ${gotMd5}, expected ${EXPECTED_KEEN4_ZIP_MD5})`);
  }

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting keen4.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const keenExe = path.join(extractDir, 'KEEN4E.EXE');
  if (!fs.existsSync(keenExe)) {
    throw new Error('keen4.zip did not contain KEEN4E.EXE');
  }
  if (fs.statSync(keenExe).size !== EXPECTED_KEEN4_EXE_BYTES) {
    throw new Error(
      `Unexpected KEEN4E.EXE size (got ${fs.statSync(keenExe).size}, expected ${EXPECTED_KEEN4_EXE_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`keen4.zip did not contain ${name}`);
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
  process.stdout.write('keen4.jsdos build complete.\n');
}

main();
