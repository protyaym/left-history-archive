import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'relationshipItem',
  title: 'Relationship',
  type: 'object',
  fields: [
    defineField({
      name: 'relationType',
      title: 'Relationship Type',
      type: 'string',
      description:
        'Free text, but stay consistent — e.g. led_by, part_of, continued_by, member_of, related_text, related_event, split_from, precedes',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'target',
      title: 'Target Entity',
      type: 'reference',
      to: [
        {type: 'movement'},
        {type: 'event'},
        {type: 'person'},
        {type: 'organization'},
        {type: 'text'},
        {type: 'place'},
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'relationType', subtitle: 'target.title', subtitle2: 'target.name'},
    prepare({title, subtitle, subtitle2}) {
      return {title, subtitle: subtitle || subtitle2}
    },
  },
})
