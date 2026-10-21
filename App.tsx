// tslint:disable
/* eslint-disable */
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Database,
  Flame,
  HelpCircle,
  History,
  Layers,
  Lightbulb,
  Music,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Wand2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getConfig} from './constants';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  drawBackground,
  gameAudio,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  shuffle,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  useRpc,
} from './utils/usePlayground';

const BACKGROUND_MUSIC_URL = 'assets/audio/bgm_analog_folk_mystery.mp3';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type PuzzleType = 'HOMOPHONE' | 'LETTER_CIPHER' | 'SYNONYM_MATRIX';

export interface PuzzleDilemma {
  id: string;
  type: PuzzleType;
  prompt: string;
  sentenceBefore: string;
  sentenceAfter: string;
  options?: string[]; // Raw options list (shuffled dynamically during gameplay)
  correctAnswer: string;
  explanation: string;
  etymologyHint: string;
  wardenComment: string;
  difficulty: Difficulty[];
  synonymTargetWord?: string;
  synonymNuance?: string;
}

export interface ChapterStoryLore {
  chapterIndex: number;
  title: string;
  subtitle: string;
  tallTaleName: string;
  loreIntro: string;
  loreVictory: string;
  themeColor: string;
}

export interface LessonModalData {
  status: 'correct' | 'incorrect' | 'study';
  puzzle: PuzzleDilemma;
  userChoice?: string;
  speedBonus?: number;
  pointsEarned?: number;
  solveTimeSeconds?: number;
}

export interface HighScoreRecord {
  id: string;
  difficulty: Difficulty;
  score: number;
  chaptersCleared: number;
  totalTimeSeconds: number;
  accuracyPercent: number;
  date: string;
}

// 20 Progressive Chapters of American Frontier Tall Tales & Linguistic Lore
export const CHAPTER_LORE_DATABASE: ChapterStoryLore[] = [
  {
    chapterIndex: 1,
    title: 'Chapter I: The Coyote Den',
    subtitle: 'Baby Pecos Bill & The Wild Pack',
    tallTaleName: 'Raised by Coyotes',
    loreIntro:
      'The infant Bill tumbled from the wagon near the Pecos River and was taken in by a pack of desert coyotes, learning their primal howl and keen frontier instincts.',
    loreVictory:
      'Young Bill learned to converse with prairie beasts and out-howl the full moon, mastering the primordial syntax of the wilderness!',
    themeColor: '#d97706',
  },
  {
    chapterIndex: 2,
    title: 'Chapter II: The Scaled Rawhide',
    subtitle: 'The Coiled Rattler Weapon',
    tallTaleName: 'Rattlesnake Whip',
    loreIntro:
      'When an eight-foot diamondback snake tried to ambush him, Bill wrestled the serpent until it yielded and agreed to serve as his lightning-fast bullwhip.',
    loreVictory:
      'With a supersonic snap of the serpentine whip, Bill split thunderclouds and calibrated the analog frequencies of the desert range!',
    themeColor: '#10b981',
  },
  {
    chapterIndex: 3,
    title: 'Chapter III: The Untamable Bronco',
    subtitle: 'Widow-Maker & The Fiery Mesa',
    tallTaleName: 'Taming the Widow-Maker Stallion',
    loreIntro:
      'A ferocious black stallion named Widow-Maker threw every cowboy who dared mount him into orbit until Bill challenged the beast upon the jagged rimrock.',
    loreVictory:
      'Bill rode Widow-Maker through fire and sandstone gorges until steed and rider forged an unshakeable bond across the boundless prairie.',
    themeColor: '#ef4444',
  },
  {
    chapterIndex: 4,
    title: 'Chapter IV: The Howling Vortex',
    subtitle: 'Lassoing the Great Oklahoma Twister',
    tallTaleName: 'Lassoing the Cyclone',
    loreIntro:
      'A monstrous F5 tornado tore through the panhandle. Bill climbed to the highest ridge, spun his rattlesnake lasso, and roped the storm by its swirling neck!',
    loreVictory:
      'Spurring the tempest like a bucking bronco, Bill squeezed every drop of rain onto parched crops before dismounting upon a lightning bolt.',
    themeColor: '#3b82f6',
  },
  {
    chapterIndex: 5,
    title: 'Chapter V: The Great Chasm',
    subtitle: 'Spurring the Red Sandstone',
    tallTaleName: 'Carving the Grand Canyon',
    loreIntro:
      'While sliding down the bucking storm across northern Arizona, Bill’s colossal silver spurs gouged deep into the ancient red earth.',
    loreVictory:
      'The mile-deep fissure carved the glorious Grand Canyon, exposing crystalline geological strata to the eternal golden sunlight!',
    themeColor: '#f97316',
  },
  {
    chapterIndex: 6,
    title: 'Chapter VI: The River of Gold',
    subtitle: 'Dredging the Southern Border',
    tallTaleName: 'Digging the Rio Grande',
    loreIntro:
      'During a scorching drought, the frontier ran bone dry. Bill seized an iron skillet and a giant auger to channel fresh mountain waters.',
    loreVictory:
      'Water surged hundreds of miles into the gulf, forming the mighty Rio Grande and quenching the thirst of millions of longhorn cattle.',
    themeColor: '#06b6d4',
  },
  {
    chapterIndex: 7,
    title: 'Chapter VII: The Cougar Saddle',
    subtitle: 'Riding the Ghost of the High Peaks',
    tallTaleName: 'The Mountain Lion Saddle',
    loreIntro:
      'High in the Rocky Mountains, a fourteen-foot mountain lion leaped at Bill. He dodged, threw a wool blanket across its spine, and cinched down his saddle.',
    loreVictory:
      'The cougar purred like an avalanche! Together they bounded over 50-foot chasms at breathtaking velocity.',
    themeColor: '#8b5cf6',
  },
  {
    chapterIndex: 8,
    title: 'Chapter VIII: Celestial Marksman',
    subtitle: 'Shooting Falling Stars from Midnight Skies',
    tallTaleName: 'Shooting Falling Stars',
    loreIntro:
      'When night fell so pitch-dark that the stars collided with treetops, Bill drew his six-shooters to orchestrate celestial light across the prairie.',
    loreVictory:
      'Every silver bullet shattered rogue meteorites into twinkling constellations that guide night-riders safely home forever.',
    themeColor: '#eab308',
  },
  {
    chapterIndex: 9,
    title: 'Chapter IX: The River Maiden',
    subtitle: 'Slue-Foot Sue & The Colossal Catfish',
    tallTaleName: 'Slue-Foot Sue & the Giant Catfish',
    loreIntro:
      'Slue-Foot Sue was the bravest cowgirl in the West, famous for riding a 200-pound Rio Grande catfish bareback up roaring waterfalls.',
    loreVictory:
      'Sue vaulted from the giant catfish into the saddle of Widow-Maker in her bridal gown, bounding clear over the full harvest moon!',
    themeColor: '#ec4899',
  },
  {
    chapterIndex: 10,
    title: 'Chapter X: The Golden Cassette',
    subtitle: "The Tape Warden's Eternal Master Tape",
    tallTaleName: 'The Golden Cassette Legend',
    loreIntro:
      'At the epicenter of the magnetic realm stands the ancient vacuum-tube deck. The Tape Warden places the legendary solid-gold reel upon the spindle.',
    loreVictory:
      'Flawless harmonic alignment achieved! The first epoch of frontier folklore is deciphered into gleaming gold oxide.',
    themeColor: '#fbbf24',
  },
  {
    chapterIndex: 11,
    title: 'Chapter XI: The Fleet-Footed Phantom',
    subtitle: 'The Texas Jackrabbit Chase',
    tallTaleName: 'The Texas Jackrabbit Chase',
    loreIntro:
      'Outrunning a gust of wind, a giant jackrabbit challenged Bill to a high-noon race across the Llano Estacado salt flats.',
    loreVictory:
      'With bounds that defied gravity, Bill matched the hare stride for stride, proving human wit and frontier stamina unbeatable!',
    themeColor: '#14b8a6',
  },
  {
    chapterIndex: 12,
    title: 'Chapter XII: The Steaming Behemoth',
    subtitle: 'Man vs The Iron Horse',
    tallTaleName: 'The Iron Horse Race',
    loreIntro:
      'When the first transcontinental steam locomotive puffed into the territory, Bill challenged the iron titan to a hundred-mile race on foot.',
    loreVictory:
      'Bill crossed the finish line smoking a pipe while the overheated steam engine blew its gasket, establishing organic frontier supremacy!',
    themeColor: '#64748b',
  },
  {
    chapterIndex: 13,
    title: 'Chapter XIII: The Howling Frost',
    subtitle: 'The Great Blizzard of Deadwood',
    tallTaleName: 'The Great Blizzard of Deadwood',
    loreIntro:
      'A sub-zero polar vortex froze spoken words solid in mid-air! Bill had to thaw sentences over campfires to hear what folks were saying.',
    loreVictory:
      'Bill gathered the frozen ice-syllables and organized them into pristine lexicographical order before the spring thaw arrived!',
    themeColor: '#38bdf8',
  },
  {
    chapterIndex: 14,
    title: 'Chapter XIV: The Stone Grove',
    subtitle: 'The Petrified Forest Riddle',
    tallTaleName: 'The Petrified Forest Riddle',
    loreIntro:
      'Ancient trees turned to sparkling agate and jasper when an ancient spell froze the woods. Bill studied the silent stone rings to read the land’s history.',
    loreVictory:
      'By deciphering the petrified glyphs, Bill unlocked ancient geological dialects preserved in pure quartz and amethyst!',
    themeColor: '#a855f7',
  },
  {
    chapterIndex: 15,
    title: 'Chapter XV: The Beaded Reptile',
    subtitle: 'The Gila Monster Gambol',
    tallTaleName: 'The Gila Monster Gambol',
    loreIntro:
      'Deep in the Sonoran desert, a venomous beaded lizard guarded the secret spring of mineral restorative tonics.',
    loreVictory:
      'Bill danced a two-step with the beaded lizard, exchanging tall tales until the creature granted safe passage and medicinal remedies.',
    themeColor: '#ea580c',
  },
  {
    chapterIndex: 16,
    title: 'Chapter XVI: The Wall of Fire',
    subtitle: 'The Prairie Fire Stampede',
    tallTaleName: 'The Prairie Fire Stampede',
    loreIntro:
      'A wall of flames fifty feet high surged across dry grasslands. Bill led ten thousand longhorn steers safely through the roaring inferno.',
    loreVictory:
      'Using his Stetson to fan back the blaze and digging trenches with his boots, Bill steered the whole herd onto lush green river pastures!',
    themeColor: '#dc2626',
  },
  {
    chapterIndex: 17,
    title: 'Chapter XVII: The Spectral Saloon',
    subtitle: 'The Echoing Ghost Town',
    tallTaleName: 'The Echoing Ghost Town',
    loreIntro:
      'In an abandoned silver boomtown where phantom piano music drifted on the breeze, Bill played a game of poker with friendly pioneer spirits.',
    loreVictory:
      'Bill won every hand with four aces of syntax, laying the restless memories of the boomtown to peaceful eternal slumber.',
    themeColor: '#6366f1',
  },
  {
    chapterIndex: 18,
    title: 'Chapter XVIII: The Bubbling Cauldron',
    subtitle: 'The Sourdough Geyser',
    tallTaleName: 'The Sourdough Geyser',
    loreIntro:
      'Bill accidentally dropped his 50-year-old sourdough starter into an active geothermal hot spring, creating a geyser that erupted warm biscuits!',
    loreVictory:
      'The geyser fed three entire territories for a whole winter with golden flaky biscuits drenched in wild clover honey!',
    themeColor: '#f59e0b',
  },
  {
    chapterIndex: 19,
    title: 'Chapter XIX: The Cosmic Ribbons',
    subtitle: 'The Northern Lights Lasso',
    tallTaleName: 'The Northern Lights Lasso',
    loreIntro:
      'When winter nights stretched dark and dreary, Bill hurled his lasso into the stratosphere to rope the dancing green and violet aurora borealis.',
    loreVictory:
      'Bill draped the shimmering aurora ribbons across the frontier mountain peaks, turning dark midnight into glorious emerald dawn!',
    themeColor: '#22c55e',
  },
  {
    chapterIndex: 20,
    title: 'Chapter XX: The Master Spool Convergence',
    subtitle: 'The Ultimate Frontier Myth',
    tallTaleName: 'The Master Spool Convergence',
    loreIntro:
      'All twenty reels of American folklore harmonize at the Great Magnetic Spool of Eternity. The Tape Warden steps aside to crown the Ultimate Lexicographer!',
    loreVictory:
      'SUPREME TRANSCENDENCE! All 20 folklore chapters are immortalized in the Golden Magnetic Vault. You stand as the Sovereign Grand Master of Language & Legend!',
    themeColor: '#eab308',
  },
];

