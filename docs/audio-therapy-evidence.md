# Audio Therapy — Evidence Base

Extracted stats behind Serene's 100 Hz session. Compiled July 2026 from a
multi-source review with adversarial verification (claims were kept only when
independent verifiers confirmed them against the primary source; refuted claims
are listed at the bottom so nobody re-introduces them).

**Read this before touching the tone, the frequency, the volume copy, or any
science claim in the UI.**

---

## TL;DR for implementers

| Decision | Verdict |
|---|---|
| Keep 100 Hz? | **Yes** — nothing acoustic has better human evidence. But it is *unreplicated*, not *validated*. |
| Switch to 500 Hz? | **No.** Zero human evidence that 500 Hz reduces motion sickness. |
| Add binaural beats / pink noise? | **No.** No human motion-sickness evidence located for either. |
| Session length | **60 s** — matches the studied 1-minute dose. ✅ already correct |
| Volume guidance | **Conversation level (~61–66 dBA).** Louder is not better. |
| When to listen | **Before setting off.** During-motion use is untested. |
| Marketing language | Never "cure/treat/prevent". Never imply headphone delivery is validated. |

---

## 1. The primary study (the app's entire basis)

Kagawa, Ohgami, Kato et al. — *"Just 1-min exposure to a pure tone at 100 Hz
may improve motion sickness"*, **Environmental Health and Preventive Medicine**
30:24-00247 (online 25 Mar 2025).
[PMC11955832](https://pmc.ncbi.nlm.nih.gov/articles/PMC11955832/) ·
[J-STAGE](https://www.jstage.jst.go.jp/article/ehpm/30/0/30_24-00247/_article)

### Stimulus parameters — exact

| Parameter | Value |
|---|---|
| Frequency | 100 Hz pure tone |
| Level | **80–85 dBZ** (unweighted) = **60.9–65.9 dBA** |
| Duration (human) | **1 minute** |
| Duration (mouse) | 5 minutes |
| Timing | **BEFORE** the motion exposure — prophylactic |
| Transducer | **Loudspeakers**, bilateral, free-field |
| Speaker distance | 30 cm from each inner ear (swing, driving simulator); **10 cm** in the vehicle headrest |
| Speaker models | SL-D501 (swing/sim); KSC-SW11 ×2 (vehicle) — *subwoofer-class driver* |
| Negative control | 250 Hz tone |
| Laterality | Bilateral. **Unilateral exposure showed limited effect.** |

A-weighting at 100 Hz is −19.1 dB, so 80 dBZ → 60.9 dBA and 85 dBZ → 65.9 dBA.
The arithmetic checks out. That is roughly normal conversation loudness, well
under WHO safe-listening guidance (80 dBA / 40 h weekly).

### Human sample & design

| Item | Value |
|---|---|
| Total registered participants | **82** across three provocations |
| Swing test | n = 29 |
| Other arms | driving simulator; real vehicle |
| Design | **Self-controlled (within-subject), unblinded** |
| Outcome (objective) | Posturography — envelope area |
| Outcome (subjective) | MSAQ |
| Measurement window | Minutes post-motion |
| Replication (as of Jul 2026) | **None.** No independent replication *and* no failed replication. |

### Results

- Posturography envelope area improved with bilateral 100 Hz exposure across
  **all three** provocations (swing, driving simulator, real vehicle).
- Total MSAQ and most item scores significantly lower — **in the real-vehicle
  trial**.
- Mouse beam-balance model: effect persisted **≥120 min**.
  ⚠️ **This is the source of the old "up to 2 hours" claim in the app. It is
  MOUSE data. There is no human duration figure. The claim was removed.**

### How 100 Hz was chosen

Not from human vestibular tuning data. From an **ex vivo screen of mouse utricle
explants**, sweeping 90–1000 Hz at 65–85 dBZ (FM1-43FX dye-uptake readout).
Conclusion of that screen: *"pure tones of 75–85 dBZ at 100 Hz are specific
sounds that activate vestibular function."*

Proposed mechanism: otoconia. The tone activated vestibular function in utricles
**with** intact otoconia but not in utricles **without** them. Authors' own
words: *"Further studies are necessary to obtain more direct evidence."*

### Conflicts of interest — material

- **Two authors are DENSO Corporation employees.** DENSO "provided the research
  foundation."
- University investigators **received patent-license option fees** from DENSO.
- The stimulus is **trademarked** ("sound spice").
- The rationale is **self-bootstrapped within one lab**: the mouse method paper,
  a 2018 human balance paper, and this 2025 study share authors (Ohgami / Kato).
  That 2018 paper — Xu & Ohgami et al., *"Improvement of balance in young adults
  by a sound component at 100 Hz in music"*, **Sci Rep** 8:17158 —
  [Nature](https://www.nature.com/articles/s41598-018-35244-3) ·
  [PMC6237978](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6237978/) — is
  **observational** (n=110): listeners whose music happened to carry ≥46.6 dB at
  100 Hz had better posturography than the low-exposure group. Correlational, not
  an intervention trial.

---

## 2. The delivery-mode gap (biggest risk to this app)

Every axis on which Serene deploys 100 Hz differs from the only study
supporting it:

| Axis | Study | Serene |
|---|---|---|
| Transducer | Near-field **speakers**, 10–30 cm | **Headphones** |
| Timing | **Before** motion | (was) during the ride |
| Duration | **1 minute** | (was) implied continuous |

Three simultaneous unvalidated extrapolations:

1. **Transducer.** A loudspeaker 10–30 cm from the head plausibly couples
   whole-head / bone vibration that headphones cannot reproduce. Earbud output
   *at 100 Hz* also depends heavily on driver and ear seal, and the study's level
   is an **unweighted, free-field** figure — not a calibrated eardrum SPL.
   **Nobody has tested headphone equivalence — including Samsung**, whose Galaxy
   Buds "Hearapy" productizes the same finding and has been criticized on exactly
   this point.
2. **Timing.** The authors' own limitations section lists tone exposure *during*
   motion as **future work**.
3. **Duration.** 1 minute → continuous is not "more of the same".

The app's **60-second session already matches the studied dose** — that part was
right. The fixes applied were to timing guidance and to messaging.

---

## 3. Why "the vestibular system is tuned to 100 Hz" is a mis-citation

The famous ~100 Hz vestibular best frequency is a **bone-conduction** result.

**Todd, Rosengren & Colebatch (2008)** — *"Tuning and sensitivity of the human
vestibular system to low-frequency vibration"*, **Neurosci Lett** 444:36–41 —
[ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0304394008011130):
- *"a highly tuned response to whole-head vibration in the transmastoid plane
  with a best frequency of about 100 Hz"*
- VOR responses below **−70 dB re 1 g** — **15 dB below** the human hearing
  threshold for bone-conducted sound at that frequency.
- Authors call the sensitivity **"seismic"** (skull/substrate-borne).

Corroborating bone-conduction tuning — Govender, Rosengren & Colebatch, *J Appl
Physiol* (2012),
[link](https://journals.physiology.org/doi/full/10.1152/japplphysiol.01024.2011):
BC oVEMP peaks at **80–150 Hz** (mastoid), **50–125 Hz** (forehead). And with
**air** conduction, *Exp Brain Res* 2016 found **no separate 100 Hz peak** for
the cVEMP.

**Air-conducted** otolith tuning is a different animal:

| Population | Peak VEMP frequency |
|---|---|
| Young adults | **~500 Hz** |
| Adults ≥ 60 | 750–1000 Hz |

Sources: Curthoys & Dlugaiczyk, *"Physiology, clinical evidence and diagnostic
relevance of sound-induced and vibration-induced vestibular stimulation"*,
**Curr Opin Neurol** 33(1):126–135 (2020) —
[PubMed 31789675](https://pubmed.ncbi.nlm.nih.gov/31789675/) ·
doi:10.1097/WCO.0000000000000770 · *"Multi-frequency VEMPs improve detection of
present otolith responses in bilateral vestibulopathy"*, **Front Neurol**
15:1336848 (2024) —
[Frontiers](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1336848/full) ·
Piker et al. —
[PMC3748259](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3748259/).

⚠️ **Do NOT overcorrect to 500 Hz.** The Curthoys review frames sound/vibration
vestibular stimulation as **purely diagnostic** — zero therapeutic or
motion-sickness content. 500 Hz is the best *diagnostic* frequency. That is a
different question. Verifiers **refuted (0–3)** every attempt to turn this into
"therefore use 500 Hz."

So: the citation chain *"the vestibular system is tuned to 100 Hz, therefore play
100 Hz in headphones"* is **invalid**. But this does **not** prove air-conducted
100 Hz is inert — Nagoya's claim rests on their own air-conducted experiment, not
on Todd.

---

## 4. Sound-pressure levels — what's reachable

| Threshold | Level |
|---|---|
| Nagoya tone | **60.9–65.9 dBA** ✅ reachable & safe |
| WHO safe listening | 80 dBA / 40 h weekly |
| EN 50332 consumer personal-audio cap | ~100 dBA |
| cVEMP threshold (air, insert earphones) | ~**113 dB SPL** ([PMC6275136](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6275136/)) |
| oVEMP threshold | ~115 dB SPL ([PMC6275136](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6275136/)) |
| Clinical VEMP practice (10–15 dB above threshold) | **130–135 dB peak SPL** ([PMC8275207](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8275207/)) |

**Frank air-conducted otolith activation (VEMP-style) is a hardware and safety
impossibility on a phone**, not a marginal call.

⚠️ **Scope caveat:** those 113–130 dB figures come from **diagnostic VEMP**
literature, **not** from Nagoya. They do **not** show the 61–66 dBA Nagoya tone
is too quiet to do anything — the proposed otoconia mechanism is not the VEMP
reflex pathway. They establish only that the *VEMP* route is out of reach.

---

## 5. Ranking of interventions by strength of human evidence

| # | Intervention | Human evidence | App-deliverable? |
|---|---|---|---|
| 1 | **Galvanic vestibular stimulation (GVS)** + inverse-phase rotatory chair | Randomized **sham-controlled** trial, n=30 — [Gutkovich et al. 2022](https://link.springer.com/article/10.1007/s00221-021-06263-w) | ❌ Clinic hardware, electrical, not acoustic |
| 2 | **100 Hz tone (Nagoya)** | n=82, self-controlled, unblinded, unreplicated — [PMC11955832](https://pmc.ncbi.nlm.nih.gov/articles/PMC11955832/) | ⚠️ Only for **speakers + before motion** |
| 3 | **Pleasant/joyful music**, post-onset | n=30 simulator study, **power ≈ 29 %** — [PMC12440958](https://pmc.ncbi.nlm.nih.gov/articles/PMC12440958/) | ✅ Via headphones |
| — | Acoustic vestibular **noise** stimulation, white/pink noise, **binaural beats** | **No human motion-sickness evidence located** | — |

### GVS caveats (why it's not simply "the winner")

Gutkovich YE, Lagami D, Jamison A, Fonar Y, **Tal D** — *"Galvanic vestibular
stimulation as a novel treatment for seasickness"*, **Exp Brain Res** 240(1):
327–334 (2022; epub 15 Nov 2021) —
[Springer](https://link.springer.com/article/10.1007/s00221-021-06263-w) ·
[PubMed 34782915](https://pubmed.ncbi.nlm.nih.gov/34782915/) ·
[NCT05004818](https://clinicaltrials.gov/study/NCT05004818)

n=30 (~15/arm), **single**-blind, single-centre Israeli Navy population of
chronically seasick sailors (poor generalization to car sickness),
**retrospectively registered** (10 Aug 2021), no results posted, unreplicated.

### Music study — read the baseline
*Front Hum Neurosci* 2025 (PMC12440958), n=30, 64-ch EEG, driving simulator,
60 s of music via **headphones** in a post-onset "modulation stage":

| Condition | Symptom reduction |
|---|---|
| Joyful music | 57.3 % |
| Soft music | 56.7 % |
| **Natural recovery (do nothing)** | **43.3 %** |
| **Sad music** | **40.0 %** — *worse than doing nothing* |

⚠️ The press headline *"joyful music reduces motion sickness by 57 %"* is
**meaningless without the 43.3 % do-nothing baseline** — the real margin is
~13–14 percentage points. Authors report **power ≈ 29 %**, and the paper does
**not** establish a significant music-vs-control difference on those percentages
(the reported inferential statistic is an EEG-complexity correlation,
r = −0.625, p < 0.05). Age band 20–30, simulator sickness (not real vehicle
motion), unreplicated. **Do not repeat the 57 % figure.**

Useful signal that survives: **emotional valence matters** — sad/melancholy audio
may make things worse. Design for calm and pleasant.

---

## 6. Claims that were REFUTED in verification — do not re-introduce

| Refuted claim | Vote |
|---|---|
| "The 100 Hz effect **requires** intact otoconia in the utricle" (over-strict mechanistic phrasing) | 0–3 |
| "Carriers near 100 Hz (109/209 Hz) are a validated binaural-beat design pattern" | 0–3 |
| "Joyful (57.3 %) and soft (56.7 %) music **objectively** exceed control" | 0–3 |
| "500 Hz is the frequency with an established air-conducted route to the otoliths, therefore use it" | 0–3 |
| "Clinical air-conducted VEMP uses 500/750/1000/2000 Hz, therefore 100 Hz air conduction does nothing" | 0–3 |
| "100 Hz stimulation targets irregular **semicircular canal** afferents, not otoliths" | 0–3 |

---

## 7. Open questions (genuinely unanswered)

- Can consumer earbuds reproduce **80–85 dBZ at 100 Hz** at the eardrum? Does
  air-conduction-only delivery reproduce **any** of the effect when the original
  stimulus was near-field speakers that may have coupled whole-head vibration?
  **Untested by anyone.**
- Does the tone do anything **during** motion / continuously, rather than as a
  1-minute pre-exposure? The app's original core use case depended on this.
- Would a **bone-conduction headset** (Shokz-type) be a better transducer match?
  It fits the vestibular tuning literature far better — but there is **zero**
  human motion-sickness data for it.
- Is the noise-stimulation / binaural-beat field genuinely empty, or did the
  review just not surface it? A dedicated negative search would be needed.
- **How much of the effect is placebo?** The human trials were self-controlled
  and not double-blind; motion sickness is highly suggestible and self-reported.
  A sham-tone arm (e.g. the 250 Hz control used in the animal work) has **never
  been run in humans**.

---

## 8. Time-sensitivity

The Nagoya paper is ~16 months old. A replication — or a failure to replicate —
could land at any time and would move all of this substantially. The music paper
is under a year old and unreplicated. **Re-check before any claim-bearing
release.**

---

## Sources

### The 100 Hz claim
- Kagawa, Ohgami, Kato et al. — *"Just 1-min exposure to a pure tone at 100 Hz with daily exposable sound pressure levels may improve motion sickness"*, **Environ Health Prev Med** 30:24-00247 (2025).
  [PMC11955832](https://pmc.ncbi.nlm.nih.gov/articles/PMC11955832/) ·
  [J-STAGE](https://www.jstage.jst.go.jp/article/ehpm/30/0/30_24-00247/_article) ·
  [ResearchGate PDF](https://www.researchgate.net/publication/390138520_Just_1-min_exposure_to_a_pure_tone_at_100_Hz_with_daily_exposable_sound_pressure_levels_may_improve_motion_sickness)
- Xu, Ohgami et al. — *"Improvement of balance in young adults by a sound component at 100 Hz in music"*, **Sci Rep** 8:17158 (2018). *Same lab; observational, n=110.*
  [Nature](https://www.nature.com/articles/s41598-018-35244-3) ·
  [PMC6237978](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6237978/)

### Vestibular tuning (why the 100 Hz citation chain is a modality mismatch)
- Todd, Rosengren & Colebatch — *"Tuning and sensitivity of the human vestibular system to low-frequency vibration"*, **Neurosci Lett** 444:36–41 (2008). *Bone conduction.*
  [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0304394008011130) ·
  [PubMed 19146919](https://pubmed.ncbi.nlm.nih.gov/19146919/)
- Govender, Rosengren & Colebatch — **J Appl Physiol** (2012). *BC oVEMP tuning.*
  [Physiology.org](https://journals.physiology.org/doi/full/10.1152/japplphysiol.01024.2011)
- Curthoys — **Front Neurol** 9:481 (2018). *AC otolith afferent tuning 500–3000 Hz.*
  [Frontiers](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2018.00481/full)
- Curthoys & Dlugaiczyk — *"Physiology, clinical evidence and diagnostic relevance of sound-induced and vibration-induced vestibular stimulation"*, **Curr Opin Neurol** 33(1):126–135 (2020). *Framed as diagnostic only — no therapeutic claim.*
  [PubMed 31789675](https://pubmed.ncbi.nlm.nih.gov/31789675/) · doi:10.1097/WCO.0000000000000770
- *"Multi-frequency VEMPs improve detection of present otolith responses in bilateral vestibulopathy"*, **Front Neurol** 15:1336848 (2024). *AC VEMP set = 500/750/1000/2000 Hz.*
  [Frontiers](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1336848/full)
- Piker et al. — *VEMP frequency × age interaction.*
  [PMC3748259](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3748259/)

### VEMP threshold SPL (why headphone otolith activation is out of reach)
- [PMC6275136](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6275136/) — cVEMP ~113 dB SPL, oVEMP ~115 dB SPL
- [PMC8275207](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8275207/) — clinical practice 130–135 dB peak SPL

### Competing interventions
- Gutkovich, Lagami, Jamison, Fonar & Tal — *"Galvanic vestibular stimulation as a novel treatment for seasickness"*, **Exp Brain Res** 240(1):327–334 (2022; epub Nov 2021).
  [Springer](https://link.springer.com/article/10.1007/s00221-021-06263-w) ·
  [PubMed 34782915](https://pubmed.ncbi.nlm.nih.gov/34782915/) ·
  [NCT05004818](https://clinicaltrials.gov/study/NCT05004818)
- Music & motion sickness, **Front Hum Neurosci** (2025), n=30, EEG + driving simulator.
  [PMC12440958](https://pmc.ncbi.nlm.nih.gov/articles/PMC12440958/)

### Secondary coverage — hedges less than the primary paper; treat with care
- [SciTechDaily](https://scitechdaily.com/scientists-discover-unique-100-hz-sound-that-alleviates-motion-sickness/)
- [MedicalXpress](https://medicalxpress.com/news/2025-04-therapy-effectively-motion-sickness-ear.html)
- [ScienceDaily](https://www.sciencedaily.com/releases/2025/04/250404122627.htm)
- [New Atlas](https://newatlas.com/medical-tech/sound-spice-tone-motion-sickness/)
