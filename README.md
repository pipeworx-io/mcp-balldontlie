# @pipeworx/balldontlie

[balldontlie.io](https://docs.balldontlie.io) MCP — NBA stats. Free tier requires API key (5 req/min free).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform key: `PLATFORM_BALLDONTLIE_KEY`.
- BYO: `?_apiKey=…`.

## Tools

- `teams()` — all teams
- `team(id)` — single team
- `players(query?, team_ids?, cursor?, per_page?)` — players
- `player(id)` — single player
- `games(seasons?, team_ids?, dates?, postseason?, cursor?, per_page?)` — games
- `game(id)` — single game
- `season_averages(season, player_ids)` — season averages
- `stats(seasons?, player_ids?, game_ids?, postseason?, cursor?, per_page?)` — stats

## Data source

`https://api.balldontlie.io/v1/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "balldontlie": {
      "url": "https://gateway.pipeworx.io/balldontlie/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Balldontlie data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
