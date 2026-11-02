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
          bodyHtml: await renderBody(body),
        };
      }),
  );
}

export const getFeaturedProjects = async () => (await getProjects()).filter((project) => project.featured);

/** Only testimonials with permission exist past this point. */
export async function getTestimonials() {
  const all = await reader.collections.testimonials.all();
  return all
    .filter(({ entry }) => entry.permissionToPublish)
    .map(({ slug, entry }) => {
      const { company, nameApproved, ...rest } = entry;
      if (entry.format.discriminant === 'video' && !entry.format.value.transcript.trim()) {
        problem(`testimonial ${slug}: video needs a transcript`);
      }
      return { ...rest, slug, company: nameApproved && company ? company : null };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export const getFeaturedTestimonials = async () => (await getTestimonials()).filter((item) => item.featured);

export async function getProjectTestimonials(projectSlug: string) {
  return (await getTestimonials()).filter((item) => item.project === projectSlug);
}
