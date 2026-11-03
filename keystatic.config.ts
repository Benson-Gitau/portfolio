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

// Production edits go through Keystatic Cloud, which commits to the GitHub repo connected to the
// Cloud project. Development edits the files on disk. `npm run dev:cloud` sets
// PUBLIC_KEYSTATIC_STORAGE=cloud to try Cloud mode locally.
const useCloud = import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'cloud';

export default config({
  storage: useCloud ? { kind: 'cloud' } : { kind: 'local' },
  cloud: { project: 'benson-portfolio/portfolio' },
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
        cardTitle: text('Card title', 'Short name on the home work grid, for example "Med Spa Speed-to-Lead".'),
        accentWord: text('Accent word', 'One word from the title, set in the accent style on the project page.'),
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
        panelImage: image('Panel image'),
        panelLabel: text('Panel placeholder label', 'Shown in development while there is no panel image or cover, for example "Screenshot · AI receptionist call log".'),
        panelOrder: fields.integer({ label: 'Panel position', description: '1–4 places it in the home image panel; 0 leaves it out.', defaultValue: 0 }),
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
      columns: ['source', 'permissionToPublish', 'order'],
      schema: {
        personName: fields.slug({ name: { label: 'Person name', description: 'Shown only when not anonymous and "Name approved" is ticked.' } }),
        type: fields.conditional(
          fields.select({
            label: 'Type',
            options: [{ label: 'Text', value: 'text' }, { label: 'Video', value: 'video' }],
            defaultValue: 'text',
          }),
          {
            text: fields.object({
              quote: longText('Quote'),
              pullQuote: fields.checkbox({ label: 'Pull quote', description: 'Renders a short quote as a coloured card.', defaultValue: false }),
            }),
            video: fields.object({
              videoId: text('YouTube ID'),
              poster: image('Poster'),
              duration: text('Duration', 'For example "0:45".'),
              orientation: fields.select({
                label: 'Orientation',
                options: [{ label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' }],
                defaultValue: 'portrait',
              }),
            }),
          },
        ),
        role: text('Role', 'For example "Owner".'),
        practiceType: text('Practice type', 'For example "Med spa, Austin".'),
        source: fields.select({
          label: 'Source',
          options: [{ label: 'Direct', value: 'direct' }, { label: 'Upwork', value: 'upwork' }, { label: 'Fiverr', value: 'fiverr' }],
          defaultValue: 'direct',
        }),
        anonymous: fields.checkbox({ label: 'Anonymous', description: 'Never shows a name or photo.', defaultValue: true }),
        nameApproved: fields.checkbox({ label: 'Name approved', defaultValue: false }),
        photo: image('Photo'),
        project: fields.relationship({ label: 'Project', collection: 'projects' }),
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
            greeting: text('Title line 1', 'Geist, for example "Hi, I’m Benson".'),
            title: text('Title line 2', 'Serif italic, for example "Automation Consultant".'),
            heroPortrait: image('Cut-out portrait', 'src/assets/photos'),
            available: text('Available pill'),
            audience: text('Audience line'),
            statement: longText('Statement'),
            primaryCta: text('Primary button'),
            introCta: text('Intro button', 'Hidden while the intro video ID is empty.'),
          },
          { label: 'Hero' },
        ),
        panel: fields.object(
          { label: text('Screen reader label', 'Names the image panel for assistive tech.') },
          { label: 'Project panel' },
        ),
        jambo: fields.object(
          {
            greeting: text('Greeting'),
            statement: longText('Statement'),
            statementFaded: longText('Statement, faded part'),
            chips: strings('Chips'),
          },
          { label: 'Jambo' },
        ),
        process: fields.object({ eyebrow: text('Eyebrow'), heading: text('Heading'), steps: titled('Steps') }, { label: 'Process' }),
        work: fields.object({ eyebrow: text('Eyebrow'), heading: text('Heading') }, { label: 'Selected work' }),
        services: fields.object(
          {
            eyebrow: text('Eyebrow'),
            heading: text('Heading'),
            items: fields.array(
              fields.object({ title: text('Title'), text: longText('Text'), priceFrom: text('Price from', 'Leave empty unless a price is confirmed.') }),
              { label: 'Items', itemLabel: (p) => p.fields.title.value },
            ),
          },
          { label: 'Services' },
        ),
        reviews: fields.object({ eyebrow: text('Eyebrow'), heading: text('Heading') }, { label: 'Reviews' }),
        about: fields.object(
          {
            eyebrow: text('Eyebrow'),
            heading: text('Heading'),
            headingFaded: text('Heading, faded part'),
            introVideoId: text('Intro video YouTube ID', 'Leave empty to show the poster only and hide the hero intro button.'),
            introPoster: image('Intro video poster', 'src/assets/photos'),
            introDuration: text('Intro duration', 'For example "1:30".'),
            introTranscript: fields.markdoc.inline({ label: 'Intro transcript' }),
            name: text('Name'),
            role: text('Role'),
            bio: longText('Bio'),
            timeline: fields.array(
              fields.object({ role: text('Role'), org: text('Organisation'), years: text('Years') }),
              { label: 'Timeline', itemLabel: (props) => props.fields.role.value },
            ),
          },
          { label: 'About' },
        ),
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
        palette: fields.select({
          label: 'Colour palette',
          options: [
            { label: 'Forest', value: 'forest' },
            { label: 'Lime', value: 'lime' },
            { label: 'Navy', value: 'navy' },
            { label: 'Aubergine', value: 'aubergine' },
            { label: 'Teal', value: 'teal' },
            { label: 'Midnight', value: 'midnight' },
          ],
          defaultValue: 'forest',
        }),
        ghlCalendarEmbedUrl: text('GoHighLevel calendar embed URL'),
        ghlEmbedScriptUrl: text('GoHighLevel embed script URL', 'Optional. The script src from the calendar embed code. Loads only with the calendar.'),
        email: text('Email'),
        linkedinUrl: text('LinkedIn URL'),
        githubUrl: text('GitHub URL'),
        xUrl: text('X URL'),
        upworkUrl: text('Upwork URL'),
        fiverrUrl: text('Fiverr URL'),
        agencyName: text('Agency name'),
        agencyUrl: text('Agency URL'),
        siteUrl: text('Site URL'),
        defaultShareImage: image('Default share image'),
        analyticsSnippet: longText('Analytics snippet', 'Optional.'),
        caseStudy: fields.object(
          {
            allWork: text('Link back to work'),
            builtFor: text('Client prefix'),
            problem: text('Problem heading'),
            system: text('System heading'),
            results: text('Results heading'),
            designedTo: text('Designed-to heading'),
            tools: text('Tools heading'),
            demoVideo: text('Demo video heading'),
            gallery: text('Gallery heading'),
          },
          { label: 'Project page labels' },
        ),
        notFound: fields.object(
          { heading: text('Heading'), text: text('Text'), workLabel: text('Work link'), bookLabel: text('Book button') },
          { label: '404 page' },
        ),
        footerRole: text('Footer role'),
        footerLocation: text('Footer location'),
      },
    }),
  },
});
