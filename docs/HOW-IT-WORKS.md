# How it works

The same explanation, with live numbers, is on the status page: `site/status.html`.

## The route from an edit to the public site

```
 You, in a browser
      |
      v
 1. Sanity Studio        the editing screens (code in studio/)
      |
      v
 2. Sanity dataset       where the content is stored (project p90vg6so, dataset production)
      |
      |   nightly at 02:00 India time, or when you press "Run workflow"
      v
 3. Sync robot           a GitHub Action: runs tools/sync-from-sanity.js, then tools/validate.js
      |
      |   validator error: stop here, the public site stays as it was
      v
 4. Snapshot in git      site/data/*.json, committed by the robot
      |
      v
 5. Netlify              sees the commit and publishes site/
      |
      v
 The reader's phone
```

The public site never talks to Sanity. It reads the snapshot only. That keeps pages small, keeps the site up if Sanity is down, and leaves every content change in git history.

## Changing or adding an entry

### Open the Studio

- Once the Studio is deployed: open its `….sanity.studio` address in any browser and sign in.
- Until then: open a terminal in `studio/`, run `npm install` once, then `npm run dev`, and open `http://localhost:3333`. This needs Node.

### Edit

1. The left column lists the kinds of entry: Movement, Event, Person, Organization, Text, Place. Click one.
2. The next column lists the entries of that kind. Click one to change it. To add one, click the create button at the top of that column (a pencil or plus icon).
3. Fill in or change the fields. For a link to another entry, go to **Relationships**, click **Add item**, type the relationship type (for example `led_by`) and pick the target entry. For a citation, go to **Sources**, click **Add item** and fill in the citation, its type and its URL.
4. Sanity saves as you type. What you have at this point is a **draft**, and drafts are private.
5. When the entry is ready to be read by anyone, do two things:
   - turn on the **Published** switch near the bottom of the form, and
   - click the **Publish** button at the bottom of the screen.

Both are needed. The Publish button moves the entry out of draft. The switch tells the sync robot to include it on the site.

### Send it to the site

6. Open the repository on GitHub and click the **Actions** tab.
7. In the left list click **Sync content from Sanity**.
8. Click **Run workflow**, then the green **Run workflow** button in the small panel that opens.
9. Wait about a minute. A green tick means the snapshot was updated. A red cross means the validator found an error: click the run to read which entry broke which rule. The public site is unchanged until it is fixed.
10. Netlify publishes the new snapshot about a minute after the green tick. Reload the site.

If you do nothing after step 5, the nightly run does steps 6 to 10 for you.

Labels in the Studio can differ slightly between Sanity versions. These steps have not been clicked through on this machine, because Node is not installed here yet.

### Taking an entry off the site

Turn the **Published** switch off, click **Publish**, and run the sync. The entry leaves the site. It is still readable through Sanity's API until you also choose **Unpublish** from the menu beside the Publish button.

## Is the Sanity data public?

Yes. The dataset is public, and on Sanity's free plan it has to be: private datasets need the paid Growth plan (about 15 US dollars per editor per month in November 2026; check Sanity's pricing page).

What that means in practice:

- Anything you **Publish** in Sanity can be read by anyone who knows the project id, through Sanity's API. The archive's own **Published** switch does not hide it there. It only keeps it off the website.
- **Drafts are private.** An entry you have typed but not clicked Publish on cannot be read from outside.

What is better:

- **Now, at no cost:** treat Sanity's Publish button as "the world can read this". Keep unfinished entries as drafts. This matches the archive's commitment to showing its work (Bible E5), and nothing in the dataset is secret.
- **Later, if needed:** pay for a private dataset once the dataset holds things that must not be read early, such as machine-suggested text from books, reviewer comments, or contributors' personal details. The sync robot would then read with a token kept as a GitHub secret. The public site would not change, because it never talks to Sanity.

On 17/11/2026 three entries were published in Sanity with the switch off: Charu Majumdar, the Floud Commission report and Sunil Sen's *Agrarian Struggle in Bengal*. Either finish them or unpublish them in Sanity.

## Where the rules live

| Rule set | File |
|---|---|
| What counts as an acceptable entry | `docs/BIBLE.md` |
| Banned sources, read by the status page | `site/config/blocklist.json` |
| Structural checks before anything is published | `tools/validate.js` |
| Rulings on individual sources and disputes | `docs/editorial-log.md` |

## Things that stop quietly

- GitHub turns off scheduled workflows in a repository with no commits for 60 days. If the nightly sync stops, open the Actions tab and re-enable it.
- Sanity's free plan keeps only a few days of revision history. The git history of `site/data/` is the long-term record of published content.
