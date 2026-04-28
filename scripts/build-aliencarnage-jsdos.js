'use strict';

/**
 * @file Rebuilds `widgets/homeyarcade/public/game/aliencarnage.jsdos` from Apogee shareware `harry.zip`
 * on Internet Archive item [`Halloween-harry-sw1`](https://archive.org/details/Halloween-harry-sw1)
 * (Halloween Harry v1.2 — the same title later sold as Alien Carnage). Injects
 * `dosbox-aliencarnage.conf` as `.jsdos/dosbox.conf` and launches `HH1.EXE skip` to skip long intros.
 * Handheld mappings live in `widgets/homeyarcade/build/controls/aliencarnage.json`; HH1 does not
 * read a separate controls file. Requires network, `curl`, `unzip`, and `zip`.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');

/** @type {string} Official flat shareware archive on Internet Archive. */
const HARRY_ZIP_URL = 'https://archive.org/download/Halloween-harry-sw1/harry.zip';

/** @type {readonly string[]} Filenames inside `harry.zip` (flat layout; v1.2 shareware set). */
const SHAREWARE_FILES = [
  '#1HH_GUS.ZIP',
  'CATALOG.EXE',
  'DEALERS.EXE',
  'DT.1',
  'HARRY.-0',
  'HARRY.FAT',
  'HARRY.HSB',
  'HARRY.ICO',
  'HARRY0.-0',
  'HARRY1.-0',
  'HARRY10.-0',
  'HARRY11.-0',
  'HARRY13.-0',
  'HARRY14.-0',
  'HARRY15.-0',
  'HARRY2.-0',
  'HARRY4.-0',
  'HARRY5.-0',
  'HARRY8.-0',
  'HARRY9.-0',
  'HARRY99.-0',
  'HH-HELP.EXE',
  'HH1.EXE',
  'INTRO.BNK',
  'INTRO.FAT',
  'LICENSE.DOC',
  'MAPS.-0',
  'MAPS.FAT',
  'ORDER.BNK',
  'ORDER.FAT',
  'ORDER.FRM',
  'SFX.BNK',
  'SFX.FAT',
];

/** @type {number} Expected `HH1.EXE` size in bytes (1993 shareware launcher). */
const EXPECTED_HH1_BYTES = 11744;

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
  const dosboxConfSrc = path.join(bundleDir, 'dosbox-aliencarnage.conf');
  if (!fs.existsSync(dosboxConfSrc)) {
    throw new Error(`Missing DOSBox template: ${dosboxConfSrc}`);
  }

  const outFile = path.join(
    REPO_ROOT,
    'widgets',
    'homeyarcade',
    'public',
    'game',
    'aliencarnage.jsdos',
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aliencarnage-jsdos-'));
  const zipPath = path.join(workDir, 'harry.zip');
  const extractDir = path.join(workDir, 'unzipped');
  const stagingDir = path.join(workDir, 'staging');

  process.stdout.write(`Downloading ${HARRY_ZIP_URL}\n`);
  run('curl', ['-fsSL', HARRY_ZIP_URL, '-o', zipPath]);

  fs.mkdirSync(extractDir, { recursive: true });
  process.stdout.write('Extracting harry.zip\n');
  run('unzip', ['-q', '-o', zipPath, '-d', extractDir]);

  const hh1 = path.join(extractDir, 'HH1.EXE');
  if (!fs.existsSync(hh1)) {
    throw new Error('harry.zip did not contain HH1.EXE');
  }
  if (fs.statSync(hh1).size !== EXPECTED_HH1_BYTES) {
    throw new Error(
      `Unexpected HH1.EXE size (got ${fs.statSync(hh1).size}, expected ${EXPECTED_HH1_BYTES})`,
    );
  }

  for (let i = 0; i < SHAREWARE_FILES.length; i += 1) {
    const name = SHAREWARE_FILES[i];
    const p = path.join(extractDir, name);
    if (!fs.existsSync(p)) {
      throw new Error(`harry.zip did not contain ${name}`);
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
  process.stdout.write('aliencarnage.jsdos build complete.\n');
}

main();
