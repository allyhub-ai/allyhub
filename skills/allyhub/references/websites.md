# references/websites.md

A website is any web project in an item's folder, made with the tools that suit it (Astro, Vite, Next.js, VitePress, plain HTML): a landing page, a documentation site, a blog, or pages made to rank in search and be cited in AI answers. AllyHub knows it by its entry file, `website.json`, which you write beside the project's own files; without it, the person never sees the website.

```json
{
  "$schema": "https://allyhub.com/schemas/website.schema.json",
  "dev": "astro dev --port $PORT --host $HOST --ignore-lock",
  "build": "astro build",
  "output": "dist"
}
```

- `dev` runs in a shell in the website's folder with its `node_modules/.bin` on the PATH, as `npm run` does. It must listen on `$PORT` at `$HOST`: Studio sets both and adds no arguments of its own. A server that checks the `Host` header must allow `$ALLYHUB_PREVIEW_HOSTS` (Vite and the frameworks on it already do). Studio's server runs beside any you start yourself, so a dev server that refuses a second one in its folder must be told to (Astro's `--ignore-lock`). No `dev`: `output` is served as it is (`{ "output": "." }` for plain files).
- `allyhub help websites` lists the commands and prints where the SDK's `websites.md` is.
- `allyhub skills` lists the work skills, those for kinds of website among them.
- A page shows a project's video from its files: `allyhub render <video> --type mp4,vtt,cover --out <website>/public`, then `<video>` with a `<track>`, or any player.
- The `seo` tools say what people search for and what ranks: [research.md](research.md).
- `allyhub check` checks `website.json` (AK-M013). To see a page as Studio will, run `dev` yourself with `PORT` and `HOST=127.0.0.1` set, then `allyhub frames web http://127.0.0.1:$PORT/<path>`. `npx lychee <output>` checks the built site's links and Lighthouse CI its search, accessibility and performance; `output` deploys anywhere.
- `allyhub frames web <url>` takes a page's screenshot with its elements' boxes, to see a page as it stands.
- `allyhub site deploy` hosts a website on AllyHub at `<slug>.allyhub.site`: it runs `build` here and uploads `output` as a private version, and `--live` makes it what the address serves if the person has let the agent update the site. Otherwise it answers `live: false` and `confirm`, a page for the person to say yes on: give it to them, or ask them to press Update in Studio. A hosted site is static files: `index.html` at the root of `output`, `_redirects` and `_headers` as on Netlify, nothing server-rendered (a framework must export static files). `allyhub site status` lists versions; `allyhub site live <version>` moves it to another version with no build. A site's own `_headers` say which files browsers keep (a framework's hashed assets). Hosting is open to allowed organizations for now.
