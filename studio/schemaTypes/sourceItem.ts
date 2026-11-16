import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sourceItem',
  title: 'Source',
  type: 'object',
  fields: [
    defineField({name: 'citation', title: 'Citation', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'sourceType',
      title: 'Type',
      type: 'string',
      options: {list: ['primary', 'secondary', 'tertiary']},
    }),
    defineField({name: 'url', title: 'URL', type: 'url'}),
  ],
  preview: {
    select: {title: 'citation', subtitle: 'sourceType'},
  },
})
