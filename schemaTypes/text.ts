import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'textContent',
  title: 'Text Content',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}}),
    defineField({name: 'date', title: 'Date', type: 'string'}),
    defineField({
      name: 'sourceClass',
      title: 'Source Class',
      type: 'string',
      options: {list: ['primary', 'secondary', 'tertiary']},
    }),

    defineField({name: 'summaryCard', title: 'Summary (short)', type: 'text', rows: 3}),
    defineField({name: 'fullEntry', title: 'Full Entry', type: 'text', rows: 10}),

    defineField({name: 'relationships', title: 'Relationships', type: 'array', of: [{type: 'relationshipItem'}]}),
    defineField({name: 'sources', title: 'Sources', type: 'array', of: [{type: 'sourceItem'}]}),

    defineField({name: 'contested', title: 'Contested', type: 'boolean'}),
    defineField({name: 'editorNote', title: 'Editor Note', type: 'text', rows: 3}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'sourceClass'},
  },
})
