import type { ImageMetadata } from 'astro';
import Markdoc from '@markdoc/markdoc';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

/**
 * The only route from Keystatic content to pages. The rules that must never be
 * left to a template live here: demos carry no results, unapproved names never
 * leave this file, and unpublished testimonials are absent from the build.
 */
const reader = createReader(process.cwd(), keystaticConfig);

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp,avif,svg}');

const isDev = import.meta.env.DEV;

function problem(message: string) {
  // Unfinished content warns while editing but stops a production build.
  if (isDev) console.warn(`[content] ${message}`);
  else throw new Error(`[content] ${message}`);
}

export type ResolvedImage = { src: ImageMetadata; alt: string };

export async function resolveImage(
  field: { image: string | null; alt: string } | null | undefined,
  where: string,
): Promise<ResolvedImage | null> {
  if (!field?.image) return null;
  const load = images[field.image];
  if (!load) {
    problem(`${where}: image not found at ${field.image}`);
    return null;
  }
  if (!field.alt.trim()) problem(`${where}: image has no alt text`);
  return { src: (await load()).default, alt: field.alt };
}

/** Text still holding a [BRACKETED] value from the spec. */
export const hasPlaceholder = (value: string | null | undefined) => /\[[^\]]+\]/.test(value ?? '');

/** A video can play only once it has a real ID. */
export const videoReady = (video: { youtubeId: string }) => Boolean(video.youtubeId) && !hasPlaceholder(video.youtubeId);

export const getSettings = async () => (await reader.singletons.settings.readOrThrow());
export const getHome = async () => (await reader.singletons.home.readOrThrow());
export const getMedSpaPage = async () => (await reader.singletons.medSpaPage.readOrThrow());

export async function getSkills() {
  const all = await reader.collections.skills.all();
  return all
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getToolsStrip() {
  return (await getSkills()).filter((skill) => skill.showInToolsStrip);
}

async function renderBody(body: () => Promise<{ node: Parameters<typeof Markdoc.transform>[0] }>) {
  const { node } = await body();
  const html = Markdoc.renderers.html(Markdoc.transform(node));
  return html.replace(/<[^>]+>/g, '').trim() ? html : '';
}

export async function getProjects() {
  const [all, skills] = await Promise.all([reader.collections.projects.all(), getSkills()]);
  const nameBySlug = new Map(skills.map((skill) => [skill.slug, skill.name]));

  return Promise.all(
    all
      .map(({ slug, entry }) => ({ slug, entry }))
      .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0))
      .map(async ({ slug, entry }) => {
        const { clientName, nameApproved, results, resultsNote, designedTo, body, ...rest } = entry;
        const isDemo = entry.type === 'demo';

        if (entry.summary.length > 155) problem(`${slug}: summary is over 155 characters`);
        if (isDemo && results.length > 0) problem(`${slug}: demo projects cannot have results`);

        return {
          ...rest,
          slug,
          isDemo,
          typeLabel: isDemo ? 'Demo build' : 'Client project',
          // Only ever the approved name; the raw field does not leave this function.
          clientName: nameApproved && clientName ? clientName : null,
          results: isDemo ? [] : results,
          resultsNote: isDemo ? '' : resultsNote,
          designedTo: isDemo ? designedTo : '',
          toolNames: entry.tools.flatMap((tool) => {
            const name = tool ? nameBySlug.get(tool) : undefined;
            return name ? [name] : [];
          }),
          cover: await resolveImage(entry.coverImage, `${slug} cover`),
          gallery: (
            await Promise.all(
              entry.gallery.map(async (item, i) => {
                const resolved = await resolveImage(item, `${slug} gallery ${i + 1}`);
                return resolved ? { ...resolved, caption: item.caption } : null;
              }),
            )
          ).filter((item) => item !== null),
          demoVideo: entry.demoVideo.discriminant ? entry.demoVideo.value : null,
          cardTitle: entry.cardTitle || entry.title,
          // Screenshot for the home panel; the cover stands in until one exists.
          panelImage:
            (await resolveImage(entry.panelImage, `${slug} panel image`)) ??
            (await resolveImage(entry.coverImage, `${slug} cover`)),
          // A page with unwritten basics is built only in development.
          hasPage: isDev || ![entry.title, entry.summary, entry.problem].some(hasPlaceholder),
          bodyHtml: await renderBody(body),
        };
      }),
  );
}

export const getFeaturedProjects = async () => (await getProjects()).filter((project) => project.featured);

/**
 * Only testimonials with permission exist past this point. In production, anything still
 * holding a [PLACEHOLDER] (the dev seed reviews) is dropped too. A name leaves this file
 * only when the review is not anonymous and the name is approved; anonymous reviews lose
 * their photo as well.
 */
export async function getTestimonials() {
  const all = await reader.collections.testimonials.all();
  const items = await Promise.all(
    all
      .filter(({ entry }) => entry.permissionToPublish)
      .filter(({ entry }) => {
        if (isDev) return true;
        const v = entry.type.value;
        const texts = [entry.role, entry.practiceType, 'quote' in v ? v.quote : v.videoId];
        return !texts.some(hasPlaceholder);
      })
      .map(async ({ slug, entry }) => {
        const { personName, nameApproved, anonymous, photo, ...rest } = entry;
        const v = entry.type.value;
        if (entry.type.discriminant === 'video' && 'videoId' in v && !v.videoId.trim()) problem(`testimonial ${slug}: video has no YouTube ID`);
        return {
          ...rest,
          slug,
          name: !anonymous && nameApproved && personName ? personName : null,
          photo: anonymous ? null : await resolveImage(photo, `testimonial ${slug} photo`),
          poster: 'poster' in v ? await resolveImage(v.poster, `testimonial ${slug} poster`) : null,
        };
      }),
  );
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export const getFeaturedTestimonials = async () => (await getTestimonials()).filter((item) => item.featured);

export async function getProjectTestimonials(projectSlug: string) {
  return (await getTestimonials()).filter((item) => item.project === projectSlug);
}

/** The intro video plays only once it has a real YouTube ID. */
export const introVideoReady = (id: string | null | undefined) => Boolean(id?.trim()) && !hasPlaceholder(id);

/** "1:30" → "1 minute 30 seconds", for labels read aloud. */
export function spokenDuration(value: string) {
  const secondsOnly = value.trim().match(/^(\d+)\s*s$/i);
  if (secondsOnly) return `${Number(secondsOnly[1])} seconds`;
  const match = value.trim().match(/^(\d+):(\d{1,2})$/);
  if (!match) return value;
  const [m, s] = [Number(match[1]), Number(match[2])];
  const part = (n: number, unit: string) => (n ? `${n} ${unit}${n === 1 ? '' : 's'}` : '');
  return [part(m, 'minute'), part(s, 'second')].filter(Boolean).join(' ') || value;
}

export const youtubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&cc_load_policy=1&rel=0&playsinline=1`;