// COMPREHENSIVE 250+ QUESTION VAULT ACROSS ALL 20 CHAPTERS & DIFFICULTIES
export const QUESTION_POOL: Record<number, PuzzleDilemma[]> = {
  // ================= CHAPTER 1: THE COYOTE DEN =================
  1: [
    {
      id: 'c1_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose the correct word for physical location vs ownership:',
      sentenceBefore: 'The coyote pups gathered around',
      sentenceAfter: 'den to listen to the baby boy howl.',
      options: ['there', 'their', "they're"],
      correctAnswer: 'their',
      explanation:
        "'Their' indicates possession (belonging to the coyotes), while 'there' is location and 'they\'re' is 'they are'.",
      etymologyHint: "Possessive pronoun: belongs to them (spelled with an 'i').",
      wardenComment:
        'Listen close to the pack... ownership and place sound identical in the desert breeze!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c1_e2',
      type: 'HOMOPHONE',
      prompt: 'Choose possessive pronoun vs contraction (it is):',
      sentenceBefore: 'The wild pack welcomed the infant as one of',
      sentenceAfter: 'own beneath the desert moon.',
      options: ['its', "it's"],
      correctAnswer: 'its',
      explanation:
        "'Its' is possessive without an apostrophe. 'It\'s' is the contraction of 'it is'.",
      etymologyHint: "Test replacement: '...one of IT IS own' is grammatically invalid.",
      wardenComment: 'No apostrophe needed when claiming kin in the wilderness!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c1_e3',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the name of the desert canine pack:',
      sentenceBefore: 'Bill grew strong amongst the clever',
      sentenceAfter: 'roaming the moonlit sagebrush.',
      correctAnswer: 'COYOTE',
      explanation:
        "C-O-Y-O-T-E: From Nahuatl 'coyotl', the native American prairie wolf.",
      etymologyHint: 'Native North American canine famed for nocturnal choruses.',
      wardenComment: 'Letters are buried in the red dust! Reveal the desert predator.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c1_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the archaic / elevated synonym for "FEARLESS / BRAVE":',
      sentenceBefore: 'Even as a toddler, Bill was an',
      sentenceAfter: 'adventurer who feared no desert beast.',
      options: ['intrepid', 'craven', 'timorous', 'hesitant'],
      correctAnswer: 'intrepid',
      explanation:
        "'Intrepid' (from Latin trepidus = alarmed) means completely fearless and dauntless.",
      etymologyHint: "Prefix 'in-' (not) + 'trepidus' (trembling/alarmed).",
      wardenComment: 'Match the fearless pioneer spirit with an elevated SAT synonym!',
      difficulty: ['EASY', 'MEDIUM'],
      synonymTargetWord: 'FEARLESS',
      synonymNuance: 'Dauntless fortitude in wilderness danger',
    },
    {
      id: 'c1_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose bare (uncovered) vs bear (endure / wild animal):',
      sentenceBefore: 'Bill wrestled cactus thorns with his',
      sentenceAfter: 'hands without shedding a single tear.',
      options: ['bare', 'bear'],
      correctAnswer: 'bare',
      explanation:
        "'Bare' means uncovered or naked. 'Bear' is the mammal or the verb meaning to endure/carry.",
      etymologyHint: 'Bare skin vs grizzly bear.',
      wardenComment: 'Uncovered hands in the briars! Strip away the extra vowel.',
      difficulty: ['MEDIUM'],
    },
    {
      id: 'c1_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the term for native wilderness creatures:',
      sentenceBefore: 'Bill formed a primal bond with the wild',
      sentenceAfter: 'of the Pecos riverbank.',
      correctAnswer: 'FAUNA',
      explanation:
        "F-A-U-N-A: Animal life of a particular region or habitat (Roman goddess of animals).",
      etymologyHint: 'Latin term for the collective animal life of a territory.',
      wardenComment: 'Assemble the ancient biological label for prairie beasts.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c1_syn2',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the formal synonym for "STUBBORN / PERSISTENT":',
      sentenceBefore: 'The young boy showed a',
      sentenceAfter: 'determination to learn every animal dialect.',
      options: ['tenacious', 'vacillating', 'ephemeral', 'pliable'],
      correctAnswer: 'tenacious',
      explanation:
        "'Tenacious' (Latin tenere = to hold) means holding fast; persistently stubborn and resolute.",
      etymologyHint: "Latin 'tenax' (holding fast, gripping firmly).",
      wardenComment: 'Find the word that holds tight to its purpose like a wolf jaw!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'PERSISTENT',
      synonymNuance: 'Unyielding persistence and firm resolve',
    },
    {
      id: 'c1_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Apposite (pertinent/fitting) vs Opposite (contrary):',
      sentenceBefore: 'The elder coyote’s instincts were highly',
      sentenceAfter: 'to the boy’s survival in the harsh wilderness.',
      options: ['apposite', 'opposite'],
      correctAnswer: 'apposite',
      explanation:
        "'Apposite' means highly appropriate, relevant, or suitable. 'Opposite' means contrary.",
      etymologyHint: "From Latin 'appositus' (placed near, suitable).",
      wardenComment: 'A subtle distinction of diction! Does the trait fit suitably or oppose?',
      difficulty: ['HARD'],
    },
    {
      id: 'c1_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (unformed/rudimentary state):',
      sentenceBefore: 'In that den, Bill developed his',
      sentenceAfter: 'understanding of human speech.',
      correctAnswer: 'INCHOATE',
      explanation:
        "I-N-C-H-O-A-T-E: Just begun and so not fully formed or developed; rudimentary.",
      etymologyHint: "From Latin 'inchoare' (to begin, start a web upon a loom).",
      wardenComment: 'A true GRE masterword! Reveal the nascent, rudimentary cipher.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 2: THE SCALED RAWHIDE =================
  2: [
    {
      id: 'c2_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose unfastened/loose vs suffer a loss (lose):',
      sentenceBefore: 'Bill never let his fingers slip and',
      sentenceAfter: 'his grasp on the hissing tail.',
      options: ['lose', 'loose'],
      correctAnswer: 'lose',
      explanation:
        "'Lose' means to misplace or suffer loss. 'Loose' means unbound or not tight.",
      etymologyHint: "'Lose' rhymes with 'choose'; 'loose' rhymes with 'goose'.",
      wardenComment: 'Hold tight! One errant vowel drops your score into the canyon.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c2_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the venomous coiled reptilian partner:',
      sentenceBefore: 'Bill tamed the buzzing green',
      sentenceAfter: 'to serve as his trusty frontier whip.',
      correctAnswer: 'RATTLESNAKE',
      explanation:
        'R-A-T-T-L-E-S-N-A-K-E: Pit viper equipped with keratin tail segments.',
      etymologyHint: 'Venomous pit viper named for the warning sound at its tail.',
      wardenComment: 'Watch the fangs! Piece together the scaled lasso.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c2_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "LETHAL / DEADLY POISONOUS":',
      sentenceBefore: 'The serpent’s bite was renowned for its',
      sentenceAfter: 'potency across the territory.',
      options: ['pernicious', 'innocuous', 'salubrious', 'benign'],
      correctAnswer: 'pernicious',
      explanation:
        "'Pernicious' (Latin pernicies = ruin/destruction) means having a gradual, destructive, and deadly effect.",
      etymologyHint: "Latin 'pernicies' (slaughter, destruction).",
      wardenComment: 'Distinguish mortal venom from harmless or healthy conditions!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'DEADLY',
      synonymNuance: 'Causing insidious harm or mortal ruin',
    },
    {
      id: 'c2_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose verb (influence/action) vs noun (result/outcome):',
      sentenceBefore: 'A single snap of the serpent whip could directly',
      sentenceAfter: 'the trajectory of a charging steer.',
      options: ['affect', 'effect'],
      correctAnswer: 'affect',
      explanation:
        "'Affect' is predominantly a verb meaning to influence. 'Effect' is a noun meaning result.",
      etymologyHint: "A = Action (verb). 'Affect' brings about change.",
      wardenComment: 'Channel kinetic energy! The verb drives the whip crack.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c2_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the flexible leather frontier implement:',
      sentenceBefore: 'The serpent obeyed Bill as a lethal',
      sentenceAfter: 'snapping at supersonic speed.',
      correctAnswer: 'BULLWHIP',
      explanation:
        'B-U-L-L-W-H-I-P: A heavy braided rawhide whip designed for livestock control.',
      etymologyHint: 'Braided leather lashing whip with a heavy handle and cracker.',
      wardenComment: 'Spooling rawhide ribbons! Decipher the cowboy weapon.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c2_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Flout (scorn/disregard openly) vs Flaunt (show off ostentatiously):',
      sentenceBefore: 'The outlaw band dared to',
      sentenceAfter: 'the territorial law until Bill cracked his rattlesnake whip.',
      options: ['flout', 'flaunt'],
      correctAnswer: 'flout',
      explanation:
        "'Flout' means to openly disregard or disobey a rule/law. 'Flaunt' means to show off ostentatiously.",
      etymologyHint: 'Flout = defy rules; Flaunt = display wealth/feathers.',
      wardenComment: 'Do not conflate defiant disobedience with arrogant showmanship!',
      difficulty: ['HARD'],
    },
    {
      id: 'c2_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the stubborn, resisting descriptor (GRE Masterword):',
      sentenceBefore: 'Bill subdued the violently',
      sentenceAfter: 'pit viper with his bare fists.',
      correctAnswer: 'RECALCITRANT',
      explanation:
        "R-E-C-A-L-C-I-T-R-A-N-T: Having an obstinately uncooperative attitude toward authority (Latin 'calcitrare' = to kick with heels).",
      etymologyHint: "From Latin for 'kicking back with the heels'—stubbornly defiant.",
      wardenComment: 'A colossal 12-letter trial! Reconstruct this unyielding cipher.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 3: THE UNTAMABLE BRONCO =================
  3: [
    {
      id: 'c3_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose rein (leather strap) vs rain (precipitation) vs reign (rule):',
      sentenceBefore: 'Bill yanked on the leather',
      sentenceAfter: 'to pull Widow-Maker’s snout down.',
      options: ['rein', 'rain', 'reign'],
      correctAnswer: 'rein',
      explanation:
        "'Rein' is a harness strap. 'Rain' is water from clouds. 'Reign' is the rule of a monarch.",
      etymologyHint: 'Reins hold the horse; Sovereign reigns; Storm clouds rain.',
      wardenComment: 'Grab the rawhide straps, not a storm cloud or royal throne!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c3_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the legendary untamed warhorse:',
      sentenceBefore: 'None could ride the furious black',
      sentenceAfter: 'across the jagged canyon ridges until Bill stepped up.',
      correctAnswer: 'STALLION',
      explanation:
        'S-T-A-L-L-I-O-N: An uncastrated adult male horse noted for fiery spirit.',
      etymologyHint: 'Adult male steed known for immense power and fierce spirit.',
      wardenComment: 'Hooves strike sparks on the mountain rock! Decipher the beast.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c3_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the archaic synonym for "AGGRESSIVE / EAGER TO FIGHT":',
      sentenceBefore: 'The black stallion possessed a',
      sentenceAfter: 'temperament that repelled every other cowboy.',
      options: ['bellicose', 'pacific', 'conciliatory', 'docile'],
      correctAnswer: 'bellicose',
      explanation:
        "'Bellicose' (from Latin bellum = war) means demonstrating aggression and willingness to fight.",
      etymologyHint: "Latin 'bellicosus' (warlike, martial).",
      wardenComment: 'Select the Latinate synonym of combative wrath!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'WARLIKE',
      synonymNuance: 'Combative and belligerent hostility',
    },
    {
      id: 'c3_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose complement (enhances/completes) vs compliment (praise):',
      sentenceBefore: 'The stallion’s ebony coat was the ultimate',
      sentenceAfter: 'to the fiery crimson mesa sunset.',
      options: ['complement', 'compliment'],
      correctAnswer: 'complement',
      explanation:
        "'Complement' (with 'e') means to complete or pair beautifully. 'Compliment' (with 'i') means verbal flattery.",
      etymologyHint: "ComplEment with 'E' completes the aesthetic ensemble.",
      wardenComment: 'Does the stallion praise the sunset or match it in perfection?',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c3_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the bucking bronco term:',
      sentenceBefore: 'The horse leaped with vicious',
      sentenceAfter: 'trying to dislodge its rider.',
      correctAnswer: 'FEROCITY',
      explanation:
        'F-E-R-O-C-I-T-Y: The state or quality of being fierce, savage, or relentless.',
      etymologyHint: 'From Latin ferocitas, savage and untamed intensity.',
      wardenComment: 'Eight letters of untamed equestrian wrath!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c3_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Proscribe (forbid/banish) vs Prescribe (order/recommend):',
      sentenceBefore: 'The town elders sought to',
      sentenceAfter: 'riding Widow-Maker anywhere near civilized settlements.',
      options: ['proscribe', 'prescribe'],
      correctAnswer: 'proscribe',
      explanation:
        "'Proscribe' means to prohibit, forbid, or condemn officially. 'Prescribe' means to authorize medical remedy.",
      etymologyHint: 'Proscribe = outlaw/condemn; Prescribe = mandate medicine.',
      wardenComment: 'Did the council outlaw the wild stallion or write it a medical dosage?',
      difficulty: ['HARD'],
    },
    {
      id: 'c3_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE adjective for stubbornly unyielding:',
      sentenceBefore: 'The stallion remained',
      sentenceAfter: 'until Bill matched its unbridled willpower.',
      correctAnswer: 'OBDURATE',
      explanation:
        "O-B-D-U-R-A-T-E: Stubbornly refusing to change one's opinion or course of action.",
      etymologyHint: "From Latin 'obdurare' (to harden against).",
      wardenComment: 'Hard as volcanic basalt! Reconstruct this unyielding eight-letter trial.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 4: THE HOWLING VORTEX =================
  4: [
    {
      id: 'c4_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose past tense verb (guided) vs metallic chemical element (lead):',
      sentenceBefore: 'With rawhide ropes, Bill',
      sentenceAfter: 'the howling twister across the drought-stricken valley.',
      options: ['led', 'lead'],
      correctAnswer: 'led',
      explanation:
        "'Led' is the past tense of 'lead'. 'Lead' (heavy metal) is pronounced identically.",
      etymologyHint: 'Past tense of lead is spelled with three letters: L-E-D.',
      wardenComment: 'Guide the twister into the dry plains with the true past tense.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c4_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the rotating meteorological tempest:',
      sentenceBefore: 'The spinning funnel of the raging',
      sentenceAfter: 'howled across thousands of square miles.',
      correctAnswer: 'CYCLONE',
      explanation:
        "C-Y-C-L-O-N-E: From Greek 'kyklon' (moving in a circle), a violent storm vortex.",
      etymologyHint: 'Violently rotating vortex of winds and thunderstorm clouds.',
      wardenComment: 'The spool is spinning with the vortex! Recover the glyphs.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c4_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "TURBULENT / CHAOTIC WHIRLPOOL":',
      sentenceBefore: 'Bill plunged directly into the howling',
      sentenceAfter: 'at the storm core.',
      options: ['maelstrom', 'halcyon', 'serenity', 'stagnation'],
      correctAnswer: 'maelstrom',
      explanation:
        "'Maelstrom' (Dutch malen = grind + stroom = stream) refers to a powerful violent whirlpool or disordered tumult.",
      etymologyHint: "Dutch 'maalstroom' (grinding current).",
      wardenComment: 'Pick the tempestuous whirlpool over tranquil waters!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'WHIRLPOOL',
      synonymNuance: 'Violently disordered vortex of forces',
    },
    {
      id: 'c4_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose peak (summit) vs peek (glance) vs pique (arouse interest):',
      sentenceBefore: 'Bill leaped atop the storm as it reached its violent',
      sentenceAfter: 'above the panhandle horizon.',
      options: ['peak', 'peek', 'pique'],
      correctAnswer: 'peak',
      explanation:
        "'Peak' is a top or summit. 'Peek' is a glance. 'Pique' means to provoke or stimulate.",
      etymologyHint: "Peak with 'ea' is the apex or mountain summit.",
      wardenComment: 'Look to the cresting zenith of the storm!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c4_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the atmospheric vortex phenomena:',
      sentenceBefore: 'Bill roped the violent roaring',
      sentenceAfter: 'with his rattlesnake lasso.',
      correctAnswer: 'TORNADO',
      explanation:
        'T-O-R-N-A-D-O: Rapidly rotating column of air extending from thunderstorm to ground.',
      etymologyHint: 'From Spanish tronada (thunderstorm), violent rotating funnel cloud.',
      wardenComment: 'Seven letters whipping through the thunderheads!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c4_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Tortuous (twisting/convoluted) vs Torturous (inflicting agony):',
      sentenceBefore: 'The cyclone followed a wildly',
      sentenceAfter: 'path across the prairie, twisting in erratic zigzags.',
      options: ['tortuous', 'torturous'],
      correctAnswer: 'tortuous',
      explanation:
        "'Tortuous' means full of twists, turns, and serpentine bends. 'Torturous' means agonizing.",
      etymologyHint: 'Tortuous = winding path; Torturous = causing torture.',
      wardenComment: 'The wind winds and twists! Pick the adjective of serpentine curves.',
      difficulty: ['HARD'],
    },
    {
      id: 'c4_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE adjective for calm, quiet, or motionless inactivity:',
      sentenceBefore: 'In the eye of the storm, the atmosphere was eerily',
      sentenceAfter: 'before the fury struck again.',
      correctAnswer: 'QUIESCENT',
      explanation:
        "Q-U-I-E-S-C-E-N-T: In a state or period of inactivity or dormancy (Latin 'quiescere' = to rest).",
      etymologyHint: 'From Latin root for quiet/rest—dormant and serene inside the vortex.',
      wardenComment: 'Nine glyphs of uncanny stillness at the heart of the maelstrom.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 5: THE GREAT CHASM =================
  5: [
    {
      id: 'c5_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose stationary (motionless) vs stationery (writing paper):',
      sentenceBefore: 'The towering cliff walls remained',
      sentenceAfter: 'as centuries of rushing waters carved the canyon floor.',
      options: ['stationary', 'stationery'],
      correctAnswer: 'stationary',
      explanation:
        "'Stationary' means remaining in one place. 'Stationery' is letter paper.",
      etymologyHint: "StationAry with 'A' = At rest. StationEry with 'E' = Envelopes.",
      wardenComment: 'The rock formations are frozen in stone, not written on paper!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c5_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the deep geological gorge:',
      sentenceBefore: 'The spurs carved out a magnificent red rock',
      sentenceAfter: 'that stretched for hundreds of breathtaking miles.',
      correctAnswer: 'CANYON',
      explanation:
        "C-A-N-Y-O-N: From Spanish 'cañón' (pipe/tube), a deep gorge with river.",
      etymologyHint: 'Deep gorge carved through sandstone with precipitous cliffs.',
      wardenComment: 'Chisel through the cliff face! Assemble the canyon name.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c5_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "VAST CHASM / BOTTOMLESS ABYSS":',
      sentenceBefore: 'The spur sliced a colossal',
      sentenceAfter: 'into the plateau.',
      options: ['abyss', 'knoll', 'mound', 'plateau'],
      correctAnswer: 'abyss',
      explanation:
        "'Abyss' (Greek abyssos = bottomless) designates a deep or seemingly bottomless chasm.",
      etymologyHint: "Greek 'a-' (without) + 'byssos' (bottom).",
      wardenComment: 'Choose the bottomless chasm over gentle hills!',
      difficulty: ['EASY', 'MEDIUM'],
      synonymTargetWord: 'CHASM',
      synonymNuance: 'Profoundly deep and bottomless geological rift',
    },
    {
      id: 'c5_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose counsel (advice/guidance) vs council (governing assembly):',
      sentenceBefore: 'The desert elders offered their wise',
      sentenceAfter: 'on where the subterranean aquifers ran deepest.',
      options: ['counsel', 'council'],
      correctAnswer: 'counsel',
      explanation:
        "'Counsel' means advice or guidance. 'Council' is an administrative assembly.",
      etymologyHint: 'Counsel provides guidance; Council is an official meeting.',
      wardenComment: 'Listen to sage guidance rather than administrative bureaucracy!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c5_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the geological layers of rock:',
      sentenceBefore: 'Centuries of mineral',
      sentenceAfter: 'were revealed on the red cliffs.',
      correctAnswer: 'STRATA',
      explanation:
        'S-T-R-A-T-A: Plural of stratum, parallel layers of sedimentary rock.',
      etymologyHint: 'Latin plural for geological layers of earth and stone.',
      wardenComment: 'Six letters layered in geological permanence!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c5_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Censure (severe criticism) vs Censor (suppress) vs Sensor (detector):',
      sentenceBefore: 'The geologists faced no',
      sentenceAfter: 'for their bold claim that Pecos Bill carved the abyss.',
      options: ['censure', 'censor', 'sensor'],
      correctAnswer: 'censure',
      explanation:
        "'Censure' is an expression of formal disapproval. 'Censor' is suppression; 'sensor' is a detector.",
      etymologyHint: 'Censure = condemnation; Censor = redact.',
      wardenComment: 'Select the noun of official rebuke and condemnation!',
      difficulty: ['HARD'],
    },
    {
      id: 'c5_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE word for keen discernment / insight into depths:',
      sentenceBefore: 'Bill had a',
      sentenceAfter: 'gaze that could spot gold veins a mile deep.',
      correctAnswer: 'PERSPICACIOUS',
      explanation:
        "P-E-R-S-P-I-C-A-C-I-O-U-S: Having a ready insight into and understanding of things; shrewd (Latin 'perspicere' = to see through).",
      etymologyHint: "From Latin for 'seeing clearly through'—intellectually penetrating.",
      wardenComment: 'A monumental 13-letter cipher! Decrypt this master-level vision.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 6: THE RIVER OF GOLD =================
  6: [
    {
      id: 'c6_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose break (fracture/smash) vs brake (deceleration device):',
      sentenceBefore: 'No drought could ever',
      sentenceAfter: 'the spirit of the pioneers along the Rio Grande.',
      options: ['break', 'brake'],
      correctAnswer: 'break',
      explanation:
        "'Break' means to fracture or destroy. 'Brake' refers to a device for slowing a vehicle.",
      etymologyHint: "Cars use 'brakes'. Unbroken resolve withstands a 'break'.",
      wardenComment: 'Keep the frontier momentum unbroken!',
      difficulty: ['EASY'],
    },
    {
      id: 'c6_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the vital waterway:',
      sentenceBefore: 'The rushing torrent created the mighty border',
      sentenceAfter: 'flowing straight to the sunny Gulf.',
      correctAnswer: 'RIVER',
      explanation:
        'R-I-V-E-R: A natural flowing watercourse, usually freshwater.',
      etymologyHint: 'Natural wide stream of fresh water flowing in a channel.',
      wardenComment: 'Restore the ribbon flow! Five letters to channel the water.',
      difficulty: ['EASY'],
    },
    {
      id: 'c6_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "FERTILE / PRODUCTIVE":',
      sentenceBefore: 'The freshly irrigated soil became remarkably',
      sentenceAfter: 'yielding giant crops of melon.',
      options: ['fecund', 'barren', 'arid', 'desolate'],
      correctAnswer: 'fecund',
      explanation:
        "'Fecund' (Latin fecundus = fruitful) means highly fertile, producing abundance.",
      etymologyHint: "Latin 'fecundus' (fruitful, fertile).",
      wardenComment: 'Identify the word of blooming agricultural richness!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'FERTILE',
      synonymNuance: 'Abundantly fruitful and productive',
    },
    {
      id: 'c6_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose elicit (evoke/draw out) vs illicit (illegal/unlawful):',
      sentenceBefore: 'The fresh river flow helped',
      sentenceAfter: 'new green blooms from the parched desert seedbeds.',
      options: ['elicit', 'illicit'],
      correctAnswer: 'elicit',
      explanation:
        "'Elicit' means to evoke or draw forth. 'Illicit' means unlawful or forbidden.",
      etymologyHint: 'Elicit = Evoke or Extract. Illicit = Illegal.',
      wardenComment: 'Draw forth life from the soil with the lawful verb of blooming!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c6_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the term for underground water reservoir:',
      sentenceBefore: 'Bill drilled down until he tapped the deep',
      sentenceAfter: 'underneath the limestone bedrock.',
      correctAnswer: 'AQUIFER',
      explanation:
        "A-Q-U-I-F-E-R: Body of permeable rock that can contain or transmit groundwater.",
      etymologyHint: 'From Latin aqua (water) + ferre (to bear/carry).',
      wardenComment: 'Seven letters carrying pure subterranean streams.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c6_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Enervate (weaken/drain of energy) vs Innervate (stimulate nerves):',
      sentenceBefore: 'The relentless midday sun threatened to',
      sentenceAfter: 'the crew of diggers before the trench met the sea.',
      options: ['enervate', 'innervate'],
      correctAnswer: 'enervate',
      explanation:
        "'Enervate' means to cause someone to feel drained of energy. 'Innervate' means to supply nerves.",
      etymologyHint: 'Enervate = remove nerve/energy (drain).',
      wardenComment: 'The scorching sun drains energy—do not pick neural stimulation!',
      difficulty: ['HARD'],
    },
    {
      id: 'c6_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (generous abundance / overflowing):',
      sentenceBefore: 'The Rio Grande brought',
      sentenceAfter: 'water to every parched farm in the valley.',
      correctAnswer: 'COPIOUS',
      explanation:
        "C-O-P-I-O-U-S: Abundant in supply or quantity (Latin 'copia' = abundance).",
      etymologyHint: 'From Latin root of cornucopia—yielding abundant bounty.',
      wardenComment: 'Seven letters of flowing, overflowing abundance!',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 7: THE COUGAR SADDLE =================
  7: [
    {
      id: 'c7_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose whose (belonging to whom) vs who’s (who is):',
      sentenceBefore: 'The travelers wondered',
      sentenceAfter: 'steed was roaring like a mountain lion in the forest.',
      options: ['whose', "who's"],
      correctAnswer: 'whose',
      explanation:
        "'Whose' is possessive. 'Who’s' is the contraction for 'who is'.",
      etymologyHint: "Substitute 'who is' to verify invalid grammar.",
      wardenComment: 'Possession of the mount requires the clean pronoun form!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c7_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the ferocious feline mount:',
      sentenceBefore: 'Bill rode atop the leaping mountain',
      sentenceAfter: 'with a grin wider than the Rio Grande.',
      correctAnswer: 'COUGAR',
      explanation:
        'C-O-U-G-A-R: Puma concolor, large agile wild cat of the Americas.',
      etymologyHint: 'Large agile tawny cat of North American wilderness.',
      wardenComment: 'Paws like thunder! Uncover the six letters of the mountain cat.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c7_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "SECRETIVE / STEALTHY":',
      sentenceBefore: 'The cougar stalked the ridge with',
      sentenceAfter: 'movements that made no sound upon the pine needles.',
      options: ['surreptitious', 'overt', 'manifest', 'blatant'],
      correctAnswer: 'surreptitious',
      explanation:
        "'Surreptitious' (Latin surripere = seize secretly) means kept secret, stealthy, clandestine.",
      etymologyHint: "Latin 'sur-' (under) + 'rapere' (snatch).",
      wardenComment: 'Pick the stealthy feline adjective over open or blatant behavior!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'STEALTHY',
      synonymNuance: 'Clandestine stealth and covert silence',
    },
    {
      id: 'c7_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose elude (escape/evade) vs allude (refer to indirectly):',
      sentenceBefore: 'The cunning predator tried to',
      sentenceAfter: 'capture by leaping from crag to crag.',
      options: ['elude', 'allude'],
      correctAnswer: 'elude',
      explanation:
        "'Elude' means to escape or evade capture. 'Allude' means to make an indirect reference.",
      etymologyHint: 'Elude = Escape. Allude = Hint at.',
      wardenComment: 'The cougar seeks escape—choose the verb of evasion!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c7_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the mountain habitat of the wild cougar:',
      sentenceBefore: 'They bounded along the rocky',
      sentenceAfter: 'overlooking the timberline.',
      correctAnswer: 'PRECIPICE',
      explanation:
        'P-R-E-C-I-P-I-C-E: A very steep rock face or cliff, typically a tall one.',
      etymologyHint: 'Sheer vertical cliff edge high in the mountain peaks.',
      wardenComment: 'Nine letters on the brink of the high rocky drop!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c7_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Loath (reluctant/unwilling) vs Loathe (detest/hate):',
      sentenceBefore: 'The fierce predator was',
      sentenceAfter: 'to yield at first, but soon respected Bill’s gentle command.',
      options: ['loath', 'loathe'],
      correctAnswer: 'loath',
      explanation:
        "'Loath' (adjective) means reluctant or unwilling. 'Loathe' (verb) means to hate deeply.",
      etymologyHint: 'Loath (adj) = Unwilling; Loathe (verb) = Despise.',
      wardenComment: 'An adjective of reluctance! Watch out for the silent trailing vowel.',
      difficulty: ['HARD'],
    },
    {
      id: 'c7_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE word for moving/traveling from place to place:',
      sentenceBefore: 'Bill was a truly',
      sentenceAfter: 'wanderer who never slept under the same roof twice.',
      correctAnswer: 'PERIPATETIC',
      explanation:
        "P-E-R-I-P-A-T-E-T-I-C: Traveling from place to place, wandering (Latin/Greek peripatein = to walk about).",
      etymologyHint: "From Greek for 'walking about'—a nomadic wanderer of the trails.",
      wardenComment: 'Eleven classical letters celebrating the nomadic frontier spirit.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 8: CELESTIAL MARKSMAN =================
  8: [
    {
      id: 'c8_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose night (darkness hours) vs knight (armored warrior):',
      sentenceBefore: 'When the pitch-black',
      sentenceAfter: 'fell across the plains, Bill readied his revolvers.',
      options: ['night', 'knight'],
      correctAnswer: 'night',
      explanation:
        "'Night' is the period of darkness. 'Knight' is an armored warrior.",
      etymologyHint: "Night sky has no 'k'.",
      wardenComment: 'Look to the dark sky, not medieval chivalry!',
      difficulty: ['EASY'],
    },
    {
      id: 'c8_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the celestial fireball:',
      sentenceBefore: 'Bill drew his revolvers to shatter the falling',
      sentenceAfter: 'into millions of glittering fireflies.',
      correctAnswer: 'METEOR',
      explanation:
        "M-E-T-E-O-R: From Greek 'meteoros' (high in the air), a burning shooting star.",
      etymologyHint: 'Streaking celestial body entering the atmosphere.',
      wardenComment: 'Aim true under the night sky! Six letters blazing bright.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c8_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "LUMINOUS / RADIANT":',
      sentenceBefore: 'The exploding comet left a',
      sentenceAfter: 'trail of gold across the stratosphere.',
      options: ['resplendent', 'tenebrous', 'murky', 'drab'],
      correctAnswer: 'resplendent',
      explanation:
        "'Resplendent' (Latin resplendere = to shine brightly) means attractive and impressive through being richly colorful or shining.",
      etymologyHint: "Latin 're-' (intensive) + 'splendere' (to shine).",
      wardenComment: 'Match cosmic starlight with the most radiant synonym!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'SHINING',
      synonymNuance: 'Dazzling brilliance and glowing splendor',
    },
    {
      id: 'c8_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose bated (held in suspense) vs baited (hooked with food):',
      sentenceBefore: 'The onlookers waited with',
      sentenceAfter: 'breath as the meteor streaked across the stars.',
      options: ['bated', 'baited'],
      correctAnswer: 'bated',
      explanation:
        "'Bated' (short for abated/held) refers to holding one\'s breath. 'Baited' means fitted with bait.",
      etymologyHint: 'Bated = aBated (held in suspense); Baited = hooked with bait.',
      wardenComment: 'Hold your breath in awe, not a fish hook in the dark!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c8_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the pattern of stars in the heavens:',
      sentenceBefore: 'Bill’s target practice created a brand new',
      sentenceAfter: 'shaped like a cowboy boot.',
      correctAnswer: 'CONSTELLATION',
      explanation:
        'C-O-N-S-T-E-L-L-A-T-I-O-N: A group of stars forming a recognizable pattern.',
      etymologyHint: 'From Latin con- (together) + stella (star).',
      wardenComment: 'A stellar 13-letter masterpiece charted across the night.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c8_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Meretricious (tinselly/falsely attractive) vs Meritorious (praiseworthy):',
      sentenceBefore: 'Bill dismissed cheap parlor tricks as',
      sentenceAfter: 'preferring genuine marksman feats.',
      options: ['meretricious', 'meritorious'],
      correctAnswer: 'meretricious',
      explanation:
        "'Meretricious' means apparently attractive but having no real value. 'Meritorious' means praiseworthy.",
      etymologyHint: 'Meretricious = flashy deception; Meritorious = genuine merit.',
      wardenComment: 'Separate cheap flashy parlor tricks from genuine praiseworthy skill!',
      difficulty: ['HARD'],
    },
    {
      id: 'c8_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (radiant brilliance / luminous glow):',
      sentenceBefore: 'The sky was bathed in cosmic',
      sentenceAfter: 'as thousands of meteor shards sparkled.',
      correctAnswer: 'REFULGENCE',
      explanation:
        "R-E-F-U-L-G-E-N-C-E: Brilliant radiant luster, glowing splendor (Latin 'refulgere' = to shine back).",
      etymologyHint: "From Latin for 'shining brightly back'—dazzling cosmic radiance.",
      wardenComment: 'Ten radiant glyphs illuminating the frontier firmament.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 9: THE RIVER MAIDEN =================
  9: [
    {
      id: 'c9_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose bridal (relating to a bride/wedding) vs bridle (horse headgear):',
      sentenceBefore: 'Sue rode the catfish while wearing her magnificent',
      sentenceAfter: 'gown with seventy-five yards of lace.',
      options: ['bridal', 'bridle'],
      correctAnswer: 'bridal',
      explanation:
        "'Bridal' refers to a bride or wedding. 'Bridle' is horse headgear.",
      etymologyHint: "BridAl with 'A' = Bride's Attire. BridLe with 'LE' = Leather harness.",
      wardenComment: 'Dress the cowgirl bride, not the leather harness!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c9_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the giant whisker-bearing river creature:',
      sentenceBefore: 'Sue leaped fearlessly upon the back of the giant',
      sentenceAfter: 'and rode it upstream over the rapids.',
      correctAnswer: 'CATFISH',
      explanation:
        'C-A-T-F-I-S-H: Ray-finned fish noted for prominent barbels resembling cat whiskers.',
      etymologyHint: 'Freshwater bottom-dweller equipped with tactile whisker barbels.',
      wardenComment: 'Splash through the current! Rebuild the river leviathan.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c9_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "FEARLESS / DARING AUDACITY":',
      sentenceBefore: 'Sue was celebrated for her',
      sentenceAfter: 'feats along the rushing falls.',
      options: ['audacious', 'craven', 'pusillanimous', 'diffident'],
      correctAnswer: 'audacious',
      explanation:
        "'Audacious' (Latin audere = to dare) means showing a willingness to take surprisingly bold risks.",
      etymologyHint: "Latin 'audacia' (boldness, daring).",
      wardenComment: 'Identify the quality of heroic daring over cowardly timidity!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'DARING',
      synonymNuance: 'Bold and intrepid risk-taking',
    },
    {
      id: 'c9_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose faze (disconcert/intimidate) vs phase (stage of development):',
      sentenceBefore: 'A two-hundred-pound catfish could not',
      sentenceAfter: 'the intrepid cowgirl for a single moment.',
      options: ['faze', 'phase'],
      correctAnswer: 'faze',
      explanation:
        "'Faze' means to disturb the composure of. 'Phase' is a distinct stage.",
      etymologyHint: 'Faze = rattle/intimidate; Phase = moon cycle / stage.',
      wardenComment: 'Nothing can intimidate or disconcert Slue-Foot Sue!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c9_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the term for turbulent river white water:',
      sentenceBefore: 'Sue navigated the rushing river',
      sentenceAfter: 'without losing her Stetson hat.',
      correctAnswer: 'CATARACT',
      explanation:
        "C-A-T-A-R-A-C-T: A large waterfall or sudden downpour of rushing water (Greek 'katarrhaktes').",
      etymologyHint: 'From Greek for waterfall—violent cascading white water rapids.',
      wardenComment: 'Eight rushing letters cascading down the canyon river!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c9_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Temerity (audacity/reckless boldness) vs Timidity (shyness):',
      sentenceBefore: 'Sue had the breathtaking',
      sentenceAfter: 'to jump from a swimming fish directly onto Widow-Maker\'s saddle.',
      options: ['temerity', 'timidity'],
      correctAnswer: 'temerity',
      explanation:
        "'Temerity' means excessive boldness; audacity. 'Timidity' means lack of courage.",
      etymologyHint: 'Temerity from Latin temere (rashly, boldly).',
      wardenComment: 'Reckless boldness in the saddle! Choose the noun of fearless audacity.',
      difficulty: ['HARD'],
    },
    {
      id: 'c9_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (intrepid fearlessness / fortitude):',
      sentenceBefore: 'Sue faced the roaring falls without any feeling of',
      sentenceAfter: 'in her stalwart heart.',
      correctAnswer: 'TREPIDATION',
      explanation:
        "T-R-E-P-I-D-A-T-I-O-N: A feeling of fear or agitation about something that may happen (Latin 'trepidare' = to tremble).",
      etymologyHint: 'The trembling fear she refused to feel—Latin root for trembling dread.',
      wardenComment: 'Eleven letters of trembling fear that the cowgirl completely conquered!',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 10: THE GOLDEN CASSETTE =================
  10: [
    {
      id: 'c10_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose right (correct/direction) vs write (inscribe with pen) vs rite (ceremony):',
      sentenceBefore: 'The Warden asked the traveler to',
      sentenceAfter: 'the final verse upon the golden magnetic tape.',
      options: ['write', 'right', 'rite'],
      correctAnswer: 'write',
      explanation:
        "'Write' is to inscribe text. 'Right' is correct/direction. 'Rite' is a ritual.",
      etymologyHint: "Write with a 'w' puts letters to parchment and tape.",
      wardenComment: 'Inscribe the final verse upon the golden master reel!',
      difficulty: ['EASY'],
    },
    {
      id: 'c10_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the vessel of analog magnetic sound:',
      sentenceBefore: 'The Warden loaded the golden magnetic',
      sentenceAfter: 'into the vintage open-chassis deck.',
      correctAnswer: 'CASSETTE',
      explanation:
        'C-A-S-S-E-T-T-E: Dual-reel magnetic tape housing preserving analog sound.',
      etymologyHint: 'Dual-hub magnetic medium that holds the ancient cipher tapes.',
      wardenComment: 'The master reel of all folklore! Seal the final eight glyphs.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c10_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "TIMELESS / EVERLASTING":',
      sentenceBefore: 'The myths of the West were granted',
      sentenceAfter: 'resonance on the golden spools.',
      options: ['perpetual', 'transitory', 'ephemeral', 'fugacious'],
      correctAnswer: 'perpetual',
      explanation:
        "'Perpetual' (Latin perpetuus = continuous) means never ending or changing.",
      etymologyHint: "Latin 'perpetuus' (unbroken, continuous).",
      wardenComment: 'Select the eternal word that endures beyond fading moments!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'EVERLASTING',
      synonymNuance: 'Continuous without end or decay',
    },
    {
      id: 'c10_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose principles (moral tenets/rules) vs principals (head administrators):',
      sentenceBefore: 'The Tape Warden swore upon ancient',
      sentenceAfter: 'of syntax, rhythm, and analog truth.',
      options: ['principles', 'principals'],
      correctAnswer: 'principles',
      explanation:
        "'Principles' are fundamental rules or axioms. 'Principals' are heads/leaders.",
      etymologyHint: 'Principles = Rules of truth. Principals = Main leaders.',
      wardenComment: 'The final spool rests upon fundamental grammatical axioms!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c10_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the state of acoustic perfection:',
      sentenceBefore: 'The magnetic heads resonated with perfect',
      sentenceAfter: 'as the final note finished.',
      correctAnswer: 'HARMONY',
      explanation:
        'H-A-R-M-O-N-Y: Agreement or concord, pleasing arrangement of musical parts.',
      etymologyHint: 'Acoustic agreement of frequencies and musical chords.',
      wardenComment: 'Seven letters of pitch-perfect analog alignment.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c10_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Verisimilitude (appearance of truth) vs Similitude (resemblance):',
      sentenceBefore: 'The folklore tapes possessed extraordinary',
      sentenceAfter: 'capturing the raw soul of the American West with utter realism.',
      options: ['verisimilitude', 'similitude'],
      correctAnswer: 'verisimilitude',
      explanation:
        "'Verisimilitude' means the appearance of being true or real (Latin 'verus' = true + 'similis' = like).",
      etymologyHint: 'Verus (truth) + similis (like) = lifelike, authentic truth.',
      wardenComment: 'Authentic truth in folklore! Choose the 15-letter master noun of realism.',
      difficulty: ['HARD'],
    },
    {
      id: 'c10_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the supreme title of folklore mastery:',
      sentenceBefore: 'The player is crowned Grand',
      sentenceAfter: 'of the American Frontier Tapes.',
      correctAnswer: 'DECIPHERER',
      explanation:
        "D-E-C-I-P-H-E-R-E-R: One who converts ancient ciphers and encoded texts into intelligible speech.",
      etymologyHint: 'Master linguistic cryptanalyst of analog folklore spools.',
      wardenComment: 'Ten legendary letters! Complete the final Master Reel.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 11: THE FLEET-FOOTED PHANTOM =================
  11: [
    {
      id: 'c11_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose hare (fast rabbit) vs hair (follicle strands):',
      sentenceBefore: 'The giant prairie',
      sentenceAfter: 'could leap twenty feet across sagebrush in a single bound.',
      options: ['hare', 'hair'],
      correctAnswer: 'hare',
      explanation:
        "'Hare' is a fast-running long-eared mammal. 'Hair' is the fine threadlike strands growing on skin.",
      etymologyHint: 'The wild hare outruns the tortoise.',
      wardenComment: 'Pick the swift desert animal, not what grows on your scalp!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c11_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the agile long-eared desert leaper:',
      sentenceBefore: 'Bill sprinted alongside the legendary Texas',
      sentenceAfter: 'across the baking salt flats.',
      correctAnswer: 'JACKRABBIT',
      explanation:
        'J-A-C-K-R-A-B-B-I-T: North American desert hare famed for enormous ears and high speeds.',
      etymologyHint: 'Originally called jackass-rabbit due to its donkey-like ears.',
      wardenComment: 'Ten letters bounding across the dusty alkali flats!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c11_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "SWIFT SPEED / CELERITY":',
      sentenceBefore: 'The rabbit moved with astonishing',
      sentenceAfter: 'leaving dust clouds in its wake.',
      options: ['alacrity', 'lethargy', 'torpor', 'languor'],
      correctAnswer: 'alacrity',
      explanation:
        "'Alacrity' (Latin alacer = brisk/lively) means brisk, cheerful, and swift speed/readiness.",
      etymologyHint: "Latin 'alacritas' (lively readiness, swiftness).",
      wardenComment: 'Find the word of brisk and cheerful swiftness!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'SWIFTNESS',
      synonymNuance: 'Brisk, cheerful, and energetic speed',
    },
    {
      id: 'c11_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose gait (manner of walking/running) vs gate (hinged barrier):',
      sentenceBefore: 'The jackrabbit maintained a rhythmic and bounding',
      sentenceAfter: 'that left horsemen far behind.',
      options: ['gait', 'gate'],
      correctAnswer: 'gait',
      explanation:
        "'Gait' refers to a person\'s or animal\'s manner of walking or running. 'Gate' is a barrier.',",
      etymologyHint: 'Gait = style of stride and footwork.',
      wardenComment: 'Check the footwork and stride, not a wooden fence door!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c11_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the physical quality of swift movement:',
      sentenceBefore: 'The hare possessed supernatural',
      sentenceAfter: 'dodging every obstacle on the trail.',
      correctAnswer: 'AGILITY',
      explanation:
        'A-G-I-L-I-T-Y: Ability to move quickly and easily (Latin agilis = nimble).',
      etymologyHint: 'Nimble swiftness and physical dexterity.',
      wardenComment: 'Seven nimble glyphs in rapid succession!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c11_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Celerity (swiftness of movement) vs Celebrity (fame):',
      sentenceBefore: 'Bill matched the hare’s extraordinary',
      sentenceAfter: 'sprinting at seventy miles per hour.',
      options: ['celerity', 'celebrity'],
      correctAnswer: 'celerity',
      explanation:
        "'Celerity' means swiftness of movement. 'Celebrity' means fame or a famous person.",
      etymologyHint: "From Latin 'celer' (swift, quick) — root of 'accelerate'.",
      wardenComment: 'Do not confuse pure physical swiftness with public fame!',
      difficulty: ['HARD'],
    },
    {
      id: 'c11_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE adjective for fleeting, swiftly passing away:',
      sentenceBefore: 'The rabbit was an',
      sentenceAfter: 'shadow that vanished over the ridge.',
      correctAnswer: 'EVANESCENT',
      explanation:
        "E-V-A-N-E-S-C-E-N-T: Quickly fading or disappearing; fleeting (Latin 'evanescere' = to vanish).",
      etymologyHint: "From Latin for 'vanishing like vapor into the sky.'",
      wardenComment: 'Ten vanishing letters! Rebuild the fleeting phantom cipher.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 12: THE STEAMING BEHEMOTH =================
  12: [
    {
      id: 'c12_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose track (railway line / path) vs tract (expanse of land / booklet):',
      sentenceBefore: 'Bill ran straight down the railroad',
      sentenceAfter: 'ahead of the steaming engine.',
      options: ['track', 'tract'],
      correctAnswer: 'track',
      explanation:
        "'Track' is a railway rail line or foot path. 'Tract' is an area of land or religious pamphlet.",
      etymologyHint: 'Train runs on tracks.',
      wardenComment: 'Keep your boots on the steel rails!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c12_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the steam-powered railroad machine:',
      sentenceBefore: 'The black iron',
      sentenceAfter: 'chugged clouds of coal smoke into the sky.',
      correctAnswer: 'LOCOMOTIVE',
      explanation:
        'L-O-C-O-M-O-T-I-V-E: A powered rail vehicle used for pulling trains (Latin locus = place + motio = motion).',
      etymologyHint: 'Self-propelled steam engine pulling cars across rails.',
      wardenComment: 'Ten heavy iron letters of pure steam power!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c12_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated synonym for "RELENTLESS / UNYIELDING":',
      sentenceBefore: 'Bill maintained an',
      sentenceAfter: 'pace against the iron engine.',
      options: ['inexorable', 'yielding', 'fickle', 'wavering'],
      correctAnswer: 'inexorable',
      explanation:
        "'Inexorable' (Latin inexorabilis = unable to be persuaded by prayer) means impossible to stop or prevent; relentless.",
      etymologyHint: "Latin 'in-' (not) + 'exorare' (to persuade/plead).",
      wardenComment: 'Select the unstoppable adjective that cannot be swayed!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'RELENTLESS',
      synonymNuance: 'Unstoppable and unalterable momentum',
    },
    {
      id: 'c12_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose grate (metal grill / irritate) vs great (colossal / magnificent):',
      sentenceBefore: 'The iron cowcatcher and furnace',
      sentenceAfter: 'glowed red hot as the boiler reached peak pressure.',
      options: ['grate', 'great'],
      correctAnswer: 'grate',
      explanation:
        "'Grate' is a metal framework of bars for a fire. 'Great' means large or magnificent.",
      etymologyHint: 'Fireplace grate vs a great victory.',
      wardenComment: 'Mind the glowing iron furnace bars!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c12_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the fuel that powered the steam engine:',
      sentenceBefore: 'Shovel more black',
      sentenceAfter: 'into the roaring boiler furnace.',
      correctAnswer: 'ANTHRACITE',
      explanation:
        'A-N-T-H-R-A-C-I-T-E: High-grade hard coal that burns with high heat and little smoke.',
      etymologyHint: 'From Greek anthrax (coal/charcoal), hard lustrous mineral fuel.',
      wardenComment: 'Ten fossilized letters fueling the locomotive boiler.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c12_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Stentorian (extremely loud/powerful voice) vs Sartorial (tailoring/clothing):',
      sentenceBefore: 'Bill let out a',
      sentenceAfter: 'shout that echoed louder than the train’s steam whistle.',
      options: ['stentorian', 'sartorial'],
      correctAnswer: 'stentorian',
      explanation:
        "'Stentorian' means extremely loud and powerful (after Greek herald Stentor). 'Sartorial' relates to clothing.",
      etymologyHint: 'Stentor from the Iliad, whose voice was as loud as fifty men.',
      wardenComment: 'A voice that overpowers a train whistle! Pick the Greek heraldic word.',
      difficulty: ['HARD'],
    },
    {
      id: 'c12_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE word for an enormous, overpowering force or entity:',
      sentenceBefore: 'The locomotive was a mechanical',
      sentenceAfter: 'crushing through the frontier wilderness.',
      correctAnswer: 'JUGGERNAUT',
      explanation:
        'J-U-G-G-E-R-N-A-U-T: A huge, powerful, and overwhelming force or institution (Sanskrit Jagannatha = Lord of the World).',
      etymologyHint: 'From Sanskrit for an unstoppable, massive crushing cart.',
      wardenComment: 'Ten monumental letters of crushing mechanical force.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 13: THE GREAT BLIZZARD OF DEADWOOD =================
  13: [
    {
      id: 'c13_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose freeze (turn to ice) vs frieze (decorative sculpted wall band):',
      sentenceBefore: 'The mountain frost caused the river to completely',
      sentenceAfter: 'into solid sheets of crystalline ice.',
      options: ['freeze', 'frieze'],
      correctAnswer: 'freeze',
      explanation:
        "'Freeze' is the verb meaning to turn to ice. 'Frieze' is an architectural sculpted wall border.",
      etymologyHint: 'Ice freezes in cold weather.',
      wardenComment: 'Turn water to solid ice with the simple frosty verb!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c13_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the polar winter vortex:',
      sentenceBefore: 'A howling Arctic',
      sentenceAfter: 'blanketed the Black Hills in twenty feet of snow.',
      correctAnswer: 'BLIZZARD',
      explanation:
        'B-L-I-Z-Z-A-R-D: A severe snowstorm with high winds and low visibility.',
      etymologyHint: 'Frontier American slang for a blinding furious snowstorm.',
      wardenComment: 'Double Z in the frost! Decipher the polar gale.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c13_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "BITTERLY COLD / ICY":',
      sentenceBefore: 'The mountain pass was struck by',
      sentenceAfter: 'winds that turned breath to icicles.',
      options: ['gelid', 'torrid', 'sweltering', 'tepid'],
      correctAnswer: 'gelid',
      explanation:
        "'Gelid' (Latin gelu = frost/ice) means extremely cold or icy. 'Torrid' and 'sweltering' mean hot.",
      etymologyHint: "Latin 'gelidus' (frosty, icy, freezing cold).",
      wardenComment: 'Select the icy Latinate descriptor over sweltering heat!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'ICY COLD',
      synonymNuance: 'Sub-zero freezing frost and icy chill',
    },
    {
      id: 'c13_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose hoarse (raspy voice) vs horse (equine animal):',
      sentenceBefore: 'Bill’s voice grew slightly',
      sentenceAfter: 'from shouting over the howling blizzard winds.',
      options: ['hoarse', 'horse'],
      correctAnswer: 'hoarse',
      explanation:
        "'Hoarse' means having a vocal tone that is rough or raspy. 'Horse' is the equine animal.",
      etymologyHint: 'Hoarse throat vs riding a horse.',
      wardenComment: 'Raspy vocal cords from the frost! Pick the vocal adjective.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c13_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the frozen precipitation:',
      sentenceBefore: 'Columns of glittering',
      sentenceAfter: 'hung suspended from the saloon roof.',
      correctAnswer: 'ICICLES',
      explanation:
        'I-C-I-C-L-E-S: Hanging, tapering points of ice formed by the freezing of dripping water.',
      etymologyHint: 'From Old English is-gicel (ice point/pennant).',
      wardenComment: 'Seven crystalline spikes hanging in the frost!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c13_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Hibernal (wintry/relating to winter) vs Vernal (springtime):',
      sentenceBefore: 'The frontier poets composed verses praising the',
      sentenceAfter: 'grandeur of the snow-capped mountain peaks.',
      options: ['hibernal', 'vernal'],
      correctAnswer: 'hibernal',
      explanation:
        "'Hibernal' relates to winter (Latin hibernus). 'Vernal' relates to spring.",
      etymologyHint: 'Hibernal = winter (root of hibernate); Vernal = spring equinox.',
      wardenComment: 'Choose the classical seasonal adjective of midwinter frost!',
      difficulty: ['HARD'],
    },
    {
      id: 'c13_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE noun for cold, emotionless, or icy endurance:',
      sentenceBefore: 'Bill confronted the sub-zero tempest with unshakeable',
      sentenceAfter: 'never shivering once.',
      correctAnswer: 'STOICISM',
      explanation:
        "S-T-O-I-C-I-S-M: Endurance of pain or hardship without display of feelings (from Zeno's Stoa).",
      etymologyHint: 'Ancient Greek philosophy of calm endurance against adversity.',
      wardenComment: 'Eight disciplined letters of frozen fortitude.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 14: THE PETRIFIED FOREST RIDDLE =================
  14: [
    {
      id: 'c14_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose wood (timber/forest) vs would (past of will):',
      sentenceBefore: 'The petrified',
      sentenceAfter: 'had turned to solid crystalline agate over millions of years.',
      options: ['wood', 'would'],
      correctAnswer: 'wood',
      explanation:
        "'Wood' is the hard fibrous material of trees. 'Would' is a modal auxiliary verb.",
      etymologyHint: 'Timber in the forest is wood.',
      wardenComment: 'Select the tree timber turned to stone!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c14_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the state of organic matter turned to stone:',
      sentenceBefore: 'Ancient cedar logs were completely',
      sentenceAfter: 'into sparkling quartz and chalcedony.',
      correctAnswer: 'PETRIFIED',
      explanation:
        "P-E-T-R-I-F-I-E-D: Changed into stone through mineralization (Greek 'petra' = stone/rock).",
      etymologyHint: "From Greek root 'petra' (stone) + 'facere' (to make).",
      wardenComment: 'Nine letters of ancient stone transformation!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c14_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "ANCIENT / PRIMEVAL":',
      sentenceBefore: 'The petrified logs dated back to an',
      sentenceAfter: 'era long before the memory of man.',
      options: ['antediluvian', 'contemporary', 'modern', 'novel'],
      correctAnswer: 'antediluvian',
      explanation:
        "'Antediluvian' (Latin ante = before + diluvium = flood) literally means before the biblical flood, or ancient/primeval.",
      etymologyHint: "Latin 'ante' (before) + 'diluvium' (deluge/flood).",
      wardenComment: 'Select the primeval word denoting the dawn of time!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'ANCIENT',
      synonymNuance: 'Belonging to the earliest primeval prehistoric epochs',
    },
    {
      id: 'c14_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose ring (circular band/sound) vs wring (twist and squeeze):',
      sentenceBefore: 'Bill counted each growth',
      sentenceAfter: 'in the petrified log to calculate its age.',
      options: ['ring', 'wring'],
      correctAnswer: 'ring',
      explanation:
        "'Ring' is a circular band (such as tree growth rings). 'Wring' means to twist or squeeze forcefully.",
      etymologyHint: 'Tree growth rings vs wringing wet laundry.',
      wardenComment: 'Count the concentric mineral circles without extra twists!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c14_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the colorful silica gemstone in the petrified trees:',
      sentenceBefore: 'The stone trunk sparkled with bands of purple',
      sentenceAfter: 'and banded chalcedony.',
      correctAnswer: 'AMETHYST',
      explanation:
        "A-M-E-T-H-Y-S-T: A violet variety of quartz often found in petrified mineral cavities.",
      etymologyHint: "From Greek 'a-methystos' (not intoxicated), prized purple quartz.",
      wardenComment: 'Eight royal violet letters gleaming in the stone wood.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c14_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Lapidary (relating to stone engraving/gemstones) vs Lapsed (expired):',
      sentenceBefore: 'The petrified forest was celebrated for its extraordinary',
      sentenceAfter: 'craftsmanship created by nature alone.',
      options: ['lapidary', 'lapsed'],
      correctAnswer: 'lapidary',
      explanation:
        "'Lapidary' relates to the cutting, polishing, or engraving of stone and gems (Latin lapis = stone).",
      etymologyHint: "From Latin 'lapis' (stone).",
      wardenComment: 'Pertaining to precious stone and gemcraft! Pick the geological root.',
      difficulty: ['HARD'],
    },
    {
      id: 'c14_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (hardened into rigid stone):',
      sentenceBefore: 'The ancient folklore had become',
      sentenceAfter: 'in the sacred memory of the hills.',
      correctAnswer: 'OSSIFIED',
      explanation:
        "O-S-S-I-F-I-E-D: Turned into bone or hardened into a rigid, unchanging state (Latin 'os' = bone).",
      etymologyHint: "Latin root for bone—hardened permanently into rigid structure.",
      wardenComment: 'Eight letters of rigid, calcified permanence.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 15: THE GILA MONSTER GAMBOL =================
  15: [
    {
      id: 'c15_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose tail (animal rear) vs tale (story/narrative):',
      sentenceBefore: 'The beaded lizard swung its thick',
      sentenceAfter: 'as it scuttled across the desert rocks.',
      options: ['tail', 'tale'],
      correctAnswer: 'tail',
      explanation:
        "'Tail' is the posterior appendage of an animal. 'Tale' is a narrative story.",
      etymologyHint: "Lizard's tail vs a folklore tale.",
      wardenComment: 'Choose the reptile\'s physical tail!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c15_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the venomous desert lizard:',
      sentenceBefore: 'Bill shared a campfire with an orange-and-black',
      sentenceAfter: 'basking peacefully on a warm boulder.',
      correctAnswer: 'GILA',
      explanation:
        'G-I-L-A: Refers to the Gila monster (Heloderma suspectum), venomous lizard native to the Southwest.',
      etymologyHint: 'Named after the Gila River basin in Arizona.',
      wardenComment: 'Four sacred desert letters! Reveal the beaded reptile.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c15_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "HARMFUL / TOXIC / POISONOUS":',
      sentenceBefore: 'The reptile possessed a potent and',
      sentenceAfter: 'secret venom in its lower jaw.',
      options: ['deleterious', 'salutary', 'wholesome', 'remedial'],
      correctAnswer: 'deleterious',
      explanation:
        "'Deleterious' (Greek deleterios = noxious) means causing harm or damage; toxic.",
      etymologyHint: "Greek 'deleter' (destroyer, harmful).",
      wardenComment: 'Identify the destructive venomous adjective over healing tonics!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'HARMFUL',
      synonymNuance: 'Noxious and detrimental toxic damage',
    },
    {
      id: 'c15_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose scale (reptile skin plate / weigh) vs scale (not a homophone error):',
      sentenceBefore: 'Each bead-like',
      sentenceAfter: 'on the lizard’s back was inlaid with natural osteoderms.',
      options: ['scale', 'skail'],
      correctAnswer: 'scale',
      explanation:
        "'Scale' is the correct spelling for the rigid skin plate of a reptile.",
      etymologyHint: 'Reptilian scales.',
      wardenComment: 'Spelling precision on the beaded skin!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c15_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the medicinal cure for snake and lizard venom:',
      sentenceBefore: 'Bill brewed a wild desert cactus',
      sentenceAfter: 'that neutralized any bite in seconds.',
      correctAnswer: 'ANTIDOTE',
      explanation:
        "A-N-T-I-D-O-T-E: A medicine given to counteract a particular poison (Greek 'antidoton' = given against).",
      etymologyHint: "Greek 'anti-' (against) + 'didonai' (to give).",
      wardenComment: 'Eight healing letters neutralizing desert poison.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c15_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Salubrious (health-giving/wholesome) vs Salutary (beneficial effect from hardship):',
      sentenceBefore: 'The pure mountain spring water was remarkably',
      sentenceAfter: 'restoring the tired traveler to full vigor.',
      options: ['salubrious', 'salutary'],
      correctAnswer: 'salubrious',
      explanation:
        "'Salubrious' means health-giving and wholesome (especially climate/water). 'Salutary' means producing good effects (often from unpleasant lessons).",
      etymologyHint: "Latin 'salus' (health) -> salubrious.",
      wardenComment: 'A wholesome health-giving climate demands the purest Latin derivative!',
      difficulty: ['HARD'],
    },
    {
      id: 'c15_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE adjective for calm, unhurried, or sluggish desert habit:',
      sentenceBefore: 'The gila monster appeared',
      sentenceAfter: 'until an insect darted within range.',
      correctAnswer: 'PHLEGMATIC',
      explanation:
        "P-H-L-E-G-M-A-T-I-C: Having an unemotional and stolidly calm disposition; slow and unhurried (from ancient humor phlegm).",
      etymologyHint: 'From ancient Greek bodily humors—calm and slow to agitation.',
      wardenComment: 'Ten classical glyphs describing sluggish desert patience.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 16: THE PRAIRIE FIRE STAMPEDE =================
  16: [
    {
      id: 'c16_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose herd (group of cattle) vs heard (perceived sound):',
      sentenceBefore: 'Bill gathered the entire longhorn',
      sentenceAfter: 'and pointed them toward the river crossing.',
      options: ['herd', 'heard'],
      correctAnswer: 'herd',
      explanation:
        "'Herd' is a group of livestock animals. 'Heard' is the past tense of hear.",
      etymologyHint: 'A herd of cattle.',
      wardenComment: 'Steer the cattle group, not the past-tense sound!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c16_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the wild unbridled charge of cattle:',
      sentenceBefore: 'Ten thousand horned beasts broke into a frantic',
      sentenceAfter: 'away from the approaching flames.',
      correctAnswer: 'STAMPEDE',
      explanation:
        'S-T-A-M-P-E-D-E: A sudden panicked rush of a mass of horses or cattle (Spanish estampida = crash/stampede).',
      etymologyHint: 'From Spanish estampida (crash or uproar of rushing hooves).',
      wardenComment: 'Eight thunderous hooves beating the ground!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c16_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "RAGING INFERNO / MASSIVE FIRE":',
      sentenceBefore: 'Bill rode fearlessly alongside the raging',
      sentenceAfter: 'beating back the blaze.',
      options: ['conflagration', 'ember', 'spark', 'tinder'],
      correctAnswer: 'conflagration',
      explanation:
        "'Conflagration' (Latin conflagrare = to burn up completely) is an extensive and destructive fire.",
      etymologyHint: "Latin 'con-' (together) + 'flagrare' (to blaze).",
      wardenComment: 'Pick the massive roaring inferno over tiny sparks!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'INFERNO',
      synonymNuance: 'Massive, destructive, and all-consuming fire',
    },
    {
      id: 'c16_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose flare (burst of flame) vs flair (stylish aptitude):',
      sentenceBefore: 'A sudden wind gust caused the prairie flames to',
      sentenceAfter: 'higher than the cottonwood trees.',
      options: ['flare', 'flair'],
      correctAnswer: 'flare',
      explanation:
        "'Flare' is a burst of fire/flame. 'Flair' is personal style or knack.",
      etymologyHint: 'Fire flares up; Artists have flair.',
      wardenComment: 'Select the blazing combustible action!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c16_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the wide-horned frontier cattle:',
      sentenceBefore: 'Bill rode alongside the legendary Texas',
      sentenceAfter: 'guiding them away from the smoke.',
      correctAnswer: 'LONGHORN',
      explanation:
        'L-O-N-G-H-O-R-N: Breed of cattle known for characteristic horns that can span up to ten feet.',
      etymologyHint: 'Iconic Texas cattle breed with majestic sweeping horns.',
      wardenComment: 'Eight iconic letters of Texas frontier livestock.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c16_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Incendiary (causing fires/agitation) vs Insular (isolated/narrow-minded):',
      sentenceBefore: 'The dry lightning strike served as an',
      sentenceAfter: 'spark that ignited the entire county within minutes.',
      options: ['incendiary', 'insular'],
      correctAnswer: 'incendiary',
      explanation:
        "'Incendiary' means designed to cause fires, or tending to stir up conflict. 'Insular' means isolated.",
      etymologyHint: "Latin 'incendere' (to set on fire).",
      wardenComment: 'Pertaining to fire ignition! Choose the combustible adjective.',
      difficulty: ['HARD'],
    },
    {
      id: 'c16_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (intensely hot and passionate):',
      sentenceBefore: 'The heat from the prairie fire was',
      sentenceAfter: 'singeing the whiskers off every jackrabbit.',
      correctAnswer: 'TORRID',
      explanation:
        "T-O-R-R-I-D: Very hot and dry (Latin 'torrere' = to scorch/burn).",
      etymologyHint: 'Latin root for scorching, parching heat.',
      wardenComment: 'Six scorching letters of infernal heat.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 17: THE ECHOING GHOST TOWN =================
  17: [
    {
      id: 'c17_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose groan (low sound of pain/creak) vs grown (matured):',
      sentenceBefore: 'The wooden floorboards of the abandoned saloon let out a loud',
      sentenceAfter: 'under Bill’s heavy boots.',
      options: ['groan', 'grown'],
      correctAnswer: 'groan',
      explanation:
        "'Groan' is a deep sound of pain or creaking. 'Grown' is the past participle of grow.",
      etymologyHint: 'Creaking timber groans.',
      wardenComment: 'Listen to the creaking spectral floorboards!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c17_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the abandoned frontier watering hole:',
      sentenceBefore: 'Dust motes danced across the mahogany bar of the spectral',
      sentenceAfter: 'as the phantom piano played.',
      correctAnswer: 'SALOON',
      explanation:
        'S-A-L-O-O-N: A public room or barroom in the American Old West.',
      etymologyHint: 'From French salon (large reception hall).',
      wardenComment: 'Six letters where pioneer ghosts clink spectral glasses.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c17_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "SPECTRAL / GHOSTLY PHANTOM":',
      sentenceBefore: 'The miners saw a',
      sentenceAfter: 'figure floating across the silver mine shaft.',
      options: ['wraith', 'corporeal', 'tangible', 'substantial'],
      correctAnswer: 'wraith',
      explanation:
        "'Wraith' (Scottish origin) is a ghost or ghostlike image of someone, especially seen shortly before or after death.",
      etymologyHint: 'Scottish folklore term for a ghostly specter or phantom apparition.',
      wardenComment: 'Select the ethereal ghostly entity over solid matter!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'PHANTOM',
      synonymNuance: 'Ethereal ghostly apparition floating in silence',
    },
    {
      id: 'c17_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose serial (in a sequence) vs cereal (grain breakfast):',
      sentenceBefore: 'The silver boomtown went through a',
      sentenceAfter: 'series of sudden booms and total abandonments.',
      options: ['serial', 'cereal'],
      correctAnswer: 'serial',
      explanation:
        "'Serial' means taking place in a series or sequence. 'Cereal' is edible grain.",
      etymologyHint: 'Serial sequence vs cereal grain.',
      wardenComment: 'Chronological sequence of history, not edible morning oats!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c17_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the ghostly presence:',
      sentenceBefore: 'Bill toasted the friendly frontier',
      sentenceAfter: 'who watched the poker game in silence.',
      correctAnswer: 'SPECTER',
      explanation:
        "S-P-E-C-T-E-R: A ghost or phantom (Latin 'specere' = to look/behold).",
      etymologyHint: 'From Latin root for vision or apparition.',
      wardenComment: 'Seven eerie letters haunting the silver saloon.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c17_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Sepulchral (relating to a tomb/funereal) vs Soporific (sleep-inducing):',
      sentenceBefore: 'An eerie and',
      sentenceAfter: 'silence settled over the abandoned cemetery at twilight.',
      options: ['sepulchral', 'soporific'],
      correctAnswer: 'sepulchral',
      explanation:
        "'Sepulchral' means relating to a tomb or burial; gloomy and somber. 'Soporific' means inducing drowsiness or sleep.",
      etymologyHint: "Latin 'sepulcrum' (burial place, tomb).",
      wardenComment: 'Grave-like and tomb-like atmosphere! Pick the funereal adjective.',
      difficulty: ['HARD'],
    },
    {
      id: 'c17_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (causing dread / ghostly unease):',
      sentenceBefore: 'The ghost town had an',
      sentenceAfter: 'beauty under the pale desert moonlight.',
      correctAnswer: 'UNHEIMLICH',
      explanation:
        "U-N-H-E-I-M-L-I-C-H: German for 'uncanny' or eerily unfamiliar (Freud's concept of the uncanny).",
      etymologyHint: "German philosophical term for the eerie, uncanny sense of dread.",
      wardenComment: 'Ten legendary letters of the uncanny folklore realm.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 18: THE SOURDOUGH GEYSER =================
  18: [
    {
      id: 'c18_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose knead (work dough with hands) vs need (require) vs kneed (hit with knee):',
      sentenceBefore: 'Bill had to vigorously',
      sentenceAfter: 'a barrel of flour before pouring it into the geyser.',
      options: ['knead', 'need', 'kneed'],
      correctAnswer: 'knead',
      explanation:
        "'Knead' means to massage or work dough. 'Need' means to require. 'Kneed' is past tense of knee.",
      etymologyHint: 'Knead the bread dough.',
      wardenComment: 'Work the flour and yeast with the true culinary verb!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c18_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the fermented bread culture:',
      sentenceBefore: 'Bill’s famous fifty-year-old',
      sentenceAfter: 'starter fermented faster than desert moonshine.',
      correctAnswer: 'SOURDOUGH',
      explanation:
        'S-O-U-R-D-O-U-G-H: Naturally fermented dough using wild lactobacilli and yeast.',
      etymologyHint: 'Frontier prospectors were nicknamed sourdoughs after their bread starters.',
      wardenComment: 'Nine savory letters bubbling with wild yeast!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c18_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "DELICIOUS / HIGHLY APPETIZING":',
      sentenceBefore: 'The erupting biscuits were remarkably',
      sentenceAfter: 'attracting pioneers from three territories.',
      options: ['scrumptious', 'unpalatable', 'noisome', 'insipid'],
      correctAnswer: 'scrumptious',
      explanation:
        "'Scrumptious' means extremely appetizing or delicious. 'Unpalatable' and 'insipid' mean tasteless/disagreeable.",
      etymologyHint: 'Frontier slang for extremely flavorful and delectable food.',
      wardenComment: 'Select the delicious culinary word over bland or foul foods!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'DELICIOUS',
      synonymNuance: 'Delectable, mouthwatering, and highly satisfying flavor',
    },
    {
      id: 'c18_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose yeast (fermenting fungus) vs east (cardinal direction):',
      sentenceBefore: 'The wild airborne',
      sentenceAfter: 'made the geyser dough rise three hundred feet in the air.',
      options: ['yeast', 'east'],
      correctAnswer: 'yeast',
      explanation:
        "'Yeast' is a microscopic fungus used in baking/brewing. 'East' is the compass direction.",
      etymologyHint: 'Yeast makes dough rise.',
      wardenComment: 'Pick the microorganism that makes bread rise!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c18_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the geothermal boiling spring:',
      sentenceBefore: 'The boiling volcanic',
      sentenceAfter: 'erupted fresh baked biscuits every twenty minutes.',
      correctAnswer: 'GEYSER',
      explanation:
        "G-E-Y-S-E-R: A hot spring in which water intermittently boils and erupts (Icelandic 'Geysir' = gusher).",
      etymologyHint: "From Icelandic 'geysa' (to gush).",
      wardenComment: 'Six letters gushing warm culinary bounty!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c18_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Gastronomic (relating to gourmet cooking) vs Astronomical (celestial):',
      sentenceBefore: 'The frontier geyser became a',
      sentenceAfter: 'wonder celebrated across the entire nation.',
      options: ['gastronomic', 'astronomical'],
      correctAnswer: 'gastronomic',
      explanation:
        "'Gastronomic' relates to the practice or art of choosing, cooking, and eating good food (Greek gaster = stomach).",
      etymologyHint: "Greek 'gaster' (stomach) + 'nomos' (law/custom).",
      wardenComment: 'Pertaining to the art of cooking and dining! Choose the culinary root.',
      difficulty: ['HARD'],
    },
    {
      id: 'c18_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the GRE adjective for abundant, lavish, and bountiful:',
      sentenceBefore: 'The sourdough geyser provided a',
      sentenceAfter: 'feast for every hungry rancher.',
      correctAnswer: 'SUMPTUOUS',
      explanation:
        "S-U-M-P-T-U-O-U-S: Splendid and expensive-looking; lavish, luxurious (Latin 'sumptus' = expense).",
      etymologyHint: "Latin 'sumptus' (cost, expense, magnificence).",
      wardenComment: 'Nine opulent letters describing a magnificent feast.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 19: THE NORTHERN LIGHTS LASSO =================
  19: [
    {
      id: 'c19_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose ray (beam of light) vs ray (marine fish) vs raze (destroy):',
      sentenceBefore: 'Each emerald',
      sentenceAfter: 'of celestial light danced across the snowy peaks.',
      options: ['ray', 'raze'],
      correctAnswer: 'ray',
      explanation:
        "'Ray' is a narrow beam of light. 'Raze' means to tear down or destroy completely.",
      etymologyHint: 'Sun rays and light rays.',
      wardenComment: 'Catch the beam of cosmic light!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c19_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the polar atmospheric light show:',
      sentenceBefore: 'Bill roped the glowing green ribbons of the',
      sentenceAfter: 'draped across the midnight sky.',
      correctAnswer: 'AURORA',
      explanation:
        "A-U-R-O-R-A: Natural electrical light display in high-latitude skies (Roman goddess of dawn).",
      etymologyHint: 'Roman goddess of the dawn; polar electromagnetic lights.',
      wardenComment: 'Six shimmering letters illuminating the northern sky.',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c19_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the elevated / GRE synonym for "SHIMMERING / COLOR-CHANGING":',
      sentenceBefore: 'The sky was bathed in an',
      sentenceAfter: 'glow of violet, green, and gold.',
      options: ['iridescent', 'monochromatic', 'somber', 'drab'],
      correctAnswer: 'iridescent',
      explanation:
        "'Iridescent' (Greek Iris = goddess of the rainbow) means showing luminous colors that seem to change when seen from different angles.",
      etymologyHint: "Greek 'iris' (rainbow) + '-escent' (becoming).",
      wardenComment: 'Identify the rainbow-shifting glow over single drab tones!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'RAINBOW-GLOW',
      synonymNuance: 'Luminous shifting rainbow spectrum',
    },
    {
      id: 'c19_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose hue (color/shade) vs hew (chop/cut with axe):',
      sentenceBefore: 'The aurora shifted to a brilliant emerald',
      sentenceAfter: 'that reflected in the frozen glacial lakes.',
      options: ['hue', 'hew'],
      correctAnswer: 'hue',
      explanation:
        "'Hue' is a color or shade. 'Hew' means to chop or cut with an axe.",
      etymologyHint: 'Hue = Color tint; Hew = Chop wood.',
      wardenComment: 'Select the color tint of the polar night!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c19_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the high atmospheric layer of northern lights:',
      sentenceBefore: 'The charged solar particles collided in the upper',
      sentenceAfter: 'above the continent.',
      correctAnswer: 'IONOSPHERE',
      explanation:
        'I-O-N-O-S-P-H-E-R-E: The layer of the earth\'s atmosphere that contains a high concentration of ions and free electrons.',
      etymologyHint: 'Atmospheric layer named for ionized electromagnetic particles.',
      wardenComment: 'Ten cosmic letters where solar winds become light.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c19_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Coruscating (flashing/sparkling with light) vs Corroborating (confirming):',
      sentenceBefore: 'Bill gazed up at the',
      sentenceAfter: 'display of magnetic energy dancing in the stratosphere.',
      options: ['coruscating', 'corroborating'],
      correctAnswer: 'coruscating',
      explanation:
        "'Coruscating' means flashing or sparkling with light; brilliant (Latin coruscare = to flash). 'Corroborating' means confirming evidence.",
      etymologyHint: "Latin 'coruscare' (to glitter, flash, vibrate).",
      wardenComment: 'Flashing and sparkling with cosmic radiance! Pick the luminous verb.',
      difficulty: ['HARD'],
    },
    {
      id: 'c19_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master vocabulary cipher (ineffable heavenly splendor):',
      sentenceBefore: 'The celestial spectacle possessed an',
      sentenceAfter: 'glory beyond any earthly painting.',
      correctAnswer: 'EMPYREAN',
      explanation:
        "E-M-P-Y-R-E-A-N: Belonging to or deriving from heaven; sublime, celestial (Greek 'empyros' = in fire/highest heaven).",
      etymologyHint: "Ancient Greek term for the highest celestial sphere of pure light.",
      wardenComment: 'Eight sublime letters of the highest celestial sphere.',
      difficulty: ['HARD'],
    },
  ],

  // ================= CHAPTER 20: THE MASTER SPOOL CONVERGENCE =================
  20: [
    {
      id: 'c20_e1',
      type: 'HOMOPHONE',
      prompt: 'Choose all (every one) vs awl (leather punch tool):',
      sentenceBefore: 'Bill gathered',
      sentenceAfter: 'twenty reels of frontier myth into a single master tape.',
      options: ['all', 'awl'],
      correctAnswer: 'all',
      explanation:
        "'All' means the entirety of something. 'Awl' is a small pointed tool for piercing leather.",
      etymologyHint: 'All chapters vs a leather awl.',
      wardenComment: 'Gather the entirety of folklore without tools!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c20_e2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the ultimate meeting and unification of all spools:',
      sentenceBefore: 'The twenty magnetic tapes reached their glorious',
      sentenceAfter: 'at the center of the acoustic universe.',
      correctAnswer: 'CONVERGENCE',
      explanation:
        "C-O-N-V-E-R-G-E-N-C-E: The process or state of converging; coming together into a single whole (Latin 'convergere').",
      etymologyHint: "From Latin 'con-' (together) + 'vergere' (to bend/incline).",
      wardenComment: 'Eleven unified letters completing the master tapestry!',
      difficulty: ['EASY', 'MEDIUM'],
    },
    {
      id: 'c20_syn1',
      type: 'SYNONYM_MATRIX',
      prompt: 'Identify the supreme elevated / GRE synonym for "APEX / HIGHEST CULMINATION":',
      sentenceBefore: 'You have reached the absolute',
      sentenceAfter: 'of linguistic and folklore mastery.',
      options: ['apotheosis', 'nadir', 'abyss', 'base'],
      correctAnswer: 'apotheosis',
      explanation:
        "'Apotheosis' (Greek apotheoun = deify) means the highest point in the development of something; a culmination or deification.",
      etymologyHint: "Greek 'apo-' (from) + 'theos' (god) -> elevation to divine status.",
      wardenComment: 'Select the divine culmination over base nadirs!',
      difficulty: ['MEDIUM', 'HARD'],
      synonymTargetWord: 'CULMINATION',
      synonymNuance: 'Supreme glorification and apex of achievement',
    },
    {
      id: 'c20_m1',
      type: 'HOMOPHONE',
      prompt: 'Choose peak (zenith) vs pique (arouse) vs peek (glance):',
      sentenceBefore: 'The Tape Warden bowed as your score reached its glorious',
      sentenceAfter: 'upon the golden gauge.',
      options: ['peak', 'pique', 'peek'],
      correctAnswer: 'peak',
      explanation:
        "'Peak' is the highest point or zenith. 'Pique' means arouse; 'peek' is a quick look.",
      etymologyHint: 'Peak of achievement.',
      wardenComment: 'Stand at the supreme zenith of linguistic triumph!',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c20_m2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the eternal preservation of folklore:',
      sentenceBefore: 'All American legends are now preserved in',
      sentenceAfter: 'upon the golden reels.',
      correctAnswer: 'PERPETUITY',
      explanation:
        "P-E-R-P-E-T-U-I-T-Y: The state or quality of lasting forever (Latin 'perpetuitas').",
      etymologyHint: "Latin root for endless duration and timeless preservation.",
      wardenComment: 'Ten eternal letters sealing the master archive.',
      difficulty: ['MEDIUM', 'HARD'],
    },
    {
      id: 'c20_h1',
      type: 'HOMOPHONE',
      prompt: 'GRE Dilemma: Grandiloquent (pompous/extravagant language) vs Eloquent (fluent/persuasive speech):',
      sentenceBefore: 'The master decipherer is praised for truly',
      sentenceAfter: 'and flawless articulation of ancient grammar.',
      options: ['eloquent', 'grandiloquent'],
      correctAnswer: 'eloquent',
      explanation:
        "'Eloquent' means fluent or persuasive in speaking or writing. 'Grandiloquent' means pompous and bombastic.",
      etymologyHint: 'Eloquent = beautifully persuasive; Grandiloquent = pretentious bombast.',
      wardenComment: 'A genuine compliment of pure mastery, not hollow pretentious boast!',
      difficulty: ['HARD'],
    },
    {
      id: 'c20_h2',
      type: 'LETTER_CIPHER',
      prompt: 'Decipher the master title for the ultimate compiler of words and meanings:',
      sentenceBefore: 'The Tape Warden crowns you Supreme Master',
      sentenceAfter: 'of the American Frontier Vaults.',
      correctAnswer: 'LEXICOGRAPHER',
      explanation:
        "L-E-X-I-C-O-G-R-A-P-H-E-R: A person who compiles dictionaries and deciphers linguistic roots (Greek 'lexikon' = dictionary + 'graphein' = to write).",
      etymologyHint: "From Greek for 'writer of the lexicon'—master scholar of words.",
      wardenComment: 'Fourteen supreme letters! You have completed all 20 Chapters of Tape Cipher!',
      difficulty: ['HARD'],
    },
  ],
};

// 20 UNIQUE CUSTOM ILLUSTRATIONS FOR EACH CHAPTER
export function renderChapterStoryArtwork(
  chapterIndex: number,
  themeColor: string,
) {
  switch (chapterIndex) {
    case 1: // Raised by Coyotes
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#1a0f07]">
          <defs>
            <radialGradient id="moonGlow1" cx="80%" cy="25%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1a0f07" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="desertDune1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="#120904" />
          <circle cx="320" cy="70" r="38" fill="url(#moonGlow1)" />
          <circle cx="320" cy="70" r="28" fill="#fef08a" />
          <circle cx="50" cy="40" r="1.5" fill="#fef08a" />
          <circle cx="120" cy="65" r="1.5" fill="#fde047" />
          <circle cx="210" cy="30" r="2" fill="#fff" />
          <polygon
            points="0,220 80,140 160,180 240,110 330,190 400,160 400,300 0,300"
            fill="#78350f"
            opacity="0.8"
          />
          <path
            d="M 0 230 Q 150 190 280 240 T 400 230 L 400 300 L 0 300 Z"
            fill="url(#desertDune1)"
          />
          <path
            d="M 230 235 L 245 200 L 260 170 L 275 150 L 290 142 L 285 155 L 275 165 L 280 185 L 290 210 L 295 235 L 275 235 L 265 215 L 250 235 Z"
            fill="#0f0703"
          />
          <ellipse cx="180" cy="235" rx="16" ry="10" fill="#fde047" />
          <circle cx="172" cy="232" r="6" fill="#fbcfe8" />
        </svg>
      );

    case 2: // Rattlesnake Whip
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#0b1f14]">
          <defs>
            <linearGradient id="snakeSkin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="#091810" />
          <circle cx="200" cy="120" r="140" fill="#047857" opacity="0.2" />
          <path
            d="M 80 10 L 120 80 L 100 95 L 150 160 L 135 175 L 180 240"
            stroke="#6ee7b7"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 90 220 C 130 110, 260 90, 220 180 C 190 250, 310 240, 330 160 C 345 100, 290 50, 350 30"
            stroke="url(#snakeSkin)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="355" cy="30" r="12" fill="#047857" />
          <circle cx="357" cy="27" r="3" fill="#ef4444" />
          <ellipse cx="86" cy="223" rx="7" ry="5" fill="#f59e0b" />
          <ellipse cx="80" cy="226" rx="6" ry="4" fill="#d97706" />
        </svg>
      );

    case 3: // Widow-Maker Stallion
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#260e0e]">
          <rect width="400" height="300" fill="#180707" />
          <polygon
            points="0,240 120,220 220,210 320,230 400,210 400,300 0,300"
            fill="#450a0a"
          />
          <g transform="translate(140, 40) scale(0.9)">
            <path
              d="M 40 160 C 20 120, 60 70, 100 80 C 130 90, 150 130, 130 170 C 110 200, 70 210, 40 160 Z"
              fill="#090303"
            />
            <path
              d="M 80 90 C 90 50, 120 20, 140 30 C 145 35, 140 50, 135 60 C 120 75, 100 90, 80 90 Z"
              fill="#090303"
            />
            <circle cx="134" cy="36" r="3" fill="#f87171" />
            <path
              d="M 120 120 L 150 70 L 165 80"
              stroke="#090303"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 50 170 L 40 220 L 30 240"
              stroke="#090303"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>
          <circle cx="215" cy="105" r="10" fill="#fde047" />
        </svg>
      );

    case 4: // Lassoing the Cyclone
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#0f172a]">
          <rect width="400" height="300" fill="#090d16" />
          <path
            d="M 80 30 Q 200 10 320 30 C 290 80, 260 130, 230 180 C 215 210, 205 240, 200 280 C 195 240, 185 210, 170 180 C 140 130, 110 80, 80 30 Z"
            fill="#3b82f6"
            opacity="0.75"
          />
          <ellipse
            cx="200"
            cy="40"
            rx="110"
            ry="18"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="4"
          />
          <ellipse
            cx="200"
            cy="90"
            rx="85"
            ry="14"
            fill="none"
            stroke="#bfdbfe"
            strokeWidth="3.5"
          />
          <ellipse
            cx="200"
            cy="70"
            rx="95"
            ry="16"
            fill="none"
            stroke="#facc15"
            strokeWidth="5"
          />
        </svg>
      );

    case 5: // Carving the Grand Canyon
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#2c1308]">
          <rect width="400" height="300" fill="#1f0a04" />
          <polygon
            points="0,60 140,240 180,280 180,300 0,300"
            fill="#9a3412"
          />
          <polygon
            points="400,60 260,240 220,280 220,300 400,300"
            fill="#c2410c"
          />
          <path
            d="M 195 230 Q 200 260 198 300"
            stroke="#38bdf8"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="150" cy="210" r="14" fill="#e2e8f0" />
        </svg>
      );

    case 6: // Digging the Rio Grande
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#082f49]">
          <rect width="400" height="300" fill="#082032" />
          <path
            d="M 0 160 C 120 120, 160 220, 260 140 C 320 80, 360 180, 400 150 L 400 300 L 0 300 Z"
            fill="#0284c7"
          />
          <path
            d="M 0 175 C 120 135, 160 235, 260 155 C 320 95, 360 195, 400 165"
            stroke="#7dd3fc"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      );

    case 7: // Mountain Lion Saddle
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#2e1065]">
          <rect width="400" height="300" fill="#1e0b40" />
          <g transform="translate(60, 70)">
            <path
              d="M 60 110 C 90 70, 180 60, 230 90 C 260 110, 250 140, 220 150 C 160 160, 90 150, 60 110 Z"
              fill="#ca8a04"
            />
            <circle cx="245" cy="85" r="22" fill="#eab308" />
            <circle cx="255" cy="82" r="4" fill="#15803d" />
            <ellipse cx="160" cy="72" rx="14" ry="4" fill="#451a03" />
          </g>
        </svg>
      );

    case 8: // Shooting Falling Stars
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#1e1b4b]">
          <rect width="400" height="300" fill="#0f0c2e" />
          <circle cx="280" cy="90" r="20" fill="#facc15" />
          <path
            d="M 280 50 L 280 130 M 240 90 L 320 90"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <path
            d="M 100 240 L 240 110 M 115 250 L 255 120"
            stroke="#94a3b8"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      );

    case 9: // Slue-Foot Sue & Giant Catfish
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#3b0764]">
          <rect width="400" height="300" fill="#240538" />
          <g transform="translate(80, 90)">
            <ellipse
              cx="120"
              cy="70"
              rx="75"
              ry="35"
              fill="#047857"
              transform="rotate(-15 120 70)"
            />
            <circle cx="110" cy="10" r="10" fill="#fde047" />
          </g>
        </svg>
      );

    case 10: // The Golden Cassette
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#451a03]">
          <rect width="400" height="300" fill="#270e02" />
          <rect
            x="80"
            y="70"
            width="240"
            height="160"
            rx="16"
            fill="#d97706"
            stroke="#fef08a"
            strokeWidth="5"
          />
          <circle
            cx="150"
            cy="150"
            r="24"
            fill="#451a03"
            stroke="#f59e0b"
            strokeWidth="4"
          />
          <circle
            cx="250"
            cy="150"
            r="24"
            fill="#451a03"
            stroke="#f59e0b"
            strokeWidth="4"
          />
        </svg>
      );

    case 11: // Texas Jackrabbit Chase
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#0f2d2a]">
          <rect width="400" height="300" fill="#091f1c" />
          <path
            d="M 0 240 Q 150 200 400 240 L 400 300 L 0 300 Z"
            fill="#115e59"
          />
          <g transform="translate(160, 100)">
            <ellipse cx="60" cy="80" rx="35" ry="20" fill="#ccfbf1" />
            <circle cx="90" cy="65" r="16" fill="#ccfbf1" />
            <ellipse
              cx="95"
              cy="25"
              rx="6"
              ry="28"
              fill="#f0fdfa"
              transform="rotate(15 95 25)"
            />
            <ellipse
              cx="105"
              cy="28"
              rx="6"
              ry="28"
              fill="#f0fdfa"
              transform="rotate(25 105 28)"
            />
            <circle cx="95" cy="62" r="3" fill="#0f766e" />
          </g>
          <path
            d="M 20 220 Q 80 190 140 220"
            stroke="#5eead4"
            strokeWidth="3"
            strokeDasharray="6 6"
            fill="none"
          />
        </svg>
      );

    case 12: // Iron Horse Race
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#1e293b]">
          <rect width="400" height="300" fill="#0f172a" />
          <line
            x1="0"
            y1="250"
            x2="400"
            y2="250"
            stroke="#94a3b8"
            strokeWidth="6"
          />
          <g transform="translate(100, 110)">
            <rect
              x="20"
              y="50"
              width="150"
              height="80"
              rx="6"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="4"
            />
            <rect x="40" y="10" width="30" height="45" fill="#1e293b" />
            <polygon points="170,80 210,130 170,130" fill="#f59e0b" />
            <circle cx="50" cy="130" r="18" fill="#e2e8f0" />
            <circle cx="100" cy="130" r="18" fill="#e2e8f0" />
            <circle cx="150" cy="130" r="18" fill="#e2e8f0" />
          </g>
          <circle cx="55" cy="70" r="22" fill="#cbd5e1" opacity="0.6" />
          <circle cx="35" cy="40" r="30" fill="#cbd5e1" opacity="0.4" />
        </svg>
      );

    case 13: // Great Blizzard of Deadwood
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#082f49]">
          <rect width="400" height="300" fill="#0c4a6e" />
          <polygon
            points="0,300 80,180 180,300 260,160 360,300 400,300"
            fill="#e0f2fe"
          />
          <circle cx="80" cy="70" r="3" fill="#fff" />
          <circle cx="180" cy="50" r="4" fill="#fff" />
          <circle cx="280" cy="90" r="3" fill="#fff" />
          <circle cx="340" cy="40" r="5" fill="#fff" />
          <path
            d="M 20 80 Q 150 120 380 70"
            stroke="#bae6fd"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 40 130 Q 200 170 360 120"
            stroke="#bae6fd"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 14: // Petrified Forest Riddle
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#2e1065]">
          <rect width="400" height="300" fill="#1e0b40" />
          <polygon
            points="60,280 90,140 120,280"
            fill="#c084fc"
            stroke="#a855f7"
            strokeWidth="3"
          />
          <polygon
            points="180,280 210,100 240,280"
            fill="#e879f9"
            stroke="#d946ef"
            strokeWidth="3"
          />
          <polygon
            points="290,280 320,160 350,280"
            fill="#818cf8"
            stroke="#6366f1"
            strokeWidth="3"
          />
          <circle cx="210" cy="80" r="8" fill="#fde047" />
        </svg>
      );

    case 15: // Gila Monster Gambol
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#431407]">
          <rect width="400" height="300" fill="#270a04" />
          <g transform="translate(100, 120)">
            <ellipse cx="100" cy="50" rx="70" ry="25" fill="#ea580c" />
            <circle cx="170" cy="45" r="20" fill="#1c1917" />
            <circle cx="178" cy="42" r="3" fill="#facc15" />
            <circle cx="70" cy="50" r="10" fill="#1c1917" />
            <circle cx="100" cy="50" r="12" fill="#1c1917" />
            <circle cx="130" cy="50" r="10" fill="#1c1917" />
          </g>
        </svg>
      );

    case 16: // Prairie Fire Stampede
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#450a0a]">
          <rect width="400" height="300" fill="#200404" />
          <path
            d="M 0 200 Q 50 80 100 200 Q 150 60 200 200 Q 250 90 300 200 Q 350 70 400 200 L 400 300 L 0 300 Z"
            fill="#dc2626"
          />
          <path
            d="M 30 220 Q 80 110 130 220 Q 180 90 230 220 Q 280 120 330 220 Q 380 100 400 220 L 400 300 L 30 300 Z"
            fill="#f97316"
          />
          <path
            d="M 60 240 Q 110 140 160 240 Q 210 120 260 240 Q 310 150 360 240 L 360 300 L 60 300 Z"
            fill="#fde047"
          />
        </svg>
      );

    case 17: // Echoing Ghost Town
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#1e1b4b]">
          <rect width="400" height="300" fill="#0f0c2e" />
          <rect
            x="80"
            y="120"
            width="100"
            height="120"
            fill="#312e81"
            stroke="#4338ca"
            strokeWidth="3"
          />
          <polygon points="70,120 130,70 190,120" fill="#1e1b4b" />
          <rect
            x="220"
            y="100"
            width="120"
            height="140"
            fill="#3730a3"
            stroke="#4f46e5"
            strokeWidth="3"
          />
          <circle cx="280" cy="60" r="16" fill="#a5b4fc" opacity="0.5" />
        </svg>
      );

    case 18: // Sourdough Geyser
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#3f2008]">
          <rect width="400" height="300" fill="#201004" />
          <path
            d="M 160 300 Q 190 180 200 40 Q 210 180 240 300 Z"
            fill="#fef08a"
          />
          <circle cx="200" cy="40" r="28" fill="#facc15" />
          <circle cx="160" cy="80" r="16" fill="#fde047" />
          <circle cx="240" cy="90" r="18" fill="#fde047" />
          <circle cx="130" cy="140" r="14" fill="#fbbf24" />
          <circle cx="270" cy="150" r="15" fill="#fbbf24" />
        </svg>
      );

    case 19: // Northern Lights Lasso
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#052e16]">
          <rect width="400" height="300" fill="#021c0d" />
          <path
            d="M 0 60 Q 100 120 200 50 T 400 80 L 400 160 Q 300 200 200 140 T 0 150 Z"
            fill="#22c55e"
            opacity="0.6"
          />
          <path
            d="M 0 90 Q 120 160 240 80 T 400 120 L 400 200 Q 280 240 160 170 T 0 190 Z"
            fill="#86efac"
            opacity="0.4"
          />
          <ellipse
            cx="200"
            cy="110"
            rx="120"
            ry="25"
            fill="none"
            stroke="#facc15"
            strokeWidth="4"
          />
        </svg>
      );

    case 20: // Master Spool Convergence
    default:
      return (
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full rounded-lg shadow-inner bg-[#451a03]">
          <defs>
            <radialGradient id="convergenceGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="#200c02" />
          <circle cx="200" cy="150" r="140" fill="url(#convergenceGlow)" />
          <circle
            cx="200"
            cy="150"
            r="80"
            fill="#78350f"
            stroke="#fef08a"
            strokeWidth="6"
          />
          <circle
            cx="200"
            cy="150"
            r="45"
            fill="#d97706"
            stroke="#fff"
            strokeWidth="3"
          />
          <circle cx="200" cy="150" r="16" fill="#451a03" />
          {Array.from({length: 12}).map((_, i) => {
            const angle = (i * Math.PI) / 6;
            const x1 = 200 + Math.cos(angle) * 45;
            const y1 = 150 + Math.sin(angle) * 45;
            const x2 = 200 + Math.cos(angle) * 78;
            const y2 = 150 + Math.sin(angle) * 78;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fef08a"
                strokeWidth="3"
              />
            );
          })}
        </svg>
      );
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  // --- PLAYGROUND SDK INTEGRATION ---
  const {sdk} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  // --- ASSET PRELOADING ---
  const ASSETS_MANIFEST: Record<string, string> = {
    bg_tape_deck_table: 'assets/images/bg_tape_deck_table.png',
    parchment_puzzle_card: 'assets/images/parchment_puzzle_card.png',
    frontier_myth_illustration: 'assets/images/frontier_myth_illustration.png',
    narrator_tape_warden: 'assets/images/narrator_tape_warden.png',
    tape_spool_assembly: 'assets/images/tape_spool_assembly.png',
    ribbon_tension_meter: 'assets/images/ribbon_tension_meter.png',
  };
  const {assets, isReady: assetsReady} = useAssets(ASSETS_MANIFEST);

  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;
  const totalChapters = (getConfig('totalChapters') as number) || 20;

  // --- QUESTION VAULT STATS COMPUTATION ---
  const vaultStats = useMemo(() => {
    let total = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let homophoneCount = 0;
    let cipherCount = 0;
    let synonymCount = 0;
    const byChapter: Record<
      number,
      {easy: number; medium: number; hard: number; total: number}
    > = {};

    for (let c = 1; c <= 20; c++) {
      const list = QUESTION_POOL[c] || [];
      let cEasy = 0;
      let cMed = 0;
      let cHard = 0;
      for (const p of list) {
        total++;
        if (p.difficulty.includes('EASY')) {
          easyCount++;
          cEasy++;
        }
        if (p.difficulty.includes('MEDIUM')) {
          mediumCount++;
          cMed++;
        }
        if (p.difficulty.includes('HARD')) {
          hardCount++;
          cHard++;
        }
        if (p.type === 'HOMOPHONE') homophoneCount++;
        else if (p.type === 'LETTER_CIPHER') cipherCount++;
        else if (p.type === 'SYNONYM_MATRIX') synonymCount++;
      }
      byChapter[c] = {
        easy: cEasy,
        medium: cMed,
        hard: cHard,
        total: list.length,
      };
    }
    return {
      total,
      easyCount,
      mediumCount,
      hardCount,
      homophoneCount,
      cipherCount,
      synonymCount,
      byChapter,
    };
  }, []);

  // --- DIFFICULTY SETTINGS ---
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('MEDIUM');

  const difficultyConfig = useMemo(() => {
    switch (selectedDifficulty) {
      case 'EASY':
        return {
          label: 'Greenhorn (Easy)',
          maxFractures: 7,
          multiplier: 1.0,
          description:
            'Fundamental homophones, missing-letter ciphers & core synonym matches with relaxed tape integrity (7 strikes).',
        };
      case 'HARD':
        return {
          label: 'Master Linguist (Hard / GRE Trials)',
          maxFractures: 4,
          multiplier: 2.5,
          description:
            'Authentic GRE-tier vocabulary, archaic synonym nuances (bellicose, inexorable, deleterious, conflagration, apotheosis) & strict tape integrity (4 strikes) with 2.5x score bonus.',
        };
      case 'MEDIUM':
      default:
        return {
          label: 'Frontier Scout (Medium / SAT Prep)',
          maxFractures: 6,
          multiplier: 1.5,
          description:
            'SAT-prep level diction, synonym matrices & phonetics (affect/effect, discreet/discrete, tenacious, alacrity, opulent) with standard tape integrity (6 strikes) & 1.5x score bonus.',
        };
    }
  }, [selectedDifficulty]);

  // --- GAMEPLAY STATE ---
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1, // Current Chapter (1 to 20)
    fractures: 0,
    flux: getConfig('initialFlux') as number,
  });

  // Track active chapter's randomized puzzle list
  const [chapterPuzzles, setChapterPuzzles] = useState<PuzzleDilemma[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Timers & Accuracy Tracking
  const [puzzleElapsedSeconds, setPuzzleElapsedSeconds] = useState<number>(0);
  const [chapterElapsedSeconds, setChapterElapsedSeconds] = useState<number>(0);
  const [totalRunSeconds, setTotalRunSeconds] = useState<number>(0);
  const [lastChapterDuration, setLastChapterDuration] = useState<number>(0);
  const [lastSpeedBonus, setLastSpeedBonus] = useState<number>(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] =
    useState<number>(0);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState<number>(0);

  // Lesson Modal State
  const [activeLessonModal, setActiveLessonModal] =
    useState<LessonModalData | null>(null);
  const [lastAnsweredLesson, setLastAnsweredLesson] =
    useState<LessonModalData | null>(null);

  // Modals & UI states
  const [feedbackToast, setFeedbackToast] = useState<{
    headline: string;
    body: string;
    type: 'success' | 'error' | 'info';
    key: number;
    lessonData?: LessonModalData;
  } | null>(null);
  const [isChapterLoreOpen, setIsChapterLoreOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState<boolean>(false);
  const [isVaultArchiveOpen, setIsVaultArchiveOpen] = useState<boolean>(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [isSfxMuted, setIsSfxMuted] = useState<boolean>(false);
  const [wardenDialogue, setWardenDialogue] = useState<string>(
    'Greetings, traveler. Twenty magnetic spools hold our frontier heritage... Keep your grammar true!',
  );
  const [streakCount, setStreakCount] = useState<number>(0);

  // Persistent High Scores
  const [highScores, setHighScores] = useState<HighScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tape_cipher_high_scores_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load high scores', e);
    }
    return [
      {
        id: 'hs_1',
        difficulty: 'HARD',
        score: 14850,
        chaptersCleared: 20,
        totalTimeSeconds: 380,
        accuracyPercent: 98,
        date: '1885-06-12',
      },
      {
        id: 'hs_2',
        difficulty: 'MEDIUM',
        score: 9420,
        chaptersCleared: 20,
        totalTimeSeconds: 440,
        accuracyPercent: 94,
        date: '1885-07-04',
      },
      {
        id: 'hs_3',
        difficulty: 'EASY',
        score: 5200,
        chaptersCleared: 20,
        totalTimeSeconds: 520,
        accuracyPercent: 90,
        date: '1885-08-20',
      },
    ];
  });

  const saveHighScore = useCallback(
    (record: Omit<HighScoreRecord, 'id' | 'date'>) => {
      const newRecord: HighScoreRecord = {
        ...record,
        id: `hs_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };
      setHighScores((prev) => {
        const updated = [...prev, newRecord].sort((a, b) => b.score - a.score);
        try {
          localStorage.setItem(
            'tape_cipher_high_scores_v3',
            JSON.stringify(updated.slice(0, 20)),
          );
        } catch (e) {
          console.warn('Failed to save high score', e);
        }
        return updated.slice(0, 20);
      });
    },
    [],
  );

  // Visual animation references
  const spoolAngleRef = useRef<number>(0);
  const needleAngleRef = useRef<number>(-0.75);
  const sparkParticlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }>
  >([]);

  // Current Story Chapter Metadata
  const currentChapterStory = useMemo(() => {
    const idx = Math.min(
      Math.max(0, (gameState.level || 1) - 1),
      CHAPTER_LORE_DATABASE.length - 1,
    );
    return CHAPTER_LORE_DATABASE[idx];
  }, [gameState.level]);

  // Current Active Puzzle
  const currentPuzzle = useMemo(() => {
    if (!chapterPuzzles.length) return null;
    const pIdx = Math.min(
      Math.max(0, currentPuzzleIndex),
      chapterPuzzles.length - 1,
    );
    return chapterPuzzles[pIdx];
  }, [chapterPuzzles, currentPuzzleIndex]);

  // Generate & Shuffle puzzles for a chapter
  const prepareChapterPuzzles = useCallback(
    (chapterIndex: number, diff: Difficulty) => {
      const pool = QUESTION_POOL[chapterIndex] || QUESTION_POOL[1];
      let suitable = pool.filter((p) => p.difficulty.includes(diff));
      if (!suitable.length) suitable = pool;

      const shuffledPuzzles = shuffle(suitable);
      setChapterPuzzles(shuffledPuzzles);
      setCurrentPuzzleIndex(0);
      setGuessedLetters([]);
      setActiveHint(null);
      setPuzzleElapsedSeconds(0);
      setChapterElapsedSeconds(0);

      if (shuffledPuzzles[0]?.options) {
        setShuffledOptions(shuffle(shuffledPuzzles[0].options));
      } else {
        setShuffledOptions([]);
      }

      if (shuffledPuzzles[0]) {
        setWardenDialogue(shuffledPuzzles[0].wardenComment);
      }
    },
    [],
  );

  // Update shuffled options whenever current puzzle changes
  useEffect(() => {
    if (currentPuzzle?.options) {
      setShuffledOptions(shuffle(currentPuzzle.options));
    } else {
      setShuffledOptions([]);
    }
    setGuessedLetters([]);
    setActiveHint(null);
    setPuzzleElapsedSeconds(0);
  }, [currentPuzzle]);

  // Live Timer Ticking effect
  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;
    if (
      isChapterLoreOpen ||
      isGameMenuOpen ||
      isHowToPlayOpen ||
      isHighScoresOpen ||
      isVaultArchiveOpen ||
      activeLessonModal
    )
      return;

    const interval = setInterval(() => {
      setPuzzleElapsedSeconds((prev) => prev + 0.1);
      setChapterElapsedSeconds((prev) => prev + 0.1);
      setTotalRunSeconds((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [
    gameState.status,
    isChapterLoreOpen,
    isGameMenuOpen,
    isHighScoresOpen,
    isHowToPlayOpen,
    isVaultArchiveOpen,
    activeLessonModal,
  ]);

  // Input Hook
  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  const startButtonRef = useAutoFocus<HTMLButtonElement>(
    gameState.status === 'START',
  );

  // SFX and Music Toggles
  const handleToggleSfx = useCallback(() => {
    const muted = gameAudio.toggleMute();
    setIsSfxMuted(muted);
    if (!muted) gameAudio.playCrispClick();
  }, []);

  const handleToggleMusic = useCallback(() => {
    setIsMusicMuted((prev) => !prev);
    gameAudio.playCrispClick();
  }, []);

  // LifeCycle hooks
  usePlaygroundGameLifecycle(gameState, sdk);

  // Init Game / Start Run
  const initGame = useCallback(() => {
    console.log('GAME_STARTED');
    const startingDiff = selectedDifficulty;
    setGameState({
      status: 'PLAYING',
      score: 0,
      level: 1,
      fractures: 0,
      flux: getConfig('initialFlux') as number,
    });
    setStreakCount(0);
    setTotalRunSeconds(0);
    setTotalQuestionsAnswered(0);
    setTotalCorrectAnswers(0);
    setIsChapterLoreOpen(false);
    setIsGameMenuOpen(false);
    setIsHighScoresOpen(false);
    setIsVaultArchiveOpen(false);
    needleAngleRef.current = -0.75;
    sparkParticlesRef.current = [];

    prepareChapterPuzzles(1, startingDiff);

    if (sdk) sdk.startGame();
    gameAudio.playLevelUpStinger();
  }, [prepareChapterPuzzles, sdk, selectedDifficulty]);

  // Restart current chapter
  const restartCurrentChapter = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: 'PLAYING',
      fractures: 0,
      flux: Math.max(prev.flux, getConfig('initialFlux') as number),
    }));
    prepareChapterPuzzles(gameState.level, selectedDifficulty);
    setIsGameMenuOpen(false);
    needleAngleRef.current = -0.75;
    gameAudio.playConfirmSelect();
  }, [gameState.level, prepareChapterPuzzles, selectedDifficulty]);

  // Spawn fracture spark VFX
  const triggerFractureSparks = useCallback(
    (count = 16) => {
      const startX = canvasWidth * 0.42;
      const startY = canvasHeight * 0.42;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 240 + 80;
        sparkParticlesRef.current.push({
          x: startX + (Math.random() * 200 - 100),
          y: startY + (Math.random() * 40 - 20),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 0.5 + 0.3,
          color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
        });
      }
    },
    [canvasWidth, canvasHeight],
  );

  // Handle Correct Answer with Dynamic Speed Bonus
  const handleSolveSuccess = useCallback(
    (explanation: string, solvedPuzzle: PuzzleDilemma) => {
      gameAudio.playCoinPickup();
      setTotalQuestionsAnswered((prev) => prev + 1);
      setTotalCorrectAnswers((prev) => prev + 1);

      const speedBonus = Math.max(
        0,
        Math.floor(Math.max(0, 12 - puzzleElapsedSeconds) * 10),
      );
      const basePts = getConfig('baseScorePerCorrect') as number;
      const streakMultiplier = getConfig('streakBonus') as number;
      const bonus = streakCount * streakMultiplier;
      const rawPoints = basePts + bonus + speedBonus;
      const pointsEarned = Math.round(
        rawPoints * difficultyConfig.multiplier,
      );

      const newScore = gameState.score + pointsEarned;
      console.log('SCORE_UPDATED', newScore);

      setStreakCount((prev) => prev + 1);
      setGameState((prev) => ({
        ...prev,
        score: newScore,
        flux: Math.min(10, (prev.flux || 0) + 1),
      }));

      const lessonData: LessonModalData = {
        status: 'correct',
        puzzle: solvedPuzzle,
        speedBonus,
        pointsEarned,
        solveTimeSeconds: puzzleElapsedSeconds,
      };
      setLastAnsweredLesson(lessonData);

      setFeedbackToast({
        headline: `✓ Deciphered in ${puzzleElapsedSeconds.toFixed(1)}s! +${pointsEarned} pts (Speed: +${speedBonus})`,
        body: explanation,
        type: 'success',
        key: Date.now(),
        lessonData,
      });

      // Check if Chapter Finished or Next Puzzle
      const nextPIdx = currentPuzzleIndex + 1;
      if (nextPIdx < chapterPuzzles.length) {
        setCurrentPuzzleIndex(nextPIdx);
        setGuessedLetters([]);
        setActiveHint(null);
        setWardenDialogue(chapterPuzzles[nextPIdx].wardenComment);
      } else {
        // Chapter Complete!
        const nextChap = gameState.level + 1;
        setLastChapterDuration(chapterElapsedSeconds);
        setLastSpeedBonus(
          Math.max(0, Math.floor((60 - chapterElapsedSeconds) * 5)),
        );

        if (nextChap <= totalChapters) {
          gameAudio.playLevelUpStinger();
          setIsChapterLoreOpen(true);
          setGameState((prev) => ({
            ...prev,
            level: nextChap,
            fractures: 0,
          }));
          prepareChapterPuzzles(nextChap, selectedDifficulty);
        } else {
          // ALL 20 CHAPTERS COMPLETE: GRAND VICTORY!
          gameAudio.playVictoryFanfare();
          const finalAcc = Math.round(
            ((totalCorrectAnswers + 1) / (totalQuestionsAnswered + 1)) * 100,
          );
          saveHighScore({
            difficulty: selectedDifficulty,
            score: newScore,
            chaptersCleared: 20,
            totalTimeSeconds: Math.round(totalRunSeconds),
            accuracyPercent: finalAcc,
          });

          setGameState((prev) => ({
            ...prev,
            status: 'VICTORY',
          }));
        }
      }
    },
    [
      chapterElapsedSeconds,
      chapterPuzzles,
      currentPuzzleIndex,
      difficultyConfig.multiplier,
      gameState.level,
      gameState.score,
      prepareChapterPuzzles,
      puzzleElapsedSeconds,
      saveHighScore,
      selectedDifficulty,
      streakCount,
      totalChapters,
      totalCorrectAnswers,
      totalQuestionsAnswered,
      totalRunSeconds,
    ],
  );

  // Handle Mistake / Fracture
  const handleMistake = useCallback(
    (
      errorMsg: string,
      wrongChoice?: string,
      failedPuzzle?: PuzzleDilemma,
      allowLesson = true,
    ) => {
      gameAudio.playErrorBuzz();
      triggerFractureSparks(24);
      setStreakCount(0);
      setTotalQuestionsAnswered((prev) => prev + 1);

      const maxF = difficultyConfig.maxFractures;
      const nextFractures = (gameState.fractures || 0) + 1;

      setGameState((prev) => ({
        ...prev,
        fractures: nextFractures,
      }));

      const isGameOver = nextFractures >= maxF;
      const lessonData: LessonModalData | undefined =
        failedPuzzle && (allowLesson || isGameOver)
          ? {
              status: 'incorrect',
              puzzle: failedPuzzle,
              userChoice: wrongChoice,
              solveTimeSeconds: puzzleElapsedSeconds,
            }
          : undefined;

      if (lessonData) {
        setLastAnsweredLesson(lessonData);
      }

      setFeedbackToast({
        headline: `✗ Tape Fracture +1 (Tension: ${nextFractures}/${maxF})`,
        body: errorMsg,
        type: 'error',
        key: Date.now(),
        lessonData,
      });

      setWardenDialogue(
        `Watch the tension gauge! Structural fracture ${nextFractures} of ${maxF}. The oxide layer is groaning!`,
      );

      if (nextFractures >= maxF) {
        // RIBBON SNAPPED: GAME OVER
        gameAudio.playChiptuneExplosion();
        const finalAcc = Math.max(
          1,
          Math.round(
            (totalCorrectAnswers / (totalQuestionsAnswered + 1)) * 100,
          ),
        );
        saveHighScore({
          difficulty: selectedDifficulty,
          score: gameState.score,
          chaptersCleared: Math.max(0, gameState.level - 1),
          totalTimeSeconds: Math.round(totalRunSeconds),
          accuracyPercent: finalAcc,
        });

        setTimeout(() => {
          gameAudio.playDefeatMotif();
          setGameState((prev) => ({...prev, status: 'GAME_OVER'}));
        }, 500);
      }
    },
    [
      difficultyConfig.maxFractures,
      gameState.fractures,
      gameState.level,
      gameState.score,
      puzzleElapsedSeconds,
      saveHighScore,
      selectedDifficulty,
      totalCorrectAnswers,
      totalQuestionsAnswered,
      totalRunSeconds,
      triggerFractureSparks,
    ],
  );

  // Action: Choose Option (Homophone or Synonym Matrix)
  const handleSelectOption = useCallback(
    (chosen: string) => {
      if (gameState.status !== 'PLAYING' || !currentPuzzle) return;
      if (
        currentPuzzle.type !== 'HOMOPHONE' &&
        currentPuzzle.type !== 'SYNONYM_MATRIX'
      )
        return;

      const isCorrect =
        chosen.trim().toLowerCase() ===
        currentPuzzle.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        handleSolveSuccess(currentPuzzle.explanation, currentPuzzle);
      } else {
        handleMistake(
          `'${chosen}' is incorrect. ${currentPuzzle.explanation}`,
          chosen,
          currentPuzzle,
          true,
        );
      }
    },
    [currentPuzzle, gameState.status, handleMistake, handleSolveSuccess],
  );

  // Action: Letter Cipher Guess (Hangman style)
  const handleLetterGuess = useCallback(
    (letter: string) => {
      if (gameState.status !== 'PLAYING' || !currentPuzzle) return;
      if (currentPuzzle.type !== 'LETTER_CIPHER') return;

      const upper = letter.toUpperCase();
      if (guessedLetters.includes(upper)) return;

      const newGuessed = [...guessedLetters, upper];
      setGuessedLetters(newGuessed);

      const targetWord = currentPuzzle.correctAnswer.toUpperCase();
      if (targetWord.includes(upper)) {
        gameAudio.playConfirmSelect();
        const allSolved = targetWord
          .split('')
          .every((char) => newGuessed.includes(char));
        if (allSolved) {
          handleSolveSuccess(currentPuzzle.explanation, currentPuzzle);
        }
      } else {
        handleMistake(
          `✗ Letter '${upper}' is not in the spool cipher ribbon. Tape fracture recorded!`,
          upper,
          currentPuzzle,
          false,
        );
      }
    },
    [
      currentPuzzle,
      gameState.status,
      guessedLetters,
      handleMistake,
      handleSolveSuccess,
    ],
  );

  // Action: Audio Flux Hint
  const handleUseFluxHint = useCallback(() => {
    if (gameState.status !== 'PLAYING' || !currentPuzzle) return;
    const cost = getConfig('fluxCostPerHint') as number;
    if ((gameState.flux || 0) < cost) {
      gameAudio.playErrorBuzz();
      setFeedbackToast({
        headline: 'Flux Depleted',
        body: 'Insufficient Audio Flux! Solve puzzles quickly to generate magnetic energy.',
        type: 'info',
        key: Date.now(),
      });
      return;
    }

    gameAudio.playPowerupChime();
    setGameState((prev) => ({
      ...prev,
      flux: (prev.flux || 0) - cost,
    }));

    if (currentPuzzle.type === 'LETTER_CIPHER') {
      const targetWord = currentPuzzle.correctAnswer.toUpperCase();
      const unrevealed = targetWord
        .split('')
        .filter((char) => !guessedLetters.includes(char));
      if (unrevealed.length > 0) {
        const revealChar = unrevealed[0];
        handleLetterGuess(revealChar);
        setActiveHint(
          `Magnetic Flux resonated! Etymology Clue: ${currentPuzzle.etymologyHint}`,
        );
        return;
      }
    }

    setActiveHint(`Etymology Clue: ${currentPuzzle.etymologyHint}`);
    setWardenDialogue(
      `"Here's what the magnetic archives say: ${currentPuzzle.etymologyHint}"`,
    );
  }, [
    currentPuzzle,
    gameState.flux,
    gameState.status,
    guessedLetters,
    handleLetterGuess,
  ]);

  // Physical Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'PLAYING') return;
      if (
        isGameMenuOpen ||
        isHowToPlayOpen ||
        isChapterLoreOpen ||
        isHighScoresOpen ||
        isVaultArchiveOpen
      )
        return;

      if (e.key === 'Escape') {
        setIsGameMenuOpen((prev) => !prev);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleUseFluxHint();
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        if (currentPuzzle?.type === 'LETTER_CIPHER') {
          gameAudio.playErrorBuzz();
          setFeedbackToast({
            headline: 'Magnetic Cipher Encrypted',
            body: 'The full etymology spool is locked until all missing letters in the cipher ribbon are revealed!',
            type: 'info',
            key: Date.now(),
          });
          return;
        }
        const targetLesson =
          lastAnsweredLesson ||
          (currentPuzzle
            ? {
                status: 'study' as const,
                puzzle: currentPuzzle,
              }
            : null);
        if (targetLesson) {
          setActiveLessonModal((prev) => (prev ? null : targetLesson));
        }
        return;
      }

      if (currentPuzzle?.type === 'LETTER_CIPHER') {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          handleLetterGuess(key);
        }
      } else if (
        (currentPuzzle?.type === 'HOMOPHONE' ||
          currentPuzzle?.type === 'SYNONYM_MATRIX') &&
        shuffledOptions.length > 0
      ) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= shuffledOptions.length) {
          handleSelectOption(shuffledOptions[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentPuzzle,
    gameState.status,
    handleLetterGuess,
    handleSelectOption,
    handleUseFluxHint,
    isChapterLoreOpen,
    isGameMenuOpen,
    isHighScoresOpen,
    isHowToPlayOpen,
    isVaultArchiveOpen,
    shuffledOptions,
  ]);

  // Update loop for animations
  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const rotSpeed = getConfig('spoolRotationSpeed') as number;
      if (gameState.status === 'PLAYING') {
        spoolAngleRef.current += dt * rotSpeed;
      }

      const maxF = difficultyConfig.maxFractures;
      const fracRatio = Math.min(1, (gameState.fractures || 0) / maxF);
      const targetNeedle = -0.75 + fracRatio * 1.5;
      needleAngleRef.current += (targetNeedle - needleAngleRef.current) * 0.1;

      sparkParticlesRef.current = sparkParticlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life + dt,
        }))
        .filter((p) => p.life < p.maxLife);

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        prepareCanvas(ctx, canvasWidth, canvasHeight);

        drawBackground(
          ctx,
          assets['bg_tape_deck_table'],
          canvasWidth,
          canvasHeight,
          '#1a120b',
        );

        const leftSpoolX = canvasWidth * 0.355;
        const rightSpoolX = canvasWidth * 0.545;
        const spoolsY = canvasHeight * 0.44;
        const spoolRadius = 78;

        const drawSpool = (
          cx: number,
          cy: number,
          angle: number,
          isRight: boolean,
        ) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);

          if (
            assets['tape_spool_assembly'] &&
            assets['tape_spool_assembly'].complete
          ) {
            ctx.drawImage(
              assets['tape_spool_assembly'],
              -spoolRadius,
              -spoolRadius,
              spoolRadius * 2,
              spoolRadius * 2,
            );
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, spoolRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2d2218';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#d97706';
            ctx.stroke();
          }
          ctx.restore();

          ctx.beginPath();
          const tapeThickness = isRight
            ? 35 + ((gameState.level || 1) - 1) * 2
            : 65 - ((gameState.level || 1) - 1) * 2;
          ctx.arc(cx, cy, Math.max(0, tapeThickness), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(25, 18, 12, 0.75)';
          ctx.lineWidth = 14;
          ctx.stroke();
        };

        drawSpool(leftSpoolX, spoolsY, spoolAngleRef.current, false);
        drawSpool(rightSpoolX, spoolsY, -spoolAngleRef.current * 1.05, true);

        // Ribbon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(leftSpoolX, spoolsY + spoolRadius * 0.7);
        ctx.lineTo(leftSpoolX + 40, spoolsY + spoolRadius * 0.95);
        ctx.lineTo(rightSpoolX - 40, spoolsY + spoolRadius * 0.95);
        ctx.lineTo(rightSpoolX, spoolsY + spoolRadius * 0.7);

        const fractures = gameState.fractures || 0;
        const jitter =
          fractures > 0 ? (Math.random() - 0.5) * fractures * 2.5 : 0;
        ctx.lineWidth = Math.max(1, 6 - fractures * 0.7);
        ctx.strokeStyle = fractures >= 4 ? '#dc2626' : '#3f2d1e';
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(leftSpoolX + 40, spoolsY + spoolRadius * 0.95 + jitter);
        ctx.bezierCurveTo(
          canvasWidth * 0.42,
          spoolsY + spoolRadius * 0.95 + jitter * 2,
          canvasWidth * 0.48,
          spoolsY + spoolRadius * 0.95 - jitter * 2,
          rightSpoolX - 40,
          spoolsY + spoolRadius * 0.95 + jitter,
        );
        ctx.strokeStyle =
          fractures >= 5
            ? '#ef4444'
            : fractures >= 3
              ? '#f59e0b'
              : 'rgba(217, 119, 6, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Sparks
        for (const p of sparkParticlesRef.current) {
          const alpha = 1 - p.life / p.maxLife;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, 3 * alpha), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Needle meter
        const meterX = canvasWidth * 0.71;
        const meterY = canvasHeight * 0.35;
        const meterW = 120;
        const meterH = 110;

        ctx.save();
        if (
          assets['ribbon_tension_meter'] &&
          assets['ribbon_tension_meter'].complete
        ) {
          ctx.drawImage(
            assets['ribbon_tension_meter'],
            meterX - meterW / 2,
            meterY - meterH / 2,
            meterW,
            meterH,
          );
        }
        const pivotX = meterX;
        const pivotY = meterY + 12;
        ctx.translate(pivotX, pivotY);
        ctx.rotate(needleAngleRef.current);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -38);
        ctx.strokeStyle =
          (gameState.fractures || 0) >= 3 ? '#ef4444' : '#b45309';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [
    assets,
    canvasHeight,
    canvasWidth,
    difficultyConfig.maxFractures,
    gameState.fractures,
    gameState.level,
    gameState.status,
  ]);

  // Autoplay URL flag
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame]);

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col bg-[#120c08] text-amber-100 font-serif select-none">
      {/* Loading Splash */}
      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#150e09] text-amber-200">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-amber-300 rounded-full animate-spin mb-4" />
          <div className="text-xl tracking-widest uppercase font-bold text-amber-300">
            Threading Magnetic Tape Deck...
          </div>
        </div>
      )}

      {/* Audio Track */}
      <BackgroundMusic
        url={BACKGROUND_MUSIC_URL}
        isPlaying={gameState.status === 'PLAYING'}
        isMuted={isMusicMuted}
      />

      {/* TOP HUD BAR */}
      <header className="w-full bg-[#1e140d]/95 border-b-2 border-amber-800/60 px-3 py-2 z-20 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-xl">
        {/* Left: Chapter indicator & Difficulty */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-600/50 rounded text-xs text-amber-300 font-sans tracking-wide">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">
              Ch. {gameState.level} / {totalChapters}
            </span>
          </div>

          <div className="px-2 py-0.5 rounded text-[11px] font-sans font-bold bg-amber-900/60 border border-amber-700/50 text-amber-200 uppercase tracking-wider hidden sm:inline-block">
            {selectedDifficulty} ({difficultyConfig.multiplier}x)
          </div>

          <button
            onClick={() => setIsVaultArchiveOpen(true)}
            title="Inspect Question Vault Counts"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 hover:bg-amber-950/80 border border-amber-800/60 text-[11px] font-sans text-amber-300 transition-colors">
            <Database className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Vault:</span>
            <span className="font-bold text-yellow-300">{vaultStats.total}</span>
          </button>

          <span className="hidden lg:inline-block text-xs md:text-sm font-bold text-amber-200 tracking-wider truncate max-w-[180px]">
            {currentChapterStory?.tallTaleName}
          </span>
        </div>

        {/* Center: Live Timer, Score & Tension */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs md:text-sm font-sans">
          {/* Live Solve Timer */}
          <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded border border-amber-900/80 text-amber-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{puzzleElapsedSeconds.toFixed(1)}s</span>
          </div>

          {/* Score Readout */}
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded border border-amber-900/60">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-amber-300/70">Score:</span>
            <span className="font-bold text-amber-100">{gameState.score}</span>
          </div>

          {/* Flux */}
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded border border-amber-900/60">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300/70">Flux:</span>
            <span className="font-bold text-amber-200">
              {gameState.flux || 0}
            </span>
          </div>

          {/* Tension / Fractures */}
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-amber-900/60">
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                (gameState.fractures || 0) >=
                difficultyConfig.maxFractures - 1
                  ? 'text-red-500 animate-bounce'
                  : 'text-amber-500'
              }`}
            />
            <div className="flex gap-1 items-center">
              {Array.from({length: difficultyConfig.maxFractures}).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-3.5 rounded-sm transition-all ${
                    i < (gameState.fractures || 0)
                      ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      : 'bg-amber-950/60 border border-amber-800/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Records, Guide & Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsVaultArchiveOpen(true)}
            title="Question Bank Vault Counter"
            className="p-1.5 rounded bg-amber-950/70 hover:bg-amber-800/70 border border-amber-700/60 text-amber-300 transition-colors">
            <Database className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsHighScoresOpen(true)}
            title="High Scores & Records"
            className="p-1.5 rounded bg-amber-950/70 hover:bg-amber-800/70 border border-amber-700/60 text-yellow-400 transition-colors">
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsHowToPlayOpen(true)}
            title="How to Play"
            className="p-1.5 rounded bg-amber-950/70 hover:bg-amber-800/70 border border-amber-700/60 text-amber-200 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsGameMenuOpen(true)}
            data-testid="menu-toggle-button"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-amber-800/80 hover:bg-amber-700 border border-amber-600 rounded text-xs font-bold text-amber-100 tracking-wider shadow-md transition-all active:scale-95">
            <Pause className="w-3.5 h-3.5" />
            <span>MENU</span>
          </button>
        </div>
      </header>

      {/* MAIN PLAYFIELD AREA */}
      <main className="flex-1 w-full min-h-0 relative flex flex-col md:flex-row items-center justify-center p-2 gap-2 overflow-hidden">
        {/* Background Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              width: `min(100%, calc(100vh * ${canvasWidth} / ${canvasHeight}))`,
            }}
            className="h-auto max-w-full max-h-full object-cover pointer-events-none opacity-80"
          />
        </div>

        {/* PARCHMENT CARD & INTERACTIVE WORKSTATION */}
        {gameState.status === 'PLAYING' && currentPuzzle && (
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-between h-full max-h-[92%] p-2 pointer-events-auto">
            {/* Top Warden Dialogue */}
            <div className="w-full bg-[#24170d]/90 border-2 border-amber-800/80 rounded-lg p-2.5 sm:p-3 shadow-2xl flex items-center gap-3 backdrop-blur-sm">
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full border-2 border-amber-600/70 overflow-hidden bg-black shadow-inner">
                {assets['narrator_tape_warden'] ? (
                  <img
                    src="assets/images/narrator_tape_warden.png"
                    alt="Tape Warden"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-500 font-bold">
                    TW
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-sans font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span>The Tape Warden</span>
                  {streakCount >= 2 && (
                    <span className="text-yellow-400 font-normal flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
                      Streak x{streakCount}
                    </span>
                  )}
                  {currentPuzzle.type === 'SYNONYM_MATRIX' && (
                    <span className="text-amber-300 font-semibold text-[10px] px-2 py-0.5 bg-amber-900/60 border border-amber-600/50 rounded flex items-center gap-1">
                      <Wand2 className="w-3 h-3 text-yellow-400" />
                      Synonym Matrix Challenge
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-amber-100 italic line-clamp-2 leading-snug">
                  "{wardenDialogue}"
                </div>
              </div>

              {/* Actions on Warden bar: Lesson Rule & Flux Hint */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (currentPuzzle?.type === 'LETTER_CIPHER') {
                      gameAudio.playErrorBuzz();
                      setFeedbackToast({
                        headline: 'Magnetic Cipher Encrypted',
                        body: 'The full etymology spool is locked until all missing letters in the cipher ribbon are revealed!',
                        type: 'info',
                        key: Date.now(),
                      });
                      return;
                    }
                    const targetLesson =
                      lastAnsweredLesson ||
                      (currentPuzzle
                        ? {
                            status: 'study' as const,
                            puzzle: currentPuzzle,
                          }
                        : null);
                    if (targetLesson) {
                      setActiveLessonModal(targetLesson);
                      gameAudio.playConfirmSelect();
                    }
                  }}
                  title="Open Full Grammar Lesson & Etymology Spool [L]"
                  className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded bg-amber-950/80 hover:bg-amber-800 border border-amber-600/70 text-amber-200 transition-transform active:scale-95 shadow-md">
                  <div className="flex items-center gap-1 text-[11px] font-bold font-sans">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>LESSON</span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-sans">
                    [Key L]
                  </span>
                </button>

                <button
                  onClick={handleUseFluxHint}
                  title="Spend 1 Flux for Etymology Clue [Space]"
                  className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded bg-amber-900/80 hover:bg-amber-700 border border-amber-500/60 text-amber-200 transition-transform active:scale-95 shadow-md">
                  <div className="flex items-center gap-1 text-[11px] font-bold font-sans">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
                    <span>HINT</span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-sans">
                    -1 Flux
                  </span>
                </button>
              </div>
            </div>

            {/* PARCHMENT CARD */}
            <div className="w-full my-auto flex-1 min-h-[160px] max-h-[290px] relative flex flex-col items-center justify-center p-4 sm:p-6 text-center rounded-xl border-4 border-amber-900/90 shadow-2xl bg-[#f4ebd0] text-[#2c1d11] overflow-hidden">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('assets/images/parchment_puzzle_card.png')",
                }}
              />

              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#78350f] mb-1">
                {currentChapterStory?.title} • Verse {currentPuzzleIndex + 1} of{' '}
                {chapterPuzzles.length}
              </div>

              <div className="text-xs sm:text-sm font-sans font-semibold text-[#451a03] mb-2 px-4">
                {currentPuzzle.prompt}
              </div>

              {currentPuzzle.synonymNuance && (
                <div className="text-[11px] font-sans font-bold uppercase text-amber-900 bg-amber-300/60 px-3 py-0.5 rounded-full mb-2 inline-flex items-center gap-1 shadow-sm">
                  <span>Nuance Focus:</span>
                  <span className="text-amber-950 font-extrabold">{currentPuzzle.synonymNuance}</span>
                </div>
              )}

              {/* Verse Sentence Fill-in */}
              <div className="text-base sm:text-xl md:text-2xl font-bold leading-relaxed max-w-2xl px-2">
                <span>{currentPuzzle.sentenceBefore} </span>

                {currentPuzzle.type === 'HOMOPHONE' ? (
                  <span className="inline-block px-3 py-1 mx-1.5 border-b-4 border-dashed border-[#b45309] bg-[#ebd8b7] text-[#78350f] rounded font-mono font-black animate-pulse">
                    [ ? ]
                  </span>
                ) : currentPuzzle.type === 'SYNONYM_MATRIX' ? (
                  <span className="inline-block px-3 py-1 mx-1.5 border-b-4 border-double border-[#7c2d12] bg-[#fef3c7] text-[#92400e] rounded font-serif font-black shadow-inner animate-pulse">
                    [ {currentPuzzle.synonymTargetWord || 'SYNONYM'} ]
                  </span>
                ) : (
                  <span className="inline-flex gap-1.5 mx-2 align-middle">
                    {currentPuzzle.correctAnswer.split('').map((char, cIdx) => {
                      const revealed = guessedLetters.includes(
                        char.toUpperCase(),
                      );
                      return (
                        <span
                          key={cIdx}
                          className={`w-7 h-9 sm:w-9 sm:h-11 flex items-center justify-center font-mono font-black text-lg sm:text-2xl border-2 rounded ${
                            revealed
                              ? 'bg-amber-900 text-amber-100 border-amber-950 shadow-md scale-105 transition-transform'
                              : 'bg-[#ebd8b7] text-transparent border-[#b45309] border-dashed'
                          }`}>
                          {revealed ? char : '_'}
                        </span>
                      );
                    })}
                  </span>
                )}

                <span> {currentPuzzle.sentenceAfter}</span>
              </div>

              {activeHint && (
                <div className="mt-2 text-xs sm:text-sm font-sans italic text-amber-900 bg-amber-200/80 px-3 py-1 rounded border border-amber-400">
                  {activeHint}
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="w-full shrink-0 flex flex-col items-center gap-2">
              {/* Feedback Banner with Full Multi-line Wrapping & Instant Lesson Expand Button */}
              {feedbackToast && (
                <div
                  key={feedbackToast.key}
                  onClick={() => {
                    if (feedbackToast.lessonData) {
                      setActiveLessonModal(feedbackToast.lessonData);
                      gameAudio.playConfirmSelect();
                    }
                  }}
                  className={`w-full max-w-2xl text-xs sm:text-sm font-sans px-3.5 py-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xl backdrop-blur-md transition-all ${
                    feedbackToast.lessonData
                      ? 'cursor-pointer hover:brightness-110'
                      : ''
                  } ${
                    feedbackToast.type === 'success'
                      ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/30'
                      : feedbackToast.type === 'error'
                        ? 'bg-rose-950/95 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/30'
                        : 'bg-amber-950/95 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/30'
                  }`}>
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {feedbackToast.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : feedbackToast.type === 'error' ? (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col min-w-0 text-left whitespace-normal break-words max-h-32 overflow-y-auto pr-1">
                      <span className="font-bold text-xs sm:text-sm leading-tight text-white mb-0.5">
                        {feedbackToast.headline}
                      </span>
                      <span className="text-[11px] sm:text-xs text-amber-100/90 leading-relaxed">
                        {feedbackToast.body}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {feedbackToast.lessonData && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (feedbackToast.lessonData) {
                            setActiveLessonModal(feedbackToast.lessonData);
                            gameAudio.playConfirmSelect();
                          }
                        }}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-md shadow flex items-center gap-1.5 transition-transform active:scale-95">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Full Lesson</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeedbackToast(null);
                      }}
                      className="p-1.5 text-amber-300 hover:text-white hover:bg-black/30 rounded text-xs transition-colors"
                      title="Dismiss">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Shuffled Choice Buttons for Homophones & Synonym Matrices */}
              {(currentPuzzle.type === 'HOMOPHONE' ||
                currentPuzzle.type === 'SYNONYM_MATRIX') &&
                shuffledOptions.length > 0 && (
                  <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {shuffledOptions.map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        className={`min-w-[110px] sm:min-w-[140px] min-h-[48px] px-4 py-2.5 active:scale-95 border-2 text-amber-100 font-bold text-base sm:text-lg rounded-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                          currentPuzzle.type === 'SYNONYM_MATRIX'
                            ? 'bg-[#3b2010] hover:bg-[#5a331a] border-amber-500/90 hover:border-yellow-300'
                            : 'bg-[#2d1b0f] hover:bg-[#4a2e19] border-amber-600/80 hover:border-amber-400'
                        }`}>
                        <span className="text-xs font-sans text-amber-400/80">
                          {i + 1}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}

              {/* QWERTY Keyboard for Letter Cipher */}
              {currentPuzzle.type === 'LETTER_CIPHER' && (
                <div className="w-full max-w-xl bg-[#1a110a]/90 p-2 sm:p-3 rounded-xl border-2 border-amber-800/80 shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 sm:gap-2">
                  {[
                    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
                  ].map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                      {row.map((letter) => {
                        const isGuessed = guessedLetters.includes(letter);
                        const isCorrect =
                          isGuessed &&
                          currentPuzzle.correctAnswer
                            .toUpperCase()
                            .includes(letter);

                        return (
                          <button
                            key={letter}
                            disabled={isGuessed}
                            onClick={() => {
                              gameAudio.playCrispClick();
                              handleLetterGuess(letter);
                            }}
                            className={`w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12 min-w-[26px] sm:min-w-[36px] font-mono font-bold text-xs sm:text-base rounded-md flex items-center justify-center transition-all select-none ${
                              isGuessed
                                ? isCorrect
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/70 shadow-inner opacity-65 cursor-not-allowed'
                                  : 'bg-rose-950/60 text-rose-400/50 border border-rose-900/60 line-through opacity-40 cursor-not-allowed'
                                : 'bg-gradient-to-b from-[#3e2717] via-[#2e1d11] to-[#1c1109] hover:from-[#52341f] hover:to-[#29180d] text-amber-100 border-t border-l border-amber-500/50 border-b-2 sm:border-b-[3px] border-r-2 border-amber-950 shadow-md shadow-black/60 active:translate-y-0.5 active:shadow-sm'
                            }`}>
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* LESSON & ETYMOLOGY MODAL */}
      {activeLessonModal && (
        <MenuOverlay tone="neutral" zIndex={85}>
          <div className="w-full max-w-lg bg-[#20150d] border-2 border-amber-600 rounded-xl p-5 sm:p-6 shadow-2xl text-amber-100 font-serif flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold text-amber-300">
                  Grammar Spool &amp; Etymology Lesson
                </h2>
              </div>
              <button
                onClick={() => setActiveLessonModal(null)}
                className="text-amber-400 hover:text-white font-sans text-sm">
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 text-xs sm:text-sm font-sans text-amber-100">
              <div className="bg-black/40 p-3 rounded-lg border border-amber-900/60">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Verse Challenge
                </div>
                <div className="italic text-amber-200">
                  "{activeLessonModal.puzzle.sentenceBefore}{' '}
                  <strong className="text-yellow-300 underline font-mono">
                    [{activeLessonModal.puzzle.correctAnswer}]
                  </strong>{' '}
                  {activeLessonModal.puzzle.sentenceAfter}"
                </div>
              </div>

              {activeLessonModal.puzzle.synonymNuance && (
                <div className="bg-amber-900/40 p-2.5 rounded-lg border border-amber-600/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-yellow-300 uppercase">
                    Nuance Dimension:
                  </span>
                  <span className="text-xs text-amber-200 font-semibold">
                    {activeLessonModal.puzzle.synonymNuance}
                  </span>
                </div>
              )}

              <div className="bg-amber-950/60 p-3 rounded-lg border border-amber-800/60">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Grammar Rule &amp; Distinction
                </div>
                <p className="leading-relaxed text-amber-100/90">
                  {activeLessonModal.puzzle.explanation}
                </p>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40">
                <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider mb-1">
                  Etymology &amp; Root Origin
                </div>
                <p className="leading-relaxed text-amber-200/90">
                  {activeLessonModal.puzzle.etymologyHint}
                </p>
              </div>

              {activeLessonModal.puzzle.wardenComment && (
                <div className="bg-black/30 p-2.5 rounded border border-amber-900/40 italic text-xs text-amber-300/80">
                  Tape Warden: "{activeLessonModal.puzzle.wardenComment}"
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveLessonModal(null)}
              autoFocus
              className="mt-4 w-full min-h-[44px] bg-amber-500 hover:bg-yellow-400 text-black font-bold text-base rounded-full shadow-md font-sans shrink-0">
              Return to Spool
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* QUESTION VAULT ARCHIVE COUNTER MODAL */}
      {isVaultArchiveOpen && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div className="w-full max-w-lg bg-[#20150d] border-2 border-amber-700 rounded-xl p-5 sm:p-6 shadow-2xl text-amber-100 font-serif flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg sm:text-xl font-bold text-amber-300">
                  Question Vault ({vaultStats.total} Total Puzzles)
                </h2>
              </div>
              <button
                onClick={() => setIsVaultArchiveOpen(false)}
                className="text-amber-400 hover:text-white font-sans text-sm">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-lg border border-amber-900/80 text-center font-sans text-xs mb-3">
              <div className="p-1">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">
                  Easy Tier
                </div>
                <div className="text-base font-black text-emerald-200">
                  {vaultStats.easyCount}
                </div>
              </div>
              <div className="p-1 border-x border-amber-900/60">
                <div className="text-[10px] text-amber-400 font-bold uppercase">
                  Medium (SAT)
                </div>
                <div className="text-base font-black text-amber-200">
                  {vaultStats.mediumCount}
                </div>
              </div>
              <div className="p-1">
                <div className="text-[10px] text-rose-400 font-bold uppercase">
                  Hard (GRE)
                </div>
                <div className="text-base font-black text-rose-200">
                  {vaultStats.hardCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-around bg-amber-950/60 p-2 rounded-lg border border-amber-800/60 font-sans text-xs text-amber-200 mb-3">
              <div>Homophones: <strong>{vaultStats.homophoneCount}</strong></div>
              <div>Ciphers: <strong>{vaultStats.cipherCount}</strong></div>
              <div>Synonym Matrices: <strong>{vaultStats.synonymCount}</strong></div>
            </div>

            <div className="text-xs font-sans font-bold uppercase text-amber-400/90 mb-1.5 flex items-center justify-between">
              <span>Chapter Breakdown (20 Spools)</span>
              <span>Total Puzzles</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[45vh] pr-1 font-sans text-xs">
              {CHAPTER_LORE_DATABASE.map((ch) => {
                const cStat = vaultStats.byChapter[ch.chapterIndex] || {
                  easy: 0,
                  medium: 0,
                  hard: 0,
                  total: 0,
                };
                return (
                  <div
                    key={ch.chapterIndex}
                    className="flex items-center justify-between bg-black/30 px-3 py-2 rounded border border-amber-900/40">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-amber-200 truncate">
                        Ch. {ch.chapterIndex}: {ch.tallTaleName}
                      </div>
                      <div className="text-[10px] text-amber-400/70">
                        Easy: {cStat.easy} • Med: {cStat.medium} • Hard: {cStat.hard}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-yellow-300 px-2 py-0.5 bg-amber-950/80 rounded border border-amber-700/50">
                      {cStat.total}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-amber-300/70 font-sans italic mt-3 text-center">
              Every chapter run draws and shuffles randomly from this 240+ linguistic repository.
            </p>

            <button
              onClick={() => setIsVaultArchiveOpen(false)}
              autoFocus
              className="mt-4 w-full min-h-[44px] bg-amber-600 hover:bg-amber-500 text-black font-bold text-base rounded-full shadow-md font-sans">
              Return to Deck
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* CHAPTER COMPLETE LORE MODAL WITH UNIQUE STORY ART */}
      {isChapterLoreOpen && (
        <MenuOverlay tone="victory" zIndex={60}>
          <div className="w-full max-w-lg bg-[#24170d] border-2 border-amber-600 rounded-xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center text-amber-100 font-serif">
            <Sparkles className="w-8 h-8 text-yellow-400 mb-1 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-0.5">
              Chapter {gameState.level - 1} Deciphered!
            </h2>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-sans mb-3">
              {CHAPTER_LORE_DATABASE[gameState.level - 2]?.tallTaleName}
            </div>

            {/* Unique Story Illustration for this exact Chapter */}
            <div className="w-full h-44 sm:h-52 rounded-lg overflow-hidden border-2 border-amber-700/80 mb-3 shadow-xl bg-black">
              {renderChapterStoryArtwork(
                gameState.level - 1,
                CHAPTER_LORE_DATABASE[gameState.level - 2]?.themeColor ||
                  '#d97706',
              )}
            </div>

            {/* Chapter Performance Breakdown */}
            <div className="w-full grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-lg border border-amber-900/80 text-xs font-sans mb-3">
              <div className="flex flex-col items-center">
                <span className="text-amber-400/80 uppercase tracking-wide text-[10px]">
                  Chapter Solve Time
                </span>
                <span className="font-bold text-amber-100 text-sm">
                  {lastChapterDuration.toFixed(1)}s
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-amber-400/80 uppercase tracking-wide text-[10px]">
                  Speed Bonus Earned
                </span>
                <span className="font-bold text-yellow-400 text-sm">
                  +{lastSpeedBonus} pts
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm italic text-amber-200 mb-5 px-2 leading-relaxed">
              "{CHAPTER_LORE_DATABASE[gameState.level - 2]?.loreVictory}"
            </p>

            <button
              onClick={() => {
                setIsChapterLoreOpen(false);
                gameAudio.playConfirmSelect();
              }}
              autoFocus
              className="w-full min-h-[48px] bg-amber-500 hover:bg-yellow-400 text-black font-bold text-base sm:text-lg rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 font-sans">
              <span>PROCEED TO CHAPTER {gameState.level}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* HIGH SCORES / RECORDS MODAL */}
      {isHighScoresOpen && (
        <MenuOverlay tone="neutral" zIndex={75}>
          <div className="w-full max-w-lg bg-[#20150d] border-2 border-amber-700 rounded-xl p-6 shadow-2xl text-amber-100 font-serif flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-amber-300">
                  Frontier Cipher Records (20 Chapters)
                </h2>
              </div>
              <button
                onClick={() => setIsHighScoresOpen(false)}
                className="text-amber-400 hover:text-white font-sans text-sm">
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[55vh] pr-1 font-sans text-xs">
              {highScores.length === 0 ? (
                <div className="text-center text-amber-400/60 py-6">
                  No records charted yet. Play a run to claim your glory!
                </div>
              ) : (
                highScores.map((rec, i) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-amber-900/60">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 font-bold text-yellow-400">
                        #{i + 1}
                      </span>
                      <div>
                        <div className="font-bold text-amber-100">
                          {rec.score} pts
                        </div>
                        <div className="text-[10px] text-amber-400/80">
                          {rec.difficulty} • Ch. {rec.chaptersCleared}/20 •{' '}
                          {rec.totalTimeSeconds}s • {rec.accuracyPercent}% Acc
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-500 font-mono">
                      {rec.date}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsHighScoresOpen(false)}
              autoFocus
              className="mt-5 w-full min-h-[44px] bg-amber-600 hover:bg-amber-500 text-black font-bold text-base rounded-full shadow-md font-sans">
              Close Records
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY MODAL */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div className="w-full max-w-lg bg-[#20150d] border-2 border-amber-700 rounded-xl p-6 shadow-2xl text-amber-100 font-serif flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-amber-300">
                  How to Play: Tape Cipher
                </h2>
              </div>
              <button
                onClick={() => setIsHowToPlayOpen(false)}
                className="text-amber-400 hover:text-white font-sans text-sm">
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-amber-200 leading-relaxed font-sans overflow-y-auto max-h-[60vh] pr-2">
              <div>
                <h3 className="font-bold text-amber-300 uppercase tracking-wider mb-1 font-serif">
                  20 Progressive Chapters &amp; 240+ Question Vault
                </h3>
                <p>
                  Decipher all 20 magnetic tape spools across American frontier
                  folklore (Pecos Bill, Paul Bunyan, Slue-Foot Sue, Iron Horse, Sourdough Geyser, Aurora Lasso) drawn from our
                  vault of {vaultStats.total} hand-crafted challenges.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 uppercase tracking-wider mb-1 font-serif">
                  New Puzzle Archetype: Synonym Matrix
                </h3>
                <p>
                  Match archaic, SAT, and GRE frontier synonyms with subtle nuance distinctions (e.g. <em>intrepid vs craven</em>, <em>tenacious vs pliable</em>, <em>bellicose vs docile</em>, <em>deleterious vs salutary</em>).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 uppercase tracking-wider mb-1 font-serif">
                  Difficulty Levels (Easy, SAT Prep, Hard GRE)
                </h3>
                <p>
                  • <strong>Easy (Greenhorn):</strong> Core homophone fundamentals &amp; basic ciphers. 7 fracture strikes allowed.
                  <br />
                  • <strong>Medium (Frontier Scout):</strong> SAT-prep diction &amp; synonym matrices. 6 fracture strikes allowed.
                  <br />
                  • <strong>Hard (Master Linguist):</strong> GRE-level dilemmas (apposite, venal, proscribe, flout, apothesis, inexorable) with strict 4 strikes &amp; 2.5x score bonus!
                </p>
              </div>

              <div>
                <h3 className="font-bold text-amber-300 uppercase tracking-wider mb-1 font-serif">
                  Audio Flux Etymology Power
                </h3>
                <p>
                  Spend 1 Flux (or hit Spacebar) to reveal an etymological clue
                  or unlock missing cipher glyphs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHowToPlayOpen(false)}
              autoFocus
              className="mt-6 w-full min-h-[48px] bg-amber-600 hover:bg-amber-500 text-black font-bold text-base rounded-full shadow-md font-sans">
              Got It, Return
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* PAUSE / IN-GAME MENU OVERLAY */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={80}>
          <div className="w-full max-w-sm bg-[#1e130a] border-2 border-amber-600 rounded-xl p-6 shadow-2xl flex flex-col items-center gap-3 text-amber-100 font-serif">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-2">
              Tape Deck Menu
            </h2>

            <button
              onClick={() => setIsGameMenuOpen(false)}
              autoFocus
              className="w-full min-h-[48px] bg-amber-500 hover:bg-yellow-400 text-black font-bold text-base rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-sans">
              <Play className="w-5 h-5" />
              <span>Resume Tape</span>
            </button>

            <button
              onClick={restartCurrentChapter}
              className="w-full min-h-[48px] bg-amber-900/80 hover:bg-amber-800 border border-amber-600 text-amber-200 font-bold text-base rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-sans">
              <RotateCcw className="w-4 h-4" />
              <span>Rewind Current Spool</span>
            </button>

            <button
              onClick={() => setIsVaultArchiveOpen(true)}
              className="w-full min-h-[44px] bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-2">
              <Database className="w-4 h-4 text-yellow-400" />
              <span>Question Vault ({vaultStats.total} Puzzles)</span>
            </button>

            <div className="w-full grid grid-cols-2 gap-2 my-1">
              <button
                onClick={handleToggleSfx}
                className="min-h-[48px] bg-black/40 hover:bg-black/60 border border-amber-700/60 rounded-lg text-xs font-bold font-sans text-amber-200 flex items-center justify-center gap-1.5">
                {isSfxMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>SFX: {isSfxMuted ? 'Off' : 'On'}</span>
              </button>

              <button
                onClick={handleToggleMusic}
                className="min-h-[48px] bg-black/40 hover:bg-black/60 border border-amber-700/60 rounded-lg text-xs font-bold font-sans text-amber-200 flex items-center justify-center gap-1.5">
                <Music
                  className={`w-4 h-4 ${
                    isMusicMuted ? 'text-red-400' : 'text-emerald-400'
                  }`}
                />
                <span>Music: {isMusicMuted ? 'Off' : 'On'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsHighScoresOpen(true)}
              className="w-full min-h-[44px] bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-yellow-300 text-sm font-sans font-semibold rounded-lg flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>View High Score Records</span>
            </button>

            <button
              onClick={() => {
                setIsGameMenuOpen(false);
                setGameState((prev) => ({...prev, status: 'START'}));
              }}
              className="w-full min-h-[48px] bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-sm font-sans font-semibold rounded-lg flex items-center justify-center gap-2 mt-1">
              <span>Quit to Main Menu</span>
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* START MENU OVERLAY WITH DIFFICULTY SELECTION & QUESTION VAULT BADGE */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-lg bg-[#24170d] border-4 border-amber-700 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center text-amber-100 font-serif relative overflow-hidden">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/80 overflow-hidden bg-black shadow-2xl mb-2">
              {assets['narrator_tape_warden'] ? (
                <img
                  src="assets/images/narrator_tape_warden.png"
                  alt="Tape Warden"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold">
                  TW
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-wider mb-0.5 drop-shadow-md">
              TAPE CIPHER
            </h1>
            <div className="text-xs font-sans uppercase tracking-widest text-amber-400 mb-2">
              20 Frontier Chapters • Grammatical Decryption &amp; Synonym Matrix
            </div>

            {/* Question Vault Counter Badge */}
            <button
              onClick={() => setIsVaultArchiveOpen(true)}
              className="mb-3 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 hover:bg-amber-900 text-amber-300 font-sans text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95">
              <Database className="w-3.5 h-3.5 text-yellow-400" />
              <span>Question Vault:</span>
              <strong className="text-yellow-300">{vaultStats.total} Hand-Crafted Puzzles</strong>
              <span className="text-[10px] text-amber-400/80 underline ml-1">View Stats</span>
            </button>

            {/* DIFFICULTY SELECTOR */}
            <div className="w-full mb-4 bg-black/40 p-3 rounded-xl border border-amber-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans mb-2 flex items-center justify-between">
                <span>Select Difficulty Level</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  {selectedDifficulty === 'EASY'
                    ? `${vaultStats.easyCount} Easy Puzzles`
                    : selectedDifficulty === 'MEDIUM'
                      ? `${vaultStats.mediumCount} SAT Puzzles`
                      : `${vaultStats.hardCount} GRE Master Puzzles`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      gameAudio.playCrispClick();
                    }}
                    className={`py-2 px-1 rounded-lg font-sans font-bold text-xs sm:text-sm border transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-amber-500 text-black border-yellow-300 shadow-md scale-105'
                        : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-700/60'
                    }`}>
                    {diff === 'EASY'
                      ? 'EASY (1x)'
                      : diff === 'MEDIUM'
                        ? 'MED (1.5x)'
                        : 'HARD (2.5x)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-amber-300/80 font-sans mt-2 italic px-1 leading-snug">
                {difficultyConfig.description}
              </p>
            </div>

            <button
              ref={startButtonRef}
              onClick={initGame}
              autoFocus
              data-testid="start-button"
              className="w-full min-h-[52px] bg-amber-500 hover:bg-yellow-400 text-black font-extrabold text-xl rounded-full shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-2 font-sans">
              <Play className="w-6 h-6 fill-current" />
              <span>PLAY ALL 20 CHAPTERS</span>
            </button>

            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 text-xs font-sans">
              <button
                onClick={() => setIsVaultArchiveOpen(true)}
                className="text-amber-300 hover:underline flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Vault ({vaultStats.total})</span>
              </button>
              <span className="text-amber-700">•</span>
              <button
                onClick={() => setIsHighScoresOpen(true)}
                className="text-yellow-400 hover:underline flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>High Scores</span>
              </button>
              <span className="text-amber-700">•</span>
              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="text-amber-400 hover:underline flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Rules &amp; Lore</span>
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title="RIBBON FRACTURED"
          description={`The magnetic spool desynchronized under tension on Chapter ${gameState.level} of 20. Final Score: ${gameState.score}`}
          actionLabel="REWIND & RETRY"
          onAction={initGame}
          icon={<RotateCw size={24} />}
          tone="danger"
        />
      )}

      {/* VICTORY OVERLAY */}
      {gameState.status === 'VICTORY' && (
        <Overlay
          title="SUPREME CIPHER ARCHITECT!"
          description={`All 20 magnetic folklore spools successfully deciphered and immortalized in the Grand Vault! Final Frontier Score: ${gameState.score}`}
          actionLabel="PLAY AGAIN"
          onAction={initGame}
          icon={<RotateCw size={24} />}
          tone="victory"
        />
      )}
    </div>
  );
}
