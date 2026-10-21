'use strict';
// Full Google Play release for Tape Cipher (com.tapecipher.game):
//   - store listing text + images (icon, feature graphic, screenshots)
//   - contact details copied from the ThreeLanes app on the same account
//   - signed AAB upload
//   - production release (status=draft, because a new Play app only accepts
//     draft releases until the first console submission - see threelanes.txt)
//
// Reuses the proven transport from C:\Development\threelanes\tools\play_api.js
// (token minting, edit lifecycle, resumable bundle upload).
//
//   node scripts/play-release.js            # dry run: validate listing + images only
//   node scripts/play-release.js --commit   # upload everything

const fs = require('fs');
const path = require('path');

const PLAY_API = require('C:/Development/threelanes/tools/play_api.js');
const { accessToken, loadCredentials, openEdit, apiCall, uploadBundle } = PLAY_API;

const PACKAGE = 'com.lightweight.tapecipher';
const CONTACT_SOURCE_PACKAGE = 'com.ilikecharlie.threelanes'; // same dev account
const ROOT = path.resolve(__dirname, '..');
const STORE = path.join(ROOT, 'design', 'store');
const AAB = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
const LOCALE = 'en-US';
const COMMIT = process.argv.includes('--commit');

const LISTING = {
  title: 'Tape Cipher',
  shortDescription: 'Decipher grammar puzzles in a cursed cassette deck across 20 frontier chapters.',
  fullDescription: `The Tape Warden has trapped twenty frontier legends inside a cursed cassette deck — and the magnetic ribbon is snapping. Only a sharp mind can decipher the spools before the tape desynchronizes for good.

TAPE CIPHER is a dark folkloric word puzzle game that turns grammar, homophones, and SAT-level vocabulary into an analog mystery. Repair each magnetic spool chapter by choosing the right word before the ribbon fractures.

► 20 FRONTIER CHAPTERS
Journey from the Coyote Den to the Master Spool Convergence. Every deciphered chapter unlocks a hand-sketched folk tale vignette and its own narrative epilogue.

► 142 HAND-CRAFTED PUZZLES
Three puzzle archetypes keep every spool fresh:
• Synonym Matrix — match precise SAT and GRE-level synonyms across archaic, literary, and modern registers
• Homophone Dilemmas — their / there / they're, affect / effect, discreet / discrete and dozens more
• Missing-Letter Ciphers — hangman-style blanks you fill letter by letter

► THREE DIFFICULTY LEVELS
• EASY (1x) — relaxed frontier grammar with standard tape integrity
• MEDIUM (1.5x) — SAT-prep diction, synonym matrices and phonetics
• HARD (2.5x) — GRE-level vocabulary with unforgiving tape tension

► ANALOG CHARM, MODERN BRAIN TRAINING
• Live speed timer with bonus scoring for quick, confident answers
• Streak bonuses, high-score records and a 142-puzzle question vault
• Spend "magnetic flux" to reveal etymology hints when the Warden stumps you
• Warm banjo-and-tape-hiss soundtrack and sepia woodcut artwork

► BUILT FOR WORDSMITHS
Fans of crosswords, hangman, wordle-style deduction, SAT/GRE prep, and vocabulary builders will feel at home on the workbench. No account, no ads, no internet required — just you, the Warden, and a whole lot of unravelling tape.

Can you decipher all 20 chapters before the ribbon snaps? Rewind, relax, and mind your homophones.`,
};

const LIMITS = { title: 30, shortDescription: 80, fullDescription: 4000 };
const IMAGES = {
  icon: { file: 'icon_512.png', rule: { w: 512, h: 512, maxBytes: 1024 * 1024, opaque: true } },
  featureGraphic: { file: 'feature_graphic_1024x500.png', rule: { w: 1024, h: 500, maxBytes: 1024 * 1024, opaque: true } },
};
const SCREENSHOTS = [
  'screen_01_initial.png',
  'screen_02_gameplay.png',
  'screen_03_high_scores.png',
  'screen_04_rules_lore.png',
];

function fail(msg) {
  console.error(`\nREFUSING TO PUBLISH: ${msg}\n`);
  process.exit(1);
}

function pngInfo(file) {
  const b = fs.readFileSync(file);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (b.length < 33 || !b.subarray(0, 8).equals(sig)) return { isPng: false };
  if (b.subarray(12, 16).toString('ascii') !== 'IHDR') return { isPng: false };
  return {
    isPng: true, width: b.readUInt32BE(16), height: b.readUInt32BE(20),
    colorType: b.readUInt8(25), hasAlpha: b.readUInt8(25) === 4 || b.readUInt8(25) === 6, bytes: b.length,
  };
}

