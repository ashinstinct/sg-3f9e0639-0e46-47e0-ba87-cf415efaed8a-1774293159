#!/usr/bin/env node

/**
 * claude install-skill <github-url>
 *
 * Installs a Claude Code skill from a GitHub URL into ~/.claude/skills/.
 *
 * Supported URL formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/tree/branch/path/to/skill-dir
 *   https://github.com/owner/repo/blob/branch/path/to/SKILL.md
 *   https://raw.githubusercontent.com/owner/repo/branch/path/to/SKILL.md
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseGitHubUrl(url) {
  const blobPattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/;
  const treePattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/;
  const rootPattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/;
  const rawPattern = /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/;

  let match;

  if ((match = url.match(blobPattern))) {
    const [, owner, repo, branch, filePath] = match;
    return { owner, repo, branch, filePath, skillDir: dirName(filePath) };
  }

  if ((match = url.match(treePattern))) {
    const [, owner, repo, branch, dirPath] = match;
    return { owner, repo, branch, filePath: `${dirPath}/SKILL.md`, skillDir: baseName(dirPath) };
  }

  if ((match = url.match(rootPattern))) {
    const [, owner, repo] = match;
    return { owner, repo, branch: 'main', filePath: 'SKILL.md', skillDir: repo };
  }

  if ((match = url.match(rawPattern))) {
    const [, owner, repo, branch, filePath] = match;
    return { owner, repo, branch, filePath, skillDir: dirName(filePath) };
  }

  return null;
}

function baseName(p) {
  return p.split('/').filter(Boolean).at(-1) ?? p;
}

function dirName(p) {
  const parts = p.split('/').filter(Boolean);
  return parts.length > 1 ? parts.at(-2) : parts.at(-1) ?? p;
}

function toRawUrl({ owner, repo, branch, filePath }) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1].split('\n')
      .map(line => {
        const idx = line.indexOf(':');
        return idx > 0 ? [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] : null;
      })
      .filter(Boolean)
  );
}

async function installSkill(githubUrl) {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    console.error('Error: Unrecognized GitHub URL format.');
    console.error('');
    console.error('Supported formats:');
    console.error('  https://github.com/owner/repo');
    console.error('  https://github.com/owner/repo/tree/branch/path/to/skill-dir');
    console.error('  https://github.com/owner/repo/blob/branch/path/to/SKILL.md');
    console.error('  https://raw.githubusercontent.com/owner/repo/branch/path/to/SKILL.md');
    process.exit(1);
  }

  let content;
  const primaryUrl = toRawUrl(parsed);

  try {
    process.stdout.write(`Fetching ${primaryUrl} ... `);
    content = await fetchText(primaryUrl);
    console.log('ok');
  } catch {
    // Try the other default branch name (main <-> master)
    const fallbackBranch = parsed.branch === 'main' ? 'master' : 'main';
    const fallbackUrl = toRawUrl({ ...parsed, branch: fallbackBranch });
    try {
      process.stdout.write(`\nRetrying with branch '${fallbackBranch}': ${fallbackUrl} ... `);
      content = await fetchText(fallbackUrl);
      console.log('ok');
    } catch (err) {
      console.error(`\nError: Could not fetch SKILL.md — ${err.message}`);
      process.exit(1);
    }
  }

  const frontmatter = parseFrontmatter(content);
  const skillName = frontmatter.name || parsed.skillDir;

  // Install to ~/.claude/skills/ (active this session)
  const globalSkillDir = join(homedir(), '.claude', 'skills', skillName);
  await mkdir(globalSkillDir, { recursive: true });
  await writeFile(join(globalSkillDir, 'SKILL.md'), content, 'utf8');

  // Save to .claude/skills/ in the project repo (restored on each new session by SessionStart hook)
  const projectSkillDir = join(PROJECT_ROOT, '.claude', 'skills', skillName);
  await mkdir(projectSkillDir, { recursive: true });
  await writeFile(join(projectSkillDir, 'SKILL.md'), content, 'utf8');

  console.log(`\nSkill installed successfully!`);
  console.log(`  Name:        ${skillName}`);
  if (frontmatter.description) {
    console.log(`  Description: ${frontmatter.description}`);
  }
  console.log(`  Active:      ${globalSkillDir}/SKILL.md`);
  console.log(`  Persisted:   ${projectSkillDir}/SKILL.md`);
  console.log(`\nThis skill will be restored automatically on each new session.`);
}

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/install-skill.js <github-url>');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/install-skill.js https://github.com/owner/repo');
  console.error('  node scripts/install-skill.js https://github.com/owner/repo/tree/main/skills/my-skill');
  console.error('  node scripts/install-skill.js https://github.com/owner/repo/blob/main/SKILL.md');
  process.exit(1);
}

installSkill(url).catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
