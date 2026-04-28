'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/monsterbash.jsdos` from Monster Bash
 * shareware `1bash21.zip` (v2.1). The archive wraps `MBSW21.SHR`, so we unpack that
 * self-extracting payload with 7-Zip to keep extraction deterministic. Injects
 * `dosbox-monsterbash.conf` as `.jsdos/dosbox.conf` and launches `BASH1.EXE`.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/monsterbash.json`.
 * Requires network, `curl`, `unzip`, `zip`, and devDependency `7zip-bin`.
 */

const crypto = require('crypto');
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

/** @type {string} Shareware v2.1 distribution mirrored by RGB Classic Games. */
const MONSTERBASH_ZIP_URL = 'http://classicdosgames.com/files/games/apogee/1bash21.zip';

/** @type {string} MD5 of `1bash21.zip` per reproducible source download. */
const EXPECTED_MONSTERBASH_ZIP_MD5 = 'f5599ed5319b71059ae84ad503d88cae';

/** @type {readonly string[]} Files extracted from `MBSW21.SHR` (shareware episode 1 set). */
const SHAREWARE_FILES = [
  'BASH1.EXE',
  'BASH1.DAT',
  'ORDER.FRM',
  'VENDOR.DOC',
];

/** @type {number} Expected `BASH1.EXE` size in bytes for the v2.1 shareware build. */
const EXPECTED_BASH1_EXE_BYTES = 75839;

/** @type {number} Expected `BASH1.DAT` size in bytes for the v2.1 shareware build. */
const EXPECTED_BASH1_DAT_BYTES = 1009955;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-monsterbash.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'monsterbash.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'monsterbash-jsdos-'));
  const zipPath = path.join(workDir, '1bash21.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const shrExtractDir = path.join(workDir, 'shr-out');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${MONSTERBASH_ZIP_URL}\n`);
  run('curl', ['-fL', '--retry', '4', '--retry-delay', '1', '-A', 'Mozilla/5.0', MONSTERBASH_ZIP_URL, '-o', zipPath]);

  const gotMd5 = md5File(zipPath);
  if (gotMd5 !== EXPECTED_MONSTERBASH_ZIP_MD5) {
    throw new Error(`Unexpected 1bash21.zip MD5 (got ${gotMd5}, expected ${EXPECTED_MONSTERBASH_ZIP_MD5})`);
  }

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting 1bash21.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const shrPath = path.join(extractDir, 'MBSW21.SHR');
  if (!fs.existsSync(shrPath)) {
    throw new Error('1bash21.zip did not contain MBSW21.SHR');
  }

  fs.mkdirSync(shrExtractDir, { recursive: true });
  process.stdout.write('Unpacking MBSW21.SHR (7za)\n');
  run(path7za, ['e', '-y', `-o${shrExtractDir}`, shrPath]);

  const bashExe = path.join(shrExtractDir, 'BASH1.EXE');
  const bashDat = path.join(shrExtractDir, 'BASH1.DAT');
  if (!fs.existsSync(bashExe) || !fs.existsSync(bashDat)) {
    throw new Error('MBSW21.SHR did not unpack to BASH1.EXE and BASH1.DAT');
  }
  if (fs.statSync(bashExe).size !== EXPECTED_BASH1_EXE_BYTES) {
    throw new Error(
      `Unexpected BASH1.EXE size (got ${fs.statSync(bashExe).size}, expected ${EXPECTED_BASH1_EXE_BYTES})`,
    );
  }
  if (fs.statSync(bashDat).size !== EXPECTED_BASH1_DAT_BYTES) {
    throw new Error(
      `Unexpected BASH1.DAT size (got ${fs.statSync(bashDat).size}, expected ${EXPECTED_BASH1_DAT_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(shrExtractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`MBSW21.SHR did not contain ${name}`);
    }
  }

  fs.mkdirSync(path.join(stagingDir, '.jsdos'), { recursive: true });
  copyFile(dosboxConfSrc, path.join(stagingDir, '.jsdos', 'dosbox.conf'));
  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    copyFile(path.join(shrExtractDir, name), path.join(stagingDir, name));
  }

  fs.rmSync(outFile, { force: true });
  process.stdout.write(`Writing ${outFile}\n`);
  run('zip', ['-r', '-q', outFile, '.'], { cwd: stagingDir });

  fs.rmSync(workDir, { recursive: true, force: true });
  process.stdout.write('monsterbash.jsdos build complete.\n');
}

main();
