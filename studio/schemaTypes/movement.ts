import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'movement',
  title: 'Movement',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}}),

    defineField({name: 'periodStart', title: 'Period Start', type: 'string', description: 'e.g. "1946-09" or "1946"'}),
    defineField({name: 'periodEnd', title: 'Period End', type: 'string', description: 'e.g. "1947"'}),
    defineField({name: 'era', title: 'Era', type: 'string', description: 'e.g. "Late British India / Partition"'}),

    defineField({name: 'place', title: 'Place', type: 'placeEmbed'}),

    defineField({name: 'summaryCard', title: 'Summary (short)', type: 'text', rows: 3, description: '1–3 sentences for the explorer card.'}),
    defineField({name: 'fullEntry', title: 'Full Entry', type: 'text', rows: 10}),

    defineField({name: 'relationships', title: 'Relationships', type: 'array', of: [{type: 'relationshipItem'}]}),
    defineField({name: 'sources', title: 'Sources', type: 'array', of: [{type: 'sourceItem'}]}),

    defineField({name: 'contested', title: 'Contested', type: 'boolean', description: 'Turn on when accounts diverge — the UI flags this rather than picking one story.'}),
    defineField({name: 'editorNote', title: 'Editor Note', type: 'text', rows: 3, description: 'Things a future editor needs to check before this goes live.'}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'periodStart'},
  },
})
