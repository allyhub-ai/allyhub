# What AllyHub tells AllyHub

AllyHub's programs on your computer (the `allyhub` CLI and AllyHub Studio) tell AllyHub how they are used and when they fail, so that we find what breaks and what is worth building. This page is all of it.

## What is never told

A prompt or an answer, a file's name, path or content, a project's or a piece's title, a page you browsed, a command's arguments. An event is a name with numbers, yes or no, ids made at random and short names from the programs' own vocabulary (a kind of work, an agent, a command, a code). There is no free text in an event, and the programs check each one against that before it leaves.

Nothing is told while you are signed out, and nothing goes anywhere but AllyHub.

## What you ask an agent

When you send a message to an agent in AllyHub Studio while you are signed in, on your computer or in the cloud, AllyHub keeps its words with the turn: the agent's answer, the steps it took (each one's kind, its title, such as "Read videos/launch.ts", and whether it worked, never a file's content or a command's output), when the turn began and ended, how it ended, and how many pieces it changed. We keep it so that we can look into a turn that went wrong, and so that AllyHub can show it to you. It is not telemetry: the setting below does not change it, it is never sent on to an analytics tool, and it is never used to train a model. It is deleted with your account.

To count what people use AllyHub for and how it goes for them, a model AllyHub runs at its own cost reads each message you send and answers a few words: the kind of work it asks for (research on social media, research on a market, a document, media, writing, operating a website for you, a question, or other), the language it is written in, how you sound in it (pleased, neutral, confused or frustrated) and, when confused or frustrated, what about (the result, speed, cost, reaching something, something AllyHub cannot do, or other). The words are kept with the turn and counted with the events of the service; the message's words go to that model through AllyHub's model gateway, as AllyHub's own agent's calls do, and nowhere else.

## Turning it off

One setting holds for every AllyHub program on the computer. It is `all` unless you change it.

| Level | Tells |
| --- | --- |
| `all` | Usage events and error reports |
| `errors` | Error reports alone |
| `off` | Nothing |

- In AllyHub Studio: Settings, General, Tell AllyHub.
- In a terminal or an agent: set `ALLYHUB_TELEMETRY` to `off`, `errors` or `all` in the environment. `DO_NOT_TRACK=1` turns everything off too.

The environment wins over Studio's setting.

## The events

| Event | When | What it carries |
| --- | --- | --- |
| `program_opened` | Studio started. | `os`, `arch`, `where` |
| `project_opened` | A project was opened in Studio. | `fresh`, `items` |
| `item_opened` | A piece was put on show in Studio: its kind (a video, a deck, a doc), never which one. | `kind` |
| `session_started` | A conversation with an agent began. | `agent` |
| `turn_started` | A message was sent to an agent: which agent, never what the message says. | `agent` |
| `turn_finished` | An agent finished answering a message: how long it took, how it ended, how many files it changed of each kind of work and how many pieces of each kind it made. | `agent`, `durationMs`, `ended`, `changed`, `made` |
| `job_finished` | Work Studio did ended: an export, a publish, an install, a download. | `what`, `about`, `kind`, `durationMs`, `outcome` |
| `command_ran` | A command of the allyhub CLI ran: its name, how long it took, its exit code and, where it did not succeed, its failure's code. | `command`, `durationMs`, `exit`, `code` |
| `refusal_shown` | Studio showed that a call needs credits or a plan. | `code`, `where` |

Each event also says when it happened, which program and version told it, and, where it has them, random ids for the project, the conversation and the turn it was part of.

### On AllyHub's site

AllyHub Studio in your browser, on AllyHub's own site, tells a few of your clicks and the pages you arrive at, each by name: never what a button says, what you typed, or which project, piece or file it was. They are sent to AllyHub's site alone, signed in as you. If your browser sends Global Privacy Control or Do Not Track, it tells none of them; where Studio's page reads the setting above, it tells them only at `all`.

| Event | When | What it carries |
| --- | --- | --- |
| `home_product_chosen` | On the console's Home, the action of one of the three ways to use AllyHub was pressed: which way. | `product` |
| `item_opened_from_sidebar` | A piece or a file was opened from the sidebar by hand: its kind, and a plain file's extension, never which one. | `kind`, `extension` |
| `file_downloaded` | A file was downloaded from Studio's Download: the piece's kind, the file's format, and whether the computer in the cloud was paused. | `kind`, `format`, `paused` |
| `share_opened` | Studio's Share panel was opened: the piece's kind. | `kind` |
| `upgrade_clicked` | An upgrade or buy-credits button was pressed: which of a few places it was in. | `where` |
| `plan_chosen` | A plan's button was pressed on the plan page: which plan, monthly or yearly, whether it changes a plan already paid for, and whether the page was in Settings or the paywall. | `plan`, `interval`, `change`, `where` |
| `prompt_prefilled` | The composer opened with a prompt from a link (a tool page's Get started): whether it has blanks to fill in, and which tool page it came from. Never its words. | `blanks`, `from` |
| `welcome_example_pressed` | In the first project, one of the welcome's examples was pressed: its number as shown. Never its words. | `index` |
| `page_viewed` | One of a few pages was arrived at: the console's Home, AllyHub in the Cloud, or the plan's settings. | `page` |
| `paywall_shown` | The dialog that offers plans and credits opened: why AllyHub refused (credits, a plan, storage), what kind of thing it refused, and whether a refusal or its reminder opened it. | `reason`, `what`, `trigger` |
| `checkout_abandoned` | Someone came back from Stripe's payment page without paying: what it was for (a plan, credits, a card) and, when they answered, which of a few reasons stopped them. | `what`, `reason` |

## Error reports

When something fails in AllyHub Studio, a report says what failed: the error's message and where in AllyHub's own code it happened, the app's version, the system and its version. Before a report leaves, the paths, web addresses and emails in the message are taken out, a file of yours in the stack is not named and none of its lines are sent, and the page's address, what you clicked or fetched, your computer's name and who is signed in are not gathered at all. The desktop app also tells how each run of it ended, so we know how often it crashes.

If the desktop app itself crashes, the report carries the dump the system writes of the crashed process, as every crash reporter's does: the state of its threads at that moment, which can hold fragments of what was in its memory. It is kept on your computer until the app next starts, and is sent then only if this setting is not `off`; with it `off`, the dump is deleted unsent.

A report goes to AllyHub, which passes it to the tool it reads errors with. A copy of AllyHub Studio run from its source code tells nothing unless asked to.

## What this setting does not cover

What AllyHub's service does for you is its own record, kept whatever this setting says, as any service's is: your account, the cloud tools and models you call and what they cost, your payments, and the times a call was refused for credits or a plan. Your account's page gives you all of it as a file. Closing your account removes it, but for the records of payments, which the law has us keep.
