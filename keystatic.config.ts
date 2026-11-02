import { collection, config, fields, singleton } from '@keystatic/core';

const text = (label: string, description?: string) => fields.text({ label, description });
const longText = (label: string, description?: string) => fields.text({ label, description, multiline: true });

const imagesDir = 'src/assets/content';

/** Image and alt text. Alt is enforced at build time, so empty placeholders can still be saved. */
const image = (label: string, dir = imagesDir) =>
  fields.object(
    {
      image: fields.image({ label, directory: dir, publicPath: `/${dir}/` }),
      alt: text('Alt text', 'Required whenever an image is set.'),
    },
    { label },
  );

const video = (label: string) =>
  fields.object(
    {
      youtubeId: fields.text({ label: 'YouTube ID', validation: { isRequired: true } }),
      title: text('Title'),
      poster: image('Poster', 'src/assets/photos'),
      transcript: longText('Transcript'),
      durationLabel: text('Duration label', 'For example "60s".'),
    },
    { label },
  );

const titled = (label: string, itemLabel = 'Title') =>
  fields.array(
    fields.object({ title: text(itemLabel), text: longText('Text') }),
    { label, itemLabel: (p) => p.fields.title.value },
  );

const strings = (label: string) => fields.array(text('Text'), { label, itemLabel: (p) => p.value });

const seo = fields.object({ title: text('Page title'), description: longText('Meta description') }, { label: 'SEO' });

