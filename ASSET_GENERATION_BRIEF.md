# RED INK — Asset Generation Brief
### Companion to GAME_DESIGN_DOCUMENT.md — every file name below is exact and import-ready

---

## HOW TO USE THIS FILE

Generate each image with the prompt given, **save it under the exact path/filename listed**, and
drop it straight into the matching Unity folder — the design doc and any AI build agent will
expect assets at these exact paths, so don't rename anything.

Before generating, extract a style summary from `REFERENCE_IMAGE` (palette, linework, lighting)
and prepend it to every prompt in place of `[STYLE]`. Default assumption if no reference image is
supplied: muted institutional tones — cream, aged paper, oxblood red as the one saturated accent
color, single warm practical light source per scene, restrained/formal, not gory.

All portrait/UI assets assume a **transparent background (PNG, alpha channel)** unless noted
otherwise. All environment textures assume **seamless tiling** unless noted otherwise.

---

## 1. THE PORTRAIT / LIFE SYSTEM (highest priority — build and test with these first)

**File:** `Assets/Art/Portrait/portrait_base.png`
**Size:** 1024×1024, transparent background
> [STYLE], a plain formal bust portrait of a featureless-but-human face, front-facing, like an old
> daguerreotype or a wax death mask, calm neutral expression, cream/sepia tones, soft single-source
> lighting from upper left, dignified and still, no ears/nose/eyes exaggerated — anatomically
> normal, unsettling only in its blankness

**File:** `Assets/Art/Portrait/redaction_ear_left.png`
**Size:** 1024×1024, transparent background, positioned to align over the base portrait's left ear
> [STYLE], a hand-torn or ink-soaked redaction patch, oxblood red bleeding into black at the edges,
> irregular organic torn-paper edge (not a clean geometric shape), sized to cover a single ear on a
> front-facing portrait bust

**File:** `Assets/Art/Portrait/redaction_ear_right.png`
**Size:** 1024×1024, transparent, aligned to right ear
> Same prompt/treatment as redaction_ear_left.png, mirrored placement, slightly different torn-edge
> shape so it doesn't read as a copy-paste duplicate

**File:** `Assets/Art/Portrait/redaction_eyebrow_left.png`
**Size:** 1024×1024, transparent, aligned to left eyebrow
> [STYLE], same oxblood-into-black ink redaction treatment, narrow horizontal torn patch sized to
> cover a single eyebrow

**File:** `Assets/Art/Portrait/redaction_eyebrow_right.png`
**Size:** 1024×1024, transparent, aligned to right eyebrow
> Same treatment, mirrored, unique torn-edge variation

**File:** `Assets/Art/Portrait/redaction_nose.png`
**Size:** 1024×1024, transparent, aligned to nose/center face
> [STYLE], same ink redaction treatment, a slightly larger central torn patch sized to cover the
> full nose, ink appears to drip slightly downward from the bottom edge toward the mouth

**File:** `Assets/Art/Portrait/redaction_eye_left.png`
**Size:** 1024×1024, transparent, aligned to left eye
> [STYLE], same ink redaction treatment, patch sized to cover a single eye socket fully, slightly
> denser/darker ink than the ear/eyebrow patches to signal escalating severity

**File:** `Assets/Art/Portrait/redaction_eye_right.png`
**Size:** 1024×1024, transparent, aligned to right eye
> Same treatment, mirrored, unique torn-edge variation

**File:** `Assets/Art/Portrait/redaction_mouth_death.png`
**Size:** 1024×1024, transparent — this is the death-stage overlay, should read as near-total
> [STYLE], a large, heavy ink redaction patch covering the mouth and lower face entirely, ink
> visibly dripping down past the chin, this is the final/heaviest redaction stage — should feel
> conclusive and total rather than partial like the previous stages

---

## 2. ROOM ENVIRONMENT (single reusable modular room — question-agnostic per design doc Section 6)

**File:** `Assets/Art/Environment/room_wall_texture.png`
**Size:** 2048×2048, seamless tile
> [STYLE], a seamless tileable wall texture, aged institutional plaster/paneling, cream and faded
> oxblood wainscoting, subtle water staining, formal and worn, like an old courthouse or exam hall

**File:** `Assets/Art/Environment/room_floor_texture.png`
**Size:** 2048×2048, seamless tile
> [STYLE], a seamless tileable floor texture, worn herringbone wood parquet or old linoleum tile in
> cream and dark oxblood checker pattern, scuffed and dulled with age, formal institutional feel

**File:** `Assets/Art/Environment/room_ceiling_texture.png`
**Size:** 2048×2048, seamless tile
> [STYLE], a seamless tileable ceiling texture, pressed tin ceiling tile pattern, cream paint over
> metal, water-stained in places, single central light fixture silhouette implied by wear pattern

