// Place this file at: your-sanity-project/schemaTypes/index.ts

import movement from './movement'
import event from './event'
import person from './person'
import organization from './organization'
import text from './ext'
import place from './place'
import relationshipItem from './relationshipItem'
import sourceItem from './sourceItem'
import placeEmbed from './placeEmbed'

export const schemaTypes = [
  // Documents
  movement,
  event,
  person,
  organization,
  text,
  place,
  // Objects
  relationshipItem,
  sourceItem,
  placeEmbed,
]