function checkImage(label, file, rule) {
  const info = pngInfo(file);
  if (!info.isPng) fail(`${label}: ${file} is not a PNG`);
  const problems = [];
  if (info.bytes > rule.maxBytes) problems.push(`${info.bytes} bytes exceeds limit`);
  if (rule.opaque && info.hasAlpha) problems.push('has alpha; Play rejects alpha here');
  if (rule.w && (info.width !== rule.w || info.height !== rule.h)) problems.push(`${info.width}x${info.height}, wants ${rule.w}x${rule.h}`);
  if (!rule.w) {
    const long = Math.max(info.width, info.height);
    if (long < 320 || long > 3840) problems.push(`long edge ${long}px outside 320-3840`);
    if (info.width / info.height < 16 / 9 - 0.001) problems.push('aspect below 16:9');
  }
  if (problems.length) fail(`${label}: ${file} - ${problems.join('; ')}`);
  console.log(`  ${label.padEnd(18)} ${info.width}x${info.height}  ${(info.bytes / 1048576).toFixed(2)} MB  OK`);
}

async function main() {
  console.log(`package : ${PACKAGE}`);
  console.log(`mode    : ${COMMIT ? 'COMMIT - this publishes listing + AAB + production draft release' : 'dry run - nothing uploaded'}\n`);

  // --- copy limits ---
  for (const [field, limit] of Object.entries(LIMITS)) {
    const len = [...LISTING[field]].length;
    if (len > limit) fail(`"${field}" is ${len} chars, limit ${limit}`);
    console.log(`  ${field.padEnd(18)} ${String(len).padStart(5)} / ${limit}  OK`);
  }

  // --- images ---
  for (const [type, img] of Object.entries(IMAGES)) {
    const p = path.join(STORE, img.file);
    if (!fs.existsSync(p)) fail(`${type} missing: ${p}`);
    checkImage(type, p, img.rule);
  }
  for (const s of SCREENSHOTS) {
    const p = path.join(STORE, s);
    if (!fs.existsSync(p)) fail(`screenshot missing: ${p}`);
    checkImage('screenshot', p, { maxBytes: 8 * 1024 * 1024 });
  }
  if (SCREENSHOTS.length < 2) fail('Play requires at least 2 phone screenshots');

  // --- bundle ---
  if (!fs.existsSync(AAB)) fail(`AAB missing: ${AAB}`);
  console.log(`  ${'bundle'.padEnd(18)} ${(fs.statSync(AAB).size / 1048576).toFixed(2)} MB  ${path.relative(ROOT, AAB)}`);

  if (!COMMIT) {
    console.log('\nDRY RUN. Nothing uploaded. Re-run with --commit to apply.');
    return;
  }

  // --- auth ---
  const creds = loadCredentials();
  console.log(`\nidentity : ${creds.client_email}`);
  const token = await accessToken(creds);

  // --- contact details from the sibling app ---
  let contact = {};
  try {
    const srcEdit = await openEdit(token, CONTACT_SOURCE_PACKAGE);
    const d = await apiCall(token, 'GET', `/edits/${srcEdit}/details`, undefined, CONTACT_SOURCE_PACKAGE);
    if (d.status === 200) contact = d.body;
    console.log(`contact from ${CONTACT_SOURCE_PACKAGE}: ${JSON.stringify({
      email: contact.contactEmail, phone: contact.contactPhone, website: contact.contactWebsite,
    })}`);
  } catch (e) {
    console.log(`(could not read contact details from ${CONTACT_SOURCE_PACKAGE}: ${String(e.message).slice(0, 200)})`);
  }

  // --- open edit for Tape Cipher ---
  let editId;
  try {
    editId = await openEdit(token, PACKAGE);
  } catch (e) {
    console.log(`\n${String(e.message || e)}\n`);
    process.exit(1);
  }
  console.log(`edit     : ${editId}`);

  // apply contact details to Tape Cipher
  const detailsBody = {};
  for (const f of ['contactEmail', 'contactPhone', 'contactWebsite', 'defaultLanguage']) {
    if (contact[f]) detailsBody[f] = contact[f];
  }
  if (Object.keys(detailsBody).length) {
    const r = await apiCall(token, 'PUT', `/edits/${editId}/details`, detailsBody, PACKAGE);
    if (r.status !== 200) console.log(`(details PUT: HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 200)})`);
    else console.log('contact details applied');
  }

  // --- images ---
  const uploadBase = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3';
  async function uploadImage(file, imageType) {
    const bytes = fs.readFileSync(file);
    const start = await fetch(
      `${uploadBase}/applications/${PACKAGE}/edits/${editId}` +
      `/listings/${encodeURIComponent(LOCALE)}/${imageType}?uploadType=resumable`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'X-Upload-Content-Type': 'image/png',
          'X-Upload-Content-Length': String(bytes.length),
        },
        body: '',
      });
    if (start.status !== 200) {
      throw new Error(`resumable start refused for ${file} (${imageType}): HTTP ${start.status} ${(await start.text()).slice(0, 300)}`);
    }
    const location = start.headers.get('location') || start.headers.get('Location');
    if (!location) throw new Error(`no Location header for ${file} (${imageType})`);
    const put = await fetch(location, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png', 'Content-Length': String(bytes.length) },
      body: bytes,
    });
    const text = await put.text();
    if (put.status !== 200) throw new Error(`upload failed for ${file} (${imageType}): HTTP ${put.status} ${text.slice(0, 300)}`);
    let body; try { body = JSON.parse(text); } catch { body = {}; }
    if (!body.image || !body.image.sha256) throw new Error(`upload for ${file} returned no image ref: ${text.slice(0, 200)}`);
    return body.image;
  }

  console.log('\nuploading images...');
  console.log(`  icon              ${(await uploadImage(path.join(STORE, IMAGES.icon.file), 'icon')).sha1.slice(0, 12)}`);
  console.log(`  featureGraphic    ${(await uploadImage(path.join(STORE, IMAGES.featureGraphic.file), 'featureGraphic')).sha1.slice(0, 12)}`);
  for (const s of SCREENSHOTS) {
    console.log(`  shot              ${s}  ${(await uploadImage(path.join(STORE, s), 'phoneScreenshots')).sha1.slice(0, 12)}`);
  }

  // --- listing text ---
  const putList = await apiCall(token, 'PUT', `/edits/${editId}/listings/${LOCALE}`, {
    language: LOCALE,
    title: LISTING.title,
    shortDescription: LISTING.shortDescription,
    fullDescription: LISTING.fullDescription,
  }, PACKAGE);
  if (putList.status !== 200) fail(`edits.listings PUT failed: HTTP ${putList.status} ${JSON.stringify(putList.body).slice(0, 400)}`);
  console.log(`listing (${LOCALE}) set`);

  // --- bundle ---
  console.log('\nuploading bundle...');
  const bundle = await uploadBundle(token, editId, AAB, PACKAGE);
  const versionCode = bundle && bundle.versionCode;
  if (!versionCode) fail(`bundle upload returned no versionCode: ${JSON.stringify(bundle).slice(0, 200)}`);
  console.log(`  versionCode ${versionCode}`);

  // --- tracks ---
  // A brand-new Play app is a "draft app": the API only accepts status=draft
  // releases on any track until the first release is submitted by hand in the
  // console. So: production as draft, internal as draft too.
  const release = {
    name: '1.0',
    versionCodes: [String(versionCode)],
    status: 'draft',
    releaseNotes: [{ language: LOCALE, text: 'Initial release: 20 frontier chapters, 142 puzzles, 3 difficulty levels.' }],
  };
  for (const trackName of ['internal', 'production']) {
    const r = await apiCall(token, 'PUT', `/edits/${editId}/tracks/${trackName}`,
      { track: trackName, releases: [release] }, PACKAGE);
    if (r.status !== 200) {
      console.log(`  ${trackName}: HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
    } else {
      console.log(`  ${trackName}: draft release 1.0 (versionCode ${versionCode})`);
    }
  }

  // --- commit ---
  const commit = await apiCall(token, 'POST', `/edits/${editId}:commit`, '', PACKAGE);
  if (commit.status !== 200) fail(`commit failed: HTTP ${commit.status} ${JSON.stringify(commit.body).slice(0, 400)}`);
  console.log(`\nPUBLISHED to ${PACKAGE}: listing + images + AAB versionCode ${versionCode}, production draft release.`);
  console.log('First production submission must be done by hand in Play Console');
  console.log('(content rating, Data Safety, privacy policy, target audience, ads declaration),');
  console.log('then Production -> Create new release -> Submit for review.');
}

main().catch((e) => {
  console.error(`\nERROR: ${String(e.message || e)}`);
  process.exitCode = 1;
});
