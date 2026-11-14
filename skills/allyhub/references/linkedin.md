# references/linkedin.md

What will be published on LinkedIn is written in LinkedIn's own model, so what LinkedIn counts and refuses is checked before it goes:

- **A LinkedIn post** (`linkedin-post`): one post, its words with pictures, a video, a document (a carousel), a poll or a link's card.
- **A LinkedIn article** (`linkedin-article`): a long piece in LinkedIn's article blocks, with its title and cover.

A post's pictures, video and document can be the project's own items: an image's board, a video, or an image's boards or a deck as one PDF (a carousel), made when the post is rendered.

- `allyhub help linkedin` lists the commands and prints where the SDK's `linkedin.md` is. Read it before writing a post or an article.
- `allyhub frames` draws a post as LinkedIn's feed shows it, folded at "… more" and opened, and an article as its page shows it; `allyhub inspect` gives what LinkedIn counts. Look with them before handing it over.
- **Publishing to LinkedIn is not built.** `allyhub render` writes the request LinkedIn's Posts API takes, or a post's text to paste; an article is HTML to paste into LinkedIn's editor (LinkedIn has no API for articles), and its editor copies it for LinkedIn.
