interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * balldontlie.io MCP.
 *
 * Auth: PLATFORM_BALLDONTLIE_KEY or ?_apiKey=…
 */


const BASE = 'https://api.balldontlie.io/v1';
const UA = 'pipeworx-mcp-balldontlie/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'teams', description: 'All teams.', inputSchema: { type: 'object', properties: {} } },
  { name: 'team', description: 'Single team.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  {
    name: 'players',
    description: 'Players.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Name substring.' },
        team_ids: { type: 'array', items: { type: 'number' } },
        cursor: { type: 'number' },
        per_page: { type: 'number' },
      },
    },
  },
  { name: 'player', description: 'Single player.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  {
    name: 'games',
    description: 'Games.',
    inputSchema: {
      type: 'object',
      properties: {
        seasons: { type: 'array', items: { type: 'number' } },
        team_ids: { type: 'array', items: { type: 'number' } },
        dates: { type: 'array', items: { type: 'string' }, description: 'YYYY-MM-DD' },
        postseason: { type: 'boolean' },
        cursor: { type: 'number' },
        per_page: { type: 'number' },
      },
    },
  },
  { name: 'game', description: 'Single game.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  {
    name: 'season_averages',
    description: 'Season averages.',
    inputSchema: {
      type: 'object',
      properties: {
        season: { type: 'number' },
        player_ids: { type: 'array', items: { type: 'number' } },
      },
      required: ['season', 'player_ids'],
    },
  },
  {
    name: 'stats',
    description: 'Stats.',
    inputSchema: {
      type: 'object',
      properties: {
        seasons: { type: 'array', items: { type: 'number' } },
        player_ids: { type: 'array', items: { type: 'number' } },
        game_ids: { type: 'array', items: { type: 'number' } },
        postseason: { type: 'boolean' },
        cursor: { type: 'number' },
        per_page: { type: 'number' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('balldontlie requires an API key. Set PLATFORM_BALLDONTLIE_KEY or pass ?_apiKey=… (free at https://app.balldontlie.io).');
  const arr = (k: string) => Array.isArray(args[k]) ? (args[k] as (string | number)[]) : null;
  const params = (extra: Record<string, unknown>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(extra)) {
      if (v == null) continue;
      if (Array.isArray(v)) for (const x of v) p.append(`${k}[]`, String(x));
      else if (typeof v === 'boolean') p.set(k, v ? 'true' : 'false');
      else p.set(k, String(v));
    }
    return p;
  };
  switch (name) {
    case 'teams': return bdlGet(apiKey, '/teams');
    case 'team': return bdlGet(apiKey, `/teams/${(args.id as number) | 0}`);
    case 'players': {
      const p = params({
        search: args.query,
        team_ids: arr('team_ids'),
        cursor: args.cursor,
        per_page: args.per_page,
      });
      return bdlGet(apiKey, `/players?${p}`);
    }
    case 'player': return bdlGet(apiKey, `/players/${(args.id as number) | 0}`);
    case 'games': {
      const p = params({
        seasons: arr('seasons'),
        team_ids: arr('team_ids'),
        dates: arr('dates'),
        postseason: args.postseason,
        cursor: args.cursor,
        per_page: args.per_page,
      });
      return bdlGet(apiKey, `/games?${p}`);
    }
    case 'game': return bdlGet(apiKey, `/games/${(args.id as number) | 0}`);
    case 'season_averages': {
      const p = params({
        season: args.season,
        'player_ids': arr('player_ids'),
      });
      return bdlGet(apiKey, `/season_averages?${p}`);
    }
    case 'stats': {
      const p = params({
        seasons: arr('seasons'),
        player_ids: arr('player_ids'),
        game_ids: arr('game_ids'),
        postseason: args.postseason,
        cursor: args.cursor,
        per_page: args.per_page,
      });
      return bdlGet(apiKey, `/stats?${p}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function bdlGet(apiKey: string, path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA, Authorization: apiKey },
  });
  if (res.status === 401) throw new Error('balldontlie: 401 — invalid API key.');
  if (res.status === 429) throw new Error('balldontlie: 429 rate-limit (5/min free tier).');
  if (!res.ok) throw new Error(`balldontlie: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
