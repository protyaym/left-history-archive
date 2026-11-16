import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}}),
    defineField({name: 'role', title: 'Role', type: 'string', description: 'e.g. "Kisan Sabha and Communist Party organizer"'}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    
    defineField({name: 'summaryCard', title: 'Summary (short)', type: 'text', rows: 3}),
    defineField({name: 'fullEntry', title: 'Full Entry', type: 'text', rows: 10}),

    defineField({name: 'relationships', title: 'Relationships', type: 'array', of: [{type: 'relationshipItem'}]}),
    defineField({name: 'sources', title: 'Sources', type: 'array', of: [{type: 'sourceItem'}]}),

    defineField({name: 'contested', title: 'Contested', type: 'boolean'}),
    defineField({name: 'editorNote', title: 'Editor Note', type: 'text', rows: 3}),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo'},
  },
})
