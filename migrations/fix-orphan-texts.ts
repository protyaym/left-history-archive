// One-off migration: remove the two orphaned `_type: "text"` documents.
//
// tx_floud_report and tx_sen_agrarian_struggle were imported under an old
// type name ("text") that the schema no longer has, so the Studio cannot
// show or edit them. Their content already lives, identically, in
// tx_floud_land_report and tx_sen_agrarian_struggle_bengal (type textContent).
// This repoints every relationship from the orphan to its replacement, then
// deletes the orphan, all in a single transaction: either everything applies
// or nothing does.
//
// Dry run (default, read-only):
//   npx sanity exec migrations/fix-orphan-texts.ts
// Apply:
//   npx sanity exec migrations/fix-orphan-texts.ts --with-user-token -- --apply

import {getCliClient} from 'sanity/cli'

// The project has no @types/node; declare only what this script touches.
declare const process: {argv: string[]; exitCode?: number}

const REPLACEMENT: Record<string, string> = {
  tx_floud_report: 'tx_floud_land_report',
  tx_sen_agrarian_struggle: 'tx_sen_agrarian_struggle_bengal',
}

type Rel = {_key: string; ref?: string}
type Referrer = {_id: string; relationships?: Rel[]}

const client = getCliClient({apiVersion: '2024-01-01'})
const apply = process.argv.includes('--apply')

async function run() {
  const orphanIds = Object.keys(REPLACEMENT)
  const replacementIds = Object.values(REPLACEMENT)

  const existing: {_id: string; _type: string}[] = await client.fetch(
    '*[_id in $ids]{_id, _type}',
    {ids: [...orphanIds, ...replacementIds]},
  )
  const typeOf = Object.fromEntries(existing.map((d) => [d._id, d._type]))

  for (const id of replacementIds) {
    if (typeOf[id] !== 'textContent') {
      throw new Error(
        `Replacement ${id} is missing or not textContent (found: ${typeOf[id]}). Aborting.`,
      )
    }
  }
  const orphansPresent = orphanIds.filter((id) => typeOf[id])
  if (orphansPresent.length === 0) {
    console.log('Nothing to do: neither orphan exists any more.')
    return
  }

  const referrers: Referrer[] = await client.fetch(
    '*[references($ids)]{_id, relationships[]{_key, "ref": target._ref}}',
    {ids: orphansPresent},
  )

  const tx = client.transaction()
  const plan: string[] = []

  for (const doc of referrers) {
    for (const rel of doc.relationships ?? []) {
      const to = rel.ref && REPLACEMENT[rel.ref]
      if (!to) continue
      tx.patch(doc._id, (p) => p.set({[`relationships[_key=="${rel._key}"].target._ref`]: to}))
      plan.push(`repoint  ${doc._id} relationships[${rel._key}]  ${rel.ref} -> ${to}`)
    }
  }
  for (const id of orphansPresent) {
    tx.delete(id)
    plan.push(`delete   ${id} (_type "${typeOf[id]}")`)
  }

  console.log(`${plan.length} change(s):`)
  plan.forEach((line) => console.log(`  ${line}`))

  if (!apply) {
    console.log('\nDry run only. Re-run with --with-user-token -- --apply to commit.')
    return
  }

  await tx.commit()

  const left = await client.fetch('count(*[_id in $ids || references($ids)])', {
    ids: orphansPresent,
  })
  console.log(
    left === 0
      ? '\nDone. No orphan or reference to one remains.'
      : `\nWARNING: ${left} document(s) still match.`,
  )
}

run().catch((err) => {
  console.error(err.message)
  process.exitCode = 1
})
