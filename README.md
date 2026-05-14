# OpenBorys

An AI agent bot for Discord, built on Bun. OpenBorys runs as a Discord bot that processes messages through a state machine, calling LLM APIs and executing tools in a loop.

## Getting started

```bash
bun install
cp .env.template .env  # fill in your keys
bun dev
```

For production:

```bash
bun start
```

## Environment variables

Copy `.env.template` and fill in the values.

| Variable | What it's for |
| --- | --- |
| `DISCORD_TOKEN` | Bot token from the Discord developer portal |
| `DISCORD_CLIENT_ID` | Application ID for the bot |
| `REDIS_URL` | Redis connection string (stores tool call history) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `OPENAI_API_KEY` | OpenAI API key |
| `REPLICATE_API_TOKEN` | Replicate API token (image generation) |
| `TAVILY_API_KEY` | Tavily API key (web search tool) |
| `AWS_ACCESS_KEY_ID` | Tigris object storage access key |
| `AWS_SECRET_ACCESS_KEY` | Tigris object storage secret |
| `AWS_ENDPOINT_URL_S3` | Tigris endpoint (default: `https://fly.storage.tigris.dev`) |
| `AWS_REGION` | Storage region (default: `auto`) |
| `AWS_BUCKET` | S3 bucket name (default: `openborys`) |
| `PROMPTS_PREFIX` | S3 key prefix for prompt files |
| `FRIENDS_PREFIX` | S3 key prefix for friend data |
| `QDRANT_API_KEY` | Qdrant vector DB API key |
| `QDRANT_URL` | Qdrant instance URL |
| `QDRANT_COLLECTION` | Qdrant collection name |
| `QDRANT_BOT_NAME` | Bot identity name for Qdrant queries |
| `BOT_NAME` | Display name for the bot |

## How the Discord agent works

The agent is modelled as a recursive state machine. Each state is a handler function that receives a mutable context and returns the next state (or `null` to stop).

States:

1. Message Received - Builds the system prompt and conversation context from the Discord message. Transitions to Thinking.
2. Thinking - Sends the message history to the LLM to get the next step. If the model returns text (`stop`), transitions to Sending Message. If it returns tool calls, queues them and transitions to Tool Call.
3. Tool Call - Pops the next pending tool call, sends a Discord embed showing what tool is being invoked, logs the call to Redis, and transitions to Executing Tool.
4. Executing Tool - Runs the tool, appends the result to the message history, and logs it to Redis. If more tool calls are pending, loops back to Tool Call. Otherwise, transitions to Thinking for another LLM turn.
5. Sending Message - Sends message to the Discord channel. Terminal state.
6. Error - In case of unexpected failures. Terminal state.

## License

AGPL-3.0
