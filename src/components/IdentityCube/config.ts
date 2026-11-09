/**
 * Identity Cube — content & behaviour config.
 * Everything a visitor sees on the cube lives here, so copy, links,
 * colours and timing can change without touching the 3D code.
 */

export type FaceKind = 'person' | 'build' | 'expertise' | 'impact';

export interface CubeFace {
  kind: FaceKind;
  /** Short label for the face switcher buttons + screen readers */
  label: string;
  /** Small mono eyebrow printed on the face */
  eyebrow: string;
  /** Serif headline printed on the face (not used on the portrait face) */
  headline?: string;
  items: string[];
  /** Section the face links to when it is clicked while already in front */
  href?: string;
}

export interface CubePalette {
  ink: string;      // matte cube body
  accent: string;   // lime
  paper: string;    // white details
  grey: string;     // secondary text on faces
}

export interface CubeFonts {
  sans: string;
  serif: string;
  mono: string;
}

export interface CubeConfig {
  name: string;
  role: string;
  /** Transparent-background cut-out portrait. Use ≥1200px for crisp results. */
  portraitSrc: string;
  /** Marks the portrait as a stand-in so it is labelled on the face */
  portraitIsStandIn?: boolean;
  faces: [CubeFace, CubeFace, CubeFace, CubeFace];
  palette: CubePalette;
  /** Leave empty to read the site's --font-geist / --font-instrument / --font-geist-mono */
  fonts?: Partial<CubeFonts>;
  timing: {
    /** Average seconds per quarter-turn while auto-rotating (continuous, never stops) */
    perFace: number;
    /**
     * 0..1 — how much auto-rotation slows as each face comes to the front.
     * 0 = constant speed; 0.85 = speed at a face is 15% of the average.
     * Capped at 0.95 so the cube never fully stops.
     */
    linger: number;
    /** Seconds for a turn the visitor asked for (click, face button, arrow key) */
    turn: number;
    /** Seconds auto-rotate waits after the visitor touches/drags the cube */
    resumeAfterInteraction: number;
  };
  /** Entrance: the cube drops in and tumbles like a rolled die, then settles on the portrait */
  intro: {
    enabled: boolean;
    /** Where it is thrown from */
    from: 'top-right' | 'top-left' | 'top' | 'side';
    /** Seconds from throw to settled */
    duration: number;
    /** Seconds it rests on the portrait before auto-rotation begins */
    restBeforeRotate: number;
  };
  /**
   * Extra transparent space above the cube, as a fraction of its width.
   * Lets the stage reach up behind the headline (centred hero) so the
   * entrance drop isn't clipped. 0 = square stage.
   */
  headroom: number;
  /** Three-quarter resting angle, in degrees */
  angle: { yaw: number; pitch: number };
  /** Max drag tilt up/down, degrees */
  pitchLimit: number;
}

export const defaultCubeConfig: CubeConfig = {
  name: 'BENSON GITAU',
  role: 'AI & AUTOMATION SPECIALIST',
  portraitSrc: '',
  faces: [
    {
      kind: 'person',
      label: 'Person',
      eyebrow: 'PERSON',
      items: [],
      href: '#about',
    },
    {
      kind: 'build',
      label: 'What I build',
      eyebrow: 'WHAT I BUILD',
      headline: 'Intelligent business systems',
      items: ['AI Agents', 'Business Automation', 'Workflow Engineering', 'System Integration'],
      href: '#services',
    },
    {
      kind: 'expertise',
      label: 'Expertise',
      eyebrow: 'TECHNICAL EXPERTISE',
      headline: 'The stack behind the systems',
      items: [
        'n8n',
        'GoHighLevel',
        'Python',
        'JavaScript',
        'APIs & Webhooks',
        'Shopify & Square',
        'LangGraph',
        'AI Systems',
      ],
      href: '#process',
    },
    {
      kind: 'impact',
      label: 'Impact',
      eyebrow: 'BUSINESS IMPACT',
      headline: 'What changes for the business',
      items: [
        'Operational Efficiency',
        'Reduced Manual Work',
        'Connected Business Systems',
        'Intelligent Workflows',
      ],
      href: '#work',
    },
  ],
  // Fallbacks only. At runtime mount.ts reads the active palette's
  // --ink, --panel, --page and --faded tokens and uses those instead,
  // so the cube follows data-palette. These match [data-palette="lime"].
  palette: {
    ink: '#111311',
    accent: '#c6f432',
    paper: '#f7f7f2',
    grey: '#868b85',
  },
  timing: { perFace: 6, linger: 0.85, turn: 1.6, resumeAfterInteraction: 6 },
  intro: { enabled: true, from: 'top-right', duration: 2.2, restBeforeRotate: 2.4 },
  headroom: 0,
  angle: { yaw: -24, pitch: 10 },
  pitchLimit: 22,
};

/** What callers pass: any field, and any part of the nested groups. */
export type CubeConfigInput = Partial<Omit<CubeConfig, 'palette' | 'timing' | 'intro' | 'angle'>> & {
  palette?: Partial<CubeConfig['palette']>;
  timing?: Partial<CubeConfig['timing']>;
  intro?: Partial<CubeConfig['intro']>;
  angle?: Partial<CubeConfig['angle']>;
};

export function mergeConfig(partial: CubeConfigInput = {}): CubeConfig {
  const d = defaultCubeConfig;
  return {
    ...d,
    ...partial,
    palette: { ...d.palette, ...(partial.palette ?? {}) },
    timing: { ...d.timing, ...(partial.timing ?? {}) },
    intro: { ...d.intro, ...(partial.intro ?? {}) },
    angle: { ...d.angle, ...(partial.angle ?? {}) },
    fonts: { ...(partial.fonts ?? {}) },
    faces: (partial.faces ?? d.faces) as CubeConfig['faces'],
  };
}
