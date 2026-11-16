import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}}),

    defineField({name: 'date', title: 'Date', type: 'string', description: 'e.g. "1940" or "1946-09" or "1946-09-05"'}),

    defineField({name: 'place', title: 'Place', type: 'placeEmbed'}),

    defineField({name: 'summaryCard', title: 'Summary (short)', type: 'text', rows: 3}),
    defineField({name: 'fullEntry', title: 'Full Entry', type: 'text', rows: 10}),

    defineField({name: 'relationships', title: 'Relationships', type: 'array', of: [{type: 'relationshipItem'}]}),
    defineField({name: 'sources', title: 'Sources', type: 'array', of: [{type: 'sourceItem'}]}),

    defineField({name: 'contested', title: 'Contested', type: 'boolean'}),
    defineField({name: 'editorNote', title: 'Editor Note', type: 'text', rows: 3}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'date'},
  },
})
