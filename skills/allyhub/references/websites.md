# references/websites.md

A website is any web project, made with the tools that suit it (Astro, Vite, Next.js, VitePress, plain HTML): a landing page, a company site, an online store, a documentation site, a blog, or pages made to rank in search and be cited in AI answers. AllyHub knows it by a JSON file you write in its folder and list in `allyhub.yaml`, which says how Studio serves it while you make it and how it is built; unlisted, the person never sees the website.

- `allyhub help websites` lists the commands and prints where the SDK's `websites.md` is. Read it before writing a website's file.
- `allyhub skills` lists the work skills, those for kinds of website among them.
- The `seo` tools say what people search for and what ranks: [research.md](research.md).
- A page can show a project's video: render the video into the website's folder and play it there.
- **See a page as Studio will**: run its dev server yourself, then `allyhub frames web <url>` takes the page's screenshot with its elements' boxes. `npx lychee` checks the built site's links and Lighthouse CI its search, accessibility and performance.
- **Hosting**: `allyhub site deploy` puts the built site on AllyHub at its own address, as a private version. It goes live only if the person has let you update the site; otherwise it answers with a page for the person to say yes on: give it to them, or ask them to press Publish in Studio. The built site deploys anywhere else as well.
