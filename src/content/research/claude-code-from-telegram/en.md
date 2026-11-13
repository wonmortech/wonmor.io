---
title: "Controlling Claude Code from Telegram"
description: "A small Python bot turns a phone chat into a remote for Claude Code on a desktop: one headless process per message, hooks for notifications and approvals, and parallel slots. What we built in one day and what we learned about phone-sized requests."
date: 2026-10-21
kind: engineering
area: agents
featured: false
source:
  - "claude-telegram-bot: bot.py, notify.py, perm_hook.py, commands.json (private, local project)"
  - "Internal engineering notes, 2026-10-21 to 2026-10-22"
  - "https://docs.python-telegram-bot.org/"
reproduce:
  note: "The bot is a private local project; these public commands show the two building blocks it relies on: headless Claude Code with streamed JSON, and the Telegram bot library."
  commands:
    - "pip install python-telegram-bot==22.8"
    - "claude -p --output-format stream-json --verbose \"list the files in this folder\""
---

Long agent sessions are a strange fit for a desk. You start a task, it runs for twenty minutes, and you either watch it or walk away and forget it. We wanted the opposite: start work from a phone, get told when it finishes, approve a risky step from anywhere, and pick up the same session later by replying to a message. On 21 October 2026 we built a small Telegram bot for exactly that. It runs on the same Windows desktop as Claude Code.

## One message, one headless process

The bot is one Python file of about 1,150 lines on `python-telegram-bot` 22.8, plus two hook scripts. It does not keep a long-lived agent in memory. Each incoming message starts a fresh headless Claude Code process, and continuity comes from resuming the session by ID:

```bash
claude -p --output-format stream-json --verbose \
  --append-system-prompt "<phone-specific instructions>" \
  --resume <session-id>          # omitted for a new conversation
```

The prompt goes in on stdin. The bot reads the JSON event stream line by line. Every `tool_use` event becomes a short step such as "🔧 Bash: run tests". A single status message in the chat is edited at most every three seconds, showing elapsed minutes and the last eight steps. The final `result` event carries the answer, the session ID and the cost, and the bot records the cost per day and per conversation.

```steps
Message :: Text, a voice note or a file arrives in the chat from an allowed user ID.
Spawn :: The bot starts a headless Claude Code process in the right folder, resuming the slot's session.
Stream :: Tool calls from the JSON stream update one status message with live steps.
Reply :: The final answer is sent back, along with any files the agent marked for sending.
Continue :: Replying to any bot message resumes that exact session in its original folder.
```

A few details made this work on a phone:

- **Voice.** Voice notes are transcribed locally with a small Whisper model on the CPU. The prompt tells the agent that the transcript may contain recognition errors.
- **Files both ways.** Incoming photos and documents are saved locally, and their absolute paths are put into the prompt. To send a file back, the agent writes a line `[[SEND: <absolute path>]]` in its answer, and the bot uploads that file.
- **Phone-sized output.** The appended system prompt asks for concise answers and no wide tables, and long answers are split to fit Telegram's message limit.

## Hooks: hearing back and saying yes

The more useful half is not the bot. It is two Claude Code hooks that also cover sessions started at the keyboard.

**Notifications.** A `Stop` hook sends "finished" with the project name, the duration and the tail of the last answer, but only if the session ran longer than 30 seconds, so quick questions do not buzz the phone. A `Notification` hook reports when Claude is waiting for input or asking a question. Each sent message is mapped to its session ID and working folder, so **replying to the notification resumes that session from the phone**. Sessions the bot itself started set an environment variable that silences the hooks, so nothing is reported twice.

**Remote approvals.** A blocking `PermissionRequest` hook sends the pending action to the chat with Allow and Deny buttons: the command with its description, or the file and the diff of an edit. The hook waits for a file the bot writes when a button is pressed, with a timeout of a little under an hour. It only does this when the user is "away". In automatic mode that means no keyboard or mouse input for 120 seconds. If the user comes back to the desk while a request is pending, the message is edited to say the request moved to the terminal, and the terminal prompt takes over. Away mode can also be forced on or off from the chat.

## Slots: parallel work from one chat

The first version had one conversation per chat, which turned out to be a bottleneck: a long refactor blocked a quick question. The rewrite added **slots**, up to eight parallel conversations per chat, each with its own title, session ID, folder and running cost. Plain messages go to the active slot. A reply goes to whichever slot owns the message being replied to. Quick commands and the scheduled morning report always open a new slot. When the limit is reached, the oldest idle slot is closed. In a test, two slots running a small model in parallel both finished in 8.2 seconds.

Two more additions came from daily use:

- **A session picker.** `/resume` lists past sessions with readable titles (a custom title, then an AI-generated title, then the first prompt), eight per page, and shows the last answer when one is chosen. Building titles means reading session files. A cache keyed on path and modification time cut the time from about 8 seconds cold to 0.02 seconds warm, across 186 sessions.
- **Quick commands.** Frequent prompts live in a JSON file of six entries, so adding one means editing JSON and restarting. They are also registered as the bot's command menu.

## Lessons: the simplest interpretation wins

The most important lesson was about language, not code. Early on, a message of the form "<file path> show me" turned into a 14-step browser automation that rendered the file and took a screenshot, when the request was simply "send me this file". On a phone, every extra step is felt. We fixed it at two levels. First, a direct path: if a message is a file path plus at most two words, the bot sends the file itself without calling the model. It also resolves paths without extensions and with common Uzbek suffixes. Second, a standing instruction in the system prompt: "show" or "send" means send the file itself, right away, and the simplest action that satisfies the request wins.

Other lessons:

- **Read stderr in parallel.** The first version read stderr only after stdout ended. A chatty process could fill the stderr pipe and hang. The fix was a concurrent reader.
- **Restart cheaply.** A batch loop restarts the bot five seconds after it exits, and a scheduled task starts it hidden at logon. Restarting after a code change means killing the process.
- **Do not trust idle detection blindly.** Inside the sandbox, the idle timer once reported 47 hours. The manual away switch exists because of that.

## Limitations

- **The trust boundary is the allowlist and the machine.** Who may use the bot is decided by an allowlist of Telegram user IDs, and the bot is meant only for a personal machine you control: whatever it runs has the same rights as that machine's user.
- **Long jobs are not durable.** A bot restart loses track of running processes, and there is no per-run timeout yet.
- **Formatting.** Messages are sent as plain text, so Markdown from the model shows up raw.
- **One machine.** The bot drives the desktop it runs on. Nothing here is a hosted service, and we have not measured usage beyond the figures above.
