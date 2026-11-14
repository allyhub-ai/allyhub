# What AllyHub tells AllyHub

AllyHub's programs on your computer (the `allyhub` CLI and AllyHub Studio) tell AllyHub how they are used and when they fail, so that we find what breaks and what is worth building. This page is all of it.

## What is never told

A prompt or an answer, a file's name, path or content, a project's or a piece's title, a page you browsed, a command's arguments. An event is a name with numbers, yes or no, ids made at random and short names from the programs' own vocabulary (a kind of work, an agent, a command, a code). There is no free text in an event, and the programs check each one against that before it leaves.

Nothing is told while you are signed out, and nothing goes anywhere but AllyHub.

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
| `turn_finished` | An agent finished answering a message: how long it took, how it ended, and how many files it changed of each kind of work. | `agent`, `durationMs`, `ended`, `changed` |
| `job_finished` | Work Studio did ended: an export, a publish, an install, a download. | `what`, `about`, `kind`, `durationMs`, `outcome` |
| `command_ran` | A command of the allyhub CLI ran: its name, how long it took and its exit code. | `command`, `durationMs`, `exit` |
| `refusal_shown` | Studio showed that a call needs credits or a plan. | `code`, `where` |

Each event also says when it happened, which program and version told it, and, where it has them, random ids for the project, the conversation and the turn it was part of.

## Error reports

When something fails in AllyHub Studio, a report says what failed: the error's message and where in AllyHub's own code it happened, the app's version, the system and its version. Before a report leaves, the paths, web addresses and emails in the message are taken out, a file of yours in the stack is not named and none of its lines are sent, and the page's address, what you clicked or fetched, your computer's name and who is signed in are not gathered at all. The desktop app also tells how each run of it ended, so we know how often it crashes.

If the desktop app itself crashes, the report carries the dump the system writes of the crashed process, as every crash reporter's does: the state of its threads at that moment, which can hold fragments of what was in its memory. It is kept on your computer until the app next starts, and is sent then only if this setting is not `off`; with it `off`, the dump is deleted unsent.

A report goes to AllyHub, which passes it to the tool it reads errors with. A copy of AllyHub Studio run from its source code tells nothing unless asked to.

## What this setting does not cover

What AllyHub's service does for you is its own record, kept whatever this setting says, as any service's is: your account, the cloud tools and models you call and what they cost, your payments, and the times a call was refused for credits or a plan. Your account's page gives you all of it as a file. Closing your account removes it, but for the records of payments, which the law has us keep.
