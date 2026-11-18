/**
 * The clinic's gancho guides as the site's /recursos (deusrex#2352), as the
 * publish build writes them into site-data.json (`resources`). Typed content
 * only: every field is rendered as text, never as markup.
 */
import siteDataModule from '../data/site-data.json';

export type GuideStepIcon =
  | 'chat'
  | 'clock'
  | 'book'
  | 'home'
  | 'heart'
  | 'play'
  | 'check'
  | 'calendar';

export type GuideBlock =
  | { type: 'text'; kicker: string; heading: string; body: string }
  | { type: 'stat'; kicker: string; heading: string; value: string; unit: string; body: string }
  | {
      type: 'checklist';
      kicker: string;
      heading: string;
      items: { text: string; note: string }[];
      threshold: number;
      adviceFew: string;
      adviceMany: string;
    }
  | {
      type: 'steps';
      kicker: string;
      heading: string;
      items: { title: string; body: string; icon: GuideStepIcon }[];
    }
  | { type: 'myth_fact'; kicker: string; myth: string; fact: string }
  | { type: 'consult'; kicker: string; heading: string; body: string };

export interface SiteResource {
  slug: string;
  content: {
    title: string;
    highlight: string;
    intro: string;
    blocks: GuideBlock[];
    ctaLabel: string;
  };
  readingMinutes: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface SiteResources {
  items: SiteResource[];
  author: { name: string; specialty: string | null } | null;
  guideApiBase: string | null;
}

/** The build's resources, or null on a site that carries none. */
export function siteResources(): SiteResources | null {
  const data = (siteDataModule as { default?: unknown }).default ?? siteDataModule;
  const resources = (data as { resources?: SiteResources | null }).resources;
  return resources && resources.items.length > 0 ? resources : null;
}

/** A guide's description: its intro, cut where a search snippet ends. */
export function descriptionOf(resource: SiteResource): string {
  const intro = resource.content.intro.replace(/\s+/g, ' ').trim();
  return intro.length > 155 ? `${intro.slice(0, 154)}…` : intro;
}