**File:** `Assets/Art/Environment/door_diffuse.png`
**Size:** 2048×2048 (single door face, not tiling)
> [STYLE], a tall formal wooden door, dark stained oak, brass kick plate and handle, a small brass
> plaque frame at eye level (left empty — text overlaid separately in-engine), closed and locked
> feeling, dignified and heavy

**File:** `Assets/Art/Environment/door_unlock_glow.png`
**Size:** 2048×2048, transparent overlay, same UV layout as door_diffuse.png
> [STYLE], a warm golden emissive glow mask outlining the same door's edges and handle, meant to be
> additively blended over door_diffuse.png when the door unlocks — soft bloom-friendly glow, no
> hard edges

**File:** `Assets/Art/Environment/plaque_frame.png`
**Size:** 1024×512, transparent background
> [STYLE], a small ornate brass plaque frame, empty center (question text rendered in-engine on
> top), formal engraved border detail, matches the door's brass hardware style

---

## 3. UI ELEMENTS

**File:** `Assets/Art/UI/answer_lever_normal.png`
**Size:** 512×512, transparent
> [STYLE], a small brass wall-mounted lever/switch in its neutral "up" resting position, mounted on
> a dark wood plate, tactile and mechanical, matches the door hardware style

**File:** `Assets/Art/UI/answer_lever_correct.png`
**Size:** 512×512, transparent
> Same lever prop, pulled fully down, a small warm green or gold indicator light lit above it

**File:** `Assets/Art/UI/answer_lever_incorrect.png`
**Size:** 512×512, transparent
> Same lever prop, pulled fully down, a small oxblood red indicator light lit above it, subtle
> cracked-glass detail over the indicator lens

**File:** `Assets/Art/UI/title_logo.png`
**Size:** 2048×1024, transparent background
> [STYLE], the words "RED INK" as a formal engraved-metal or letterpress title treatment, oxblood
> red ink-bleed effect on the lettering edges, cream background implied, dignified horror-adjacent
> title card typography, no other text or decoration

**File:** `Assets/Art/UI/background_title_screen.png`
**Size:** 1920×1080
> [STYLE], a wide shot down the procedural corridor of doors from the game, foggy/dim depth, single
> warm light pooling near the closest door, moody and inviting title-screen composition, leave
> negative space in the upper third for logo/menu overlay

**File:** `Assets/Art/UI/run_summary_frame.png`
**Size:** 1920×1080, semi-transparent overlay panel
> [STYLE], an ornate formal document/certificate-style frame border for a results screen (rooms
> cleared, accuracy, seed shown inside it in-engine), cream and brass, like an official discharge
> paper or exam result

---

## 4. AUDIO ASSETS

**File:** `Assets/Audio/Chime/chime_success.wav`
**Format:** 44.1kHz/24-bit stereo WAV
> Compose/render the three-note phrase G4→E4→C4, clean tubular-bell/vibraphone timbre, natural
> decay (~1.2s per note), warm room reverb, in tune — identical spec to the chime asset from the
> prior "SIGN-OFF" project for tonal continuity if reused across projects

**File:** `Assets/Audio/Chime/chime_failure.wav`
**Format:** 44.1kHz/24-bit stereo WAV
> Same three-note phrase and instrument timbre as chime_success.wav, but pitch-bent flat by
> progressively 20/40/60 cents across the three notes, a faint backward-reverb pre-tail before each
> note (~150ms), subtle ring-modulation shimmer over the decay tail — should feel ethereal and
> "arriving wrong," not harsh or buzzer-like

**File:** `Assets/Audio/UI/lever_pull.wav`
> A single mechanical brass lever-pull clunk with a small spring-return click tail, dry and close-mic'd

**File:** `Assets/Audio/UI/door_unlock.wav`
> A heavy formal door lock mechanism releasing — bolt slide, latch click, followed by a soft creak
> as the door begins to swing

**File:** `Assets/Audio/UI/ink_redaction_stain.wav`
> A soft wet ink-spreading/paper-soaking sound with a faint paper-crackle tail, used under each
> facial redaction event

**File:** `Assets/Audio/Ambience/corridor_roomtone.wav`
**Loop:** yes, seamless
> A quiet institutional room-tone bed — faint fluorescent hum, distant muffled footsteps/creaks,
> very sparse, mostly negative space so the chime always reads clearly against it

---

## 5. ASSET MANIFEST CHECKLIST (mirrors GDD Section 8 art/audio subset)

- [ ] All 9 portrait/redaction files generated at exact paths under `Assets/Art/Portrait/`
- [ ] All environment textures generated, confirmed seamless-tiling in-engine
- [ ] Both chime files generated and A/B tested against each other — success vs. failure must be
      instantly distinguishable with eyes closed
- [ ] All UI files imported and confirmed correct import settings (Sprite (2D and UI), matching
      pixel dimensions)
- [ ] No default Unity primitive materials remain visible in any shipped screenshot
