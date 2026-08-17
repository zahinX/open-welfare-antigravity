# MCP (Model Context Protocol) Setup Guide

> **Last Updated:** 2026-08-17  
> **Applies to:** All contributors using AI coding assistants (Antigravity, VS Code + Copilot, Cursor, Windsurf, etc.)

This guide explains how to configure and run the MCP servers used by AI agents in this project. MCP servers give AI assistants the ability to interact with external tools (like GitHub) directly from your IDE.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
  - [1. Generate a GitHub Personal Access Token](#1-generate-a-github-personal-access-token)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Verify the MCP Configuration](#3-verify-the-mcp-configuration)
- [How It Works](#how-it-works)
- [Available MCP Servers](#available-mcp-servers)
  - [GitHub MCP Server](#github-mcp-server)
- [Adding a New MCP Server](#adding-a-new-mcp-server)
- [IDE-Specific Notes](#ide-specific-notes)
  - [Google Antigravity](#google-antigravity)
  - [VS Code / GitHub Copilot](#vs-code--github-copilot)
  - [Cursor](#cursor)
  - [Windsurf](#windsurf)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

---

## Prerequisites

| Requirement        | Minimum Version | Check Command          |
|--------------------|-----------------|------------------------|
| **Node.js**        | 18.x            | `node --version`       |
| **npm**            | 9.x             | `npm --version`        |
| **npx**            | (bundled w/ npm) | `npx --version`       |
| **GitHub Account** | —               | —                      |

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/zahinX/open-welfare-antigravity.git
cd open-welfare-antigravity

# 2. Copy the example env file
cp .env.example .env.local

# 3. Fill in your GitHub PAT (see "Generate a GitHub Personal Access Token" below)
#    Edit .env.local and set:
#    GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# 4. Install project dependencies
npm install

# 5. Open the project in your AI-enabled IDE — the MCP server starts automatically
```

---

## Detailed Setup

### 1. Generate a GitHub Personal Access Token

The GitHub MCP server requires a Personal Access Token (PAT) to authenticate API calls (creating PRs, listing issues, pushing files, etc.).

1. Go to **[GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)**
2. Click **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., `open-welfare-mcp`)
4. Set an expiration (90 days recommended)
5. Select the following **scopes**:

   | Scope           | Why It's Needed                                  |
   |-----------------|--------------------------------------------------|
   | `repo`          | Full access to repositories (PRs, issues, code)  |
   | `read:org`      | Read org membership (if working in an org)        |
   | `workflow`      | Trigger and manage GitHub Actions (optional)      |

6. Click **"Generate token"** and **copy it immediately** — you won't see it again.

> [!CAUTION]
> Never commit your token to version control. The `.gitignore` in this project already excludes `.env*` files (except `.env.example`).

### 2. Configure Environment Variables

Open (or create) `.env.local` in the project root and add your token:

```bash
# .env.local
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

This file is **git-ignored** by default. The token is referenced by the MCP config via the `${GITHUB_PERSONAL_ACCESS_TOKEN}` interpolation syntax — no hardcoding needed anywhere else.

### 3. Verify the MCP Configuration

The MCP server configuration lives at [`.agents/mcp_config.json`](./../.agents/mcp_config.json):

```jsonc
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Key points:**
- The `"command"` uses `npx -y` to auto-install the MCP server package on first run — no global install needed.
- The `"env"` block uses `${VARIABLE_NAME}` interpolation to read from your `.env.local` at runtime.
- You do **not** need to modify this file unless you're adding a new MCP server.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     Your AI-Enabled IDE                      │
│  (Antigravity, Copilot, Cursor, Windsurf, etc.)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. IDE reads .agents/mcp_config.json on startup             │
│  2. For each server entry, IDE spawns the process:           │
│     → npx -y @modelcontextprotocol/server-github             │
│  3. Environment variables from .env.local are injected       │
│     via the "env" block (${VAR} interpolation)               │
│  4. The MCP server exposes tools (e.g., create_pull_request, │
│     list_issues, search_code) over the MCP protocol          │
│  5. The AI agent calls these tools as needed                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Available MCP Servers

### GitHub MCP Server

| Property       | Value                                           |
|----------------|--------------------------------------------------|
| **Package**    | `@modelcontextprotocol/server-github`            |
| **Source**     | [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) |
| **Config Key** | `github`                                         |
| **Env Vars**   | `GITHUB_PERSONAL_ACCESS_TOKEN`                   |

**Available Tools:**

| Tool                        | Description                              |
|-----------------------------|------------------------------------------|
| `create_pull_request`       | Create a new PR                          |
| `get_pull_request`          | Get details of a specific PR             |
| `list_pull_requests`        | List and filter PRs                      |
| `merge_pull_request`        | Merge a PR                               |
| `get_pull_request_files`    | List files changed in a PR               |
| `get_pull_request_status`   | Get CI/check status of a PR              |
| `create_pull_request_review`| Submit a PR review                       |
| `create_issue`              | Create a new issue                       |
| `get_issue`                 | Get issue details                        |
| `list_issues`               | List and filter issues                   |
| `update_issue`              | Update an issue (also works for PRs)     |
| `add_issue_comment`         | Add a comment to an issue or PR          |
| `search_code`               | Search code across repositories          |
| `search_issues`             | Search issues and PRs                    |
| `search_repositories`       | Search GitHub repositories               |
| `search_users`              | Search GitHub users                      |
| `get_file_contents`         | Read file contents from a repo           |
| `create_or_update_file`     | Create or update a file in a repo        |
| `push_files`                | Push multiple files in a single commit   |
| `create_branch`             | Create a new branch                      |
| `create_repository`         | Create a new repository                  |
| `fork_repository`           | Fork a repository                        |
| `list_commits`              | List commits on a branch                 |

---

## Adding a New MCP Server

To add another MCP server (e.g., Supabase, Slack, Linear):

1. **Find the MCP server package** on [npm](https://www.npmjs.com/search?q=modelcontextprotocol) or the [MCP servers directory](https://github.com/modelcontextprotocol/servers).

2. **Add an entry** to `.agents/mcp_config.json`:

   ```jsonc
   {
     "mcpServers": {
       "github": { /* ... existing ... */ },
       "new-server": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-new-server"],
         "env": {
           "NEW_SERVER_API_KEY": "${NEW_SERVER_API_KEY}"
         }
       }
     }
   }
   ```

3. **Add the env var** to both files:
   - `.env.example` — with an empty placeholder and a comment explaining how to get the key
   - `.env.local` — with your actual secret value

4. **Restart your IDE** to pick up the new MCP server.

5. **Document it** — add a section to this file under [Available MCP Servers](#available-mcp-servers).

---

## IDE-Specific Notes

### Google Antigravity

Antigravity automatically discovers `.agents/mcp_config.json` in your workspace root. No extra configuration needed.

- MCP tools appear as **lazy-loaded tools** in the agent's tool list.
- The agent uses `call_mcp_tool` to invoke them, or falls back to the GitHub REST API via `curl` if needed.
- After changing `mcp_config.json`, **restart the IDE** or the Antigravity session for changes to take effect.

### VS Code / GitHub Copilot

1. Copilot reads MCP config from `.vscode/mcp.json` or the workspace-level `.agents/mcp_config.json` (depending on your Copilot version).
2. If Copilot doesn't auto-detect `.agents/mcp_config.json`, copy the config:
   ```bash
   mkdir -p .vscode
   cp .agents/mcp_config.json .vscode/mcp.json
   ```
3. Reload the VS Code window (`Cmd+Shift+P` → "Reload Window").

### Cursor

Cursor reads MCP config from `.cursor/mcp.json`:

```bash
mkdir -p .cursor
cp .agents/mcp_config.json .cursor/mcp.json
```

Then restart Cursor or reload the workspace.

### Windsurf

Windsurf uses `~/.codeium/windsurf/mcp_config.json` for global config or a workspace-level file. Copy accordingly:

```bash
cp .agents/mcp_config.json ~/.codeium/windsurf/mcp_config.json
```

Or consult Windsurf docs for workspace-level MCP support.

---

## Troubleshooting

### Token not recognized / MCP server fails to start

| Symptom | Fix |
|---------|-----|
| `401 Unauthorized` errors from GitHub API | Verify your token hasn't expired. Regenerate at [github.com/settings/tokens](https://github.com/settings/tokens). |
| MCP tools not appearing in the agent | Restart your IDE after editing `mcp_config.json` or `.env.local`. |
| `npx` hangs or fails | Ensure Node.js ≥ 18 is installed. Run `npx -y @modelcontextprotocol/server-github --help` manually to test. |
| `${GITHUB_PERSONAL_ACCESS_TOKEN}` not interpolated | Your IDE may not support env interpolation from `.env.local`. Try setting the var in your shell profile (`~/.zshrc` / `~/.bashrc`) instead. |
| `EACCES` or permission errors | Run `npm cache clean --force` and retry, or check file permissions on `node_modules`. |

### Manual verification

You can test the GitHub MCP server standalone:

```bash
# Export the token in your current shell
export GITHUB_PERSONAL_ACCESS_TOKEN=$(grep GITHUB_PERSONAL_ACCESS_TOKEN .env.local | cut -d= -f2)

# Start the server manually (it communicates over stdio)
npx -y @modelcontextprotocol/server-github
```

If it starts without errors, the server is working. Press `Ctrl+C` to stop.

---

## Security

> [!IMPORTANT]
> Follow these rules to keep credentials safe.

| Rule | Details |
|------|---------|
| **Never commit tokens** | `.env*` is git-ignored (except `.env.example`). Always double-check with `git diff --cached` before committing. |
| **Use minimal scopes** | Only grant the GitHub token the scopes listed above. Avoid `admin:*` scopes. |
| **Rotate tokens regularly** | Set a 90-day expiration and rotate proactively. |
| **No hardcoded secrets in config** | The `mcp_config.json` uses `${VAR}` interpolation — never paste raw tokens into it. |
| **Audit tracked files** | Run `git grep -i "ghp_\|github.*token" -- ':!*.md'` to ensure no tokens leaked into tracked files. |
