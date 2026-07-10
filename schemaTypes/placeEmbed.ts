import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'placeEmbed',
  title: 'Place',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Place Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'coordinates', title: 'Coordinates', type: 'geopoint', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 2,
      description: 'e.g. "Spread across roughly 19 districts, most intensely in..."',
    }),
  ],
})
