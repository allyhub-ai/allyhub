# references/x.md

## An X post

An X post, a thread or a long post is an `x-post`: a YAML file anywhere in the project, listed in `allyhub.yaml` (`- { kind: x-post, file: launch/launch.yaml }`). Its fields are POST /2/tweets's own:

```yaml
reply_settings: following # who may reply to each post: following, mentionedUsers, subscribers or verified
posts:
  - text: |
      We shipped dark mode.
    media:
      - file: ./shots.ts#hero # an image's board, a video item, or a picture or video file, from this file's folder
        alt: The dashboard in dark mode.
  - text: Which do you use?
    poll: { options: [Light, Dark], duration_minutes: 1440 }
```

- **A thread** is its posts in order; each after the first is published as a reply to the one before. A post alone is a thread of one. The first post may also `reply` (`in_reply_to_tweet_id`) or quote (`quote_tweet_id`) a post already on X; quoting through the API needs an Enterprise plan. A post may say `made_with_ai` and `paid_partnership`.
- **Length is X's weighted count**, not the characters you see: Latin letters, digits and common punctuation 1; Chinese, Japanese, Korean and most other scripts 2; every emoji 2, whatever it is made of; every link 23, however long. At most 280 a post.
- **A long post** is a post over 280, which an X Premium account publishes up to 25,000. Say the account is Premium in `allyhub.config.ts` (`x: { premium: true }`); it also takes videos up to 4 hours and 16 GB. X's timeline shows a long post folded at "Show more": at most 280 characters, back to a word's end (measured on x.com; `allyhub frames` draws the fold). What a reader decides on is what comes before it.
- **Plain text.** The API publishes no bold or italics: write emphasis in the words. A link is its address.
- **Write a post's text as a block (`|`) or in quotes** when it holds ` #` (YAML reads the rest of the line as a comment), starts with `@`, `#` or a quote, or holds `: `. The line break a block ends in is not posted.
- **Media**: up to 4 pictures (JPEG, PNG or WebP, 5 MB each), or 1 GIF (15 MB), or 1 video (MP4 or MOV), never mixed. Alt text up to 1,000 characters. X publishes no picture size, crop or safe area. A video is checked against the widest of what X publishes: 0.5 s to 20 minutes (4 hours with Premium), 8 GB (16 GB), sides 32 px to 1920 on the long side and 1200 on the short, 1:3 to 3:1. X's ways of posting take less: its web upload 1:2.39 to 2.39:1 at 40 frames a second and 25 Mbps, and without Premium 140 seconds and 512 MB; its API's media guide 1280×1024 and 60 frames a second. A 1280×720 or 720×1280 H.264 MP4 at 30 frames a second under 140 seconds suits every way.
- **Another item's made file**: `./shots.ts#hero` is the image `shots`'s board `hero`, made first when the post is rendered; a video item's file is its first version. Its bytes are checked when it is made.

## An X article

An article is an `x-article`: a Markdown file listed in `allyhub.yaml` (`- { kind: x-article, file: launch/story.md }`), its title and cover in its front matter, its body in X's blocks alone:

```markdown
---
title: How we built dark mode
cover: ./shots.ts#cover # a picture file or an image's board; or { file, alt }
---

Paragraphs with **bold**, _italic_, ~~strikethrough~~ and [links](https://example.com).

# A heading (X has two: # a Heading, ## a Subheading)

- a list, one level deep

1. or numbered

> A quote.

<br />

![What the picture shows](./chart.png "Its caption")

https://x.com/allyhub/status/1234567890

https://example.com/launch

---

$$
e^{i\pi} + 1 = 0
$$
```

- **Each element is one of X's blocks**: a paragraph, a Heading (`#`) and a Subheading (`##`), lists a level deep, a quote, a picture, GIF or video on a line of its own (its alt text and its caption), a post's address on a line of its own (an embedded post), any other address on a line of its own (a link's card, as X's link preview), `---` (a divider), `$$ … $$` (an equation), a code block or a table (X's Markdown block: 10,000 together, weighted as X counts), and `<br />` alone on a line (an empty line, which X keeps). A third level of heading, a list inside a list, inline code, a picture or an equation inside a line and other HTML are not: each is a problem at its line.
- **A code block or a picture written inside a list item** stands after the list, and the list starts again after it, as X's editor places it: write the next numbered item as 1, or keep the list whole and put the block after it.
- **Media** are pictures (JPEG, PNG or WebP, 5 MB each), GIFs (15 MB) and videos (MP4 or MOV); the cover is a picture at 5:2. An image's board (`./shots.ts#chart`) or a video item (`./teaser.ts`) may be one, made first when the article is rendered. X publishes no most for a title or a body.
- **X Premium** writes articles. Through the API an article is drafted and published, and nothing else: it cannot be changed or deleted once published.

`allyhub check` reports what X refuses under `allyhub.x/…`, at its line. `allyhub inspect <post>` gives each post's weighted length beside 280 and 25,000, its links, mentions, hashtags and cashtags, and its media's bytes. `allyhub render <post>` writes POST /2/tweets's request for each post (`x-post`: `posts.json`, the media beside it) or each post's text (`--type txt`). `allyhub inspect <article>` gives its words, its weighted length, its headings, its media, its embedded posts and links' cards, and its code's weight against 10,000; `allyhub frames <post>` and `allyhub frames <article>` draw them as X shows them once published (a thread as the timeline does, an article in X's column), in Inter in place of X's own face; an embedded post and a link's card are drawn by their address, as their content is X's to fetch. `allyhub render <article>` writes POST /2/articles/draft's request (`x-article`: `article.json`, its media beside it with `media.json`). Publishing to X is not built.
