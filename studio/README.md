# Left history archive: content studio

## Importing the seed data

Import in this order, because later files link to documents in earlier ones:

```
npx sanity dataset import entities-import.ndjson production
npx sanity dataset import cpi-bengal-founding.ndjson production
npx sanity dataset import tebhaga-expansion.ndjson production
```

## Migrations

One-off fixes to the live dataset live in `migrations/`. Each one is a dry run unless you pass `--apply`:

```
npx sanity exec migrations/fix-orphan-texts.ts
npx sanity exec migrations/fix-orphan-texts.ts --with-user-token -- --apply
```

---

# Sanity Clean Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)
