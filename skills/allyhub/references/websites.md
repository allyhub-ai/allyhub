# references/websites.md

A website is a standard Astro project, known by its `astro.config.mjs`: a landing page, a documentation site (with Astro's Starlight), a blog, or pages made to rank in search and be cited in AI answers.

- `allyhub help websites` lists the commands and prints where the SDK's `project.md` is.
- `allyhub/astro` is the Astro integration, and `allyhub/site` gives a page `video()` and `still()`, to show the project's videos and stills.
- `allyhub site media` renders what the pages ask for into `public/allyhub`.
- The `seo` tools say what people search for and what ranks: [research.md](research.md).
- `astro check`, lychee and Lighthouse CI check the built site, and its `dist/` deploys anywhere.
- `allyhub frames web <url>` takes a page's screenshot with its elements' boxes, to see a page as it stands.