export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: 'BennyGitau/portfolio' }
    : { kind: 'local' },
  ui: { brand: { name: 'Benson Gitau' } },
  collections: {
    projects: collection({
      label: 'Projects',
      path: 'src/content/projects/*/',
      slugField: 'title',
      format: { contentField: 'body' },
      columns: ['type', 'industry', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title', description: 'Outcome headline.' } }),
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Demo', value: 'demo' }, { label: 'Client', value: 'client' }],
          defaultValue: 'demo',
        }),
        lane: fields.select({
          label: 'Lane',
          options: [{ label: 'Health & wellness', value: 'wellness' }, { label: 'E-commerce & operations', value: 'ecommerce-ops' }],
          defaultValue: 'wellness',
        }),
        industry: fields.select({
          label: 'Industry',
          options: ['Med spa', 'Clinic', 'Gym/Studio', 'Coach', 'E-commerce', 'Operations'].map((v) => ({ label: v, value: v })),
          defaultValue: 'Med spa',
        }),
        clientDescriptor: text('Client descriptor', 'Anonymous description, for example "multi-store e-commerce group".'),
        clientName: text('Client name', 'Rendered only when "Name approved" is ticked.'),
        nameApproved: fields.checkbox({ label: 'Name approved', defaultValue: false }),
        summary: fields.text({ label: 'Summary', multiline: true, validation: { length: { max: 155 } } }),
        cardResult: text('Card result'),
        problem: longText('Problem'),
        steps: fields.array(
          fields.object({ title: text('Title'), description: longText('Description') }),
          { label: 'Steps', itemLabel: (p) => p.fields.title.value },
        ),
        results: fields.array(
          fields.object({ value: text('Value'), label: text('Label') }),
          { label: 'Results', description: 'Client projects only. Never shown for demos.', itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}` },
        ),
        resultsNote: text('Results note', 'Client projects only. A result with no number.'),
        designedTo: longText('Designed to', 'Demo projects only.'),
        tools: fields.array(fields.relationship({ label: 'Tool', collection: 'skills' }), { label: 'Tools', itemLabel: (p) => p.value ?? 'Tool' }),
        coverImage: image('Cover image'),
        gallery: fields.array(
          fields.object({
            image: fields.image({ label: 'Image', directory: imagesDir, publicPath: `/${imagesDir}/` }),
            alt: text('Alt text'),
            caption: text('Caption'),
          }),
          { label: 'Gallery', itemLabel: (p) => p.fields.caption.value || 'Image' },
        ),
        demoVideo: fields.conditional(fields.checkbox({ label: 'Has demo video', defaultValue: false }), {
          true: video('Demo video'),
          false: fields.empty(),
        }),
        body: fields.markdoc({ label: 'Extra narrative', description: 'Optional.' }),
        cta: text('Closing line'),
        featured: fields.checkbox({ label: 'Featured on home', defaultValue: false }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
    testimonials: collection({
      label: 'Testimonials',
      path: 'src/content/testimonials/*',
      slugField: 'personName',
      columns: ['source', 'permissionToPublish'],
      schema: {
        personName: fields.slug({ name: { label: 'Person name' } }),
        format: fields.conditional(
          fields.select({
            label: 'Format',
            options: [{ label: 'Text', value: 'text' }, { label: 'Video', value: 'video' }],
            defaultValue: 'text',
          }),
          { text: fields.object({ quote: longText('Quote') }), video: video('Video') },
        ),
        role: text('Role'),
        company: text('Company', 'Rendered only when "Name approved" is ticked.'),
        nameApproved: fields.checkbox({ label: 'Name approved', defaultValue: false }),
        photo: image('Photo'),
        project: fields.relationship({ label: 'Project', collection: 'projects' }),
        source: fields.select({
          label: 'Source',
          options: ['Direct', 'Upwork', 'Fiverr', 'LinkedIn'].map((v) => ({ label: v, value: v })),
          defaultValue: 'Direct',
        }),
        permissionToPublish: fields.checkbox({
          label: 'Permission to publish',
          description: 'Left out of the build completely when unticked.',
          defaultValue: false,
        }),
        featured: fields.checkbox({ label: 'Featured on home', defaultValue: false }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
    skills: collection({
      label: 'Skills',
      path: 'src/content/skills/*',
      slugField: 'name',
      columns: ['category', 'order'],
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        category: fields.select({
          label: 'Category',
          options: ['CRM', 'Automation', 'AI voice', 'Booking platforms', 'E-commerce', 'Payments', 'Data'].map((v) => ({ label: v, value: v })),
          defaultValue: 'Automation',
        }),
        icon: fields.image({ label: 'Icon (monochrome SVG)', directory: 'src/assets/skills', publicPath: '/src/assets/skills/' }),
        showInToolsStrip: fields.checkbox({ label: 'Show in tools strip', defaultValue: true }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Home',
      path: 'src/content/home',
      schema: {
        seo,
        hero: fields.object(
          {
            eyebrow: text('Eyebrow'),
            headlineBefore: longText('Headline before accent word'),
            accentWord: text('Accent word'),
            headlineAfter: text('Headline after accent word'),
            subline: longText('Subline'),
            primaryCta: text('Primary button'),
            secondaryCta: text('Secondary button'),
            trustLine: text('Trust line'),
            introVideo: video('Intro video'),
          },
          { label: 'Hero' },
        ),
        heroCards: fields.array(fields.object({ text: text('Text') }), { label: 'Hero cards', itemLabel: (p) => p.fields.text.value }),
        problem: fields.object({ heading: text('Heading'), cards: titled('Cards'), closingLine: text('Closing line') }, { label: 'Problem' }),
        outcomes: fields.object({ heading: text('Heading'), items: titled('Items') }, { label: 'Outcomes' }),
        work: fields.object({ heading: text('Heading'), intro: longText('Intro'), filters: fields.object({ all: text('All'), wellness: text('Health & wellness'), ecommerceOps: text('E-commerce & operations') }, { label: 'Filter labels' }), otherWork: longText('Other work line') }, { label: 'Work' }),
        services: fields.object(
          {
            heading: text('Heading'),
            items: fields.array(
              fields.object({ title: text('Title'), text: longText('Text'), priceFrom: text('Price from', 'Leave empty unless a price is confirmed.') }),
              { label: 'Items', itemLabel: (p) => p.fields.title.value },
            ),
          },
          { label: 'Services' },
        ),
        process: fields.object({ heading: text('Heading'), steps: titled('Steps') }, { label: 'Process' }),
        about: fields.object(
          { heading: text('Heading'), text: longText('Text'), photo: image('Photo', 'src/assets/photos'), agencyLine: text('Agency line') },
          { label: 'About' },
        ),
        proof: fields.object({ heading: text('Heading') }, { label: 'Proof' }),
        finalCta: fields.object({ heading: text('Heading'), text: longText('Text'), buttonLabel: text('Button label') }, { label: 'Final call to action' }),
      },
    }),
    medSpaPage: singleton({
      label: 'Med spa page',
      path: 'src/content/med-spa-page',
      schema: {
        seo,
        hero: fields.object(
          {
            eyebrow: text('Default eyebrow'),
            personalisedEyebrow: text('Personalised eyebrow', 'Use {spa} where the spa name goes.'),
            headline: text('Headline'),
            subline: longText('Subline'),
            primaryCta: text('Primary button'),
            secondaryCta: text('Secondary button'),
          },
          { label: 'Hero' },
        ),
        demoVideo: video('Demo video'),
        leaks: fields.object({ heading: text('Heading'), items: strings('Items') }, { label: 'Where bookings leak' }),
        system: fields.object(
          {
            heading: text('Heading'),
            steps: fields.array(
              fields.object({ title: text('Title'), description: longText('Description') }),
              { label: 'Steps', itemLabel: (p) => p.fields.title.value },
            ),
          },
          { label: 'The system' },
        ),
        offers: fields.object({ heading: text('Heading'), items: titled('Items'), alsoLine: text('Also available line') }, { label: 'Where to start' }),
        platforms: fields.object({ heading: text('Heading'), chips: strings('Platforms'), text: longText('Text') }, { label: 'Works with what you use' }),
        safeguards: fields.object({ heading: text('Heading'), items: strings('Items') }, { label: 'Handled carefully' }),
        proof: fields.object(
          {
            heading: text('Heading'),
            project: fields.relationship({ label: 'Linked project', collection: 'projects' }),
            line: longText('Line'),
          },
          { label: 'Proof' },
        ),
        faq: fields.object(
          {
            heading: text('Heading'),
            items: fields.array(fields.object({ q: text('Question'), a: longText('Answer') }), { label: 'Questions', itemLabel: (p) => p.fields.q.value }),
          },
          { label: 'FAQ' },
        ),
        finalCta: fields.object({ heading: text('Heading'), text: longText('Text'), emailLine: text('Email line') }, { label: 'Final call to action' }),
      },
    }),
    settings: singleton({
      label: 'Settings',
      path: 'src/content/settings',
      schema: {
        ghlCalendarEmbedUrl: text('GoHighLevel calendar embed URL'),
        email: text('Email'),
        linkedinUrl: text('LinkedIn URL'),
        githubUrl: text('GitHub URL'),
        xUrl: text('X URL'),
        agencyName: text('Agency name'),
        agencyUrl: text('Agency URL'),
        siteUrl: text('Site URL'),
        defaultShareImage: image('Default share image'),
        analyticsSnippet: longText('Analytics snippet', 'Optional.'),
        footerRole: text('Footer role'),
        footerLocation: text('Footer location'),
      },
    }),
  },
});
