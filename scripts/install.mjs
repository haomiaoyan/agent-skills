#!/usr/bin/env node
/**
 * 安装 / 校验 / 列举本仓库的技能。
 *
 *   node scripts/install.mjs --list
 *   node scripts/install.mjs                      # 复制安装到默认目录
 *   node scripts/install.mjs --dest <dir>         # 指定目标目录
 *   node scripts/install.mjs --link               # 用符号链接（改仓库即生效，需权限）
 *   node scripts/install.mjs --only a,b           # 只装指定技能
 *   node scripts/install.mjs --force              # 覆盖已存在的同名技能
 *   node scripts/install.mjs --validate           # 只校验，不安装
 *
 * 目标目录默认：Windows = %USERPROFILE%\.agents\skills，其它 = ~/.agents/skills
 * （.agents/skills 是跨运行时的通用技能目录；若你的运行时只认 ~/.claude/skills，
 *  用 --dest 指过去即可。）
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync, rmSync, symlinkSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const THIRD_PARTY_DIR = join(ROOT, 'third-party');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};

const ok = (m) => console.log(`  ✓ ${m}`);
const warn = (m) => console.log(`  ! ${m}`);
const fail = (m) => console.log(`  ✗ ${m}`);

/** 解析 YAML frontmatter（只取本仓库用到的标量字段，不引入依赖） */
function parseFrontmatter(text) {
  // Windows 编辑器（PS 5.1 的 Set-Content -Encoding UTF8 等）会写 BOM，
  // 带 BOM 时 `^---` 匹配失败、frontmatter 整个失效，必须先剥掉。
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(clean);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      let v = kv[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[kv[1]] = v;
      continue;
    }
    const nested = /^\s{2,}([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (nested) {
      let v = nested[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[nested[1]] = v;
    }
  }
  return out;
}

function listSkillDirs() {
  return scanSkillDirs().map((e) => e.name);
}

/**
 * 扫描自有技能与第三方技能，返回 [{ name, dir, origin }]。
 * - skills/<name>/                       → origin: 'own'
 * - third-party/<vendor>/skills/<name>/  → origin: 'third-party'
 * 同名时自有优先（安装到目标目录会发生冲突，第三方先被跳过并告警）。
 */
function scanSkillDirs() {
  const out = [];
  const seen = new Set();

  const push = (name, dir, origin) => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ name, dir, origin });
  };

  if (existsSync(SKILLS_DIR)) {
    readdirSync(SKILLS_DIR)
      .filter((d) => statSync(join(SKILLS_DIR, d)).isDirectory())
      .sort()
      .forEach((d) => push(d, join(SKILLS_DIR, d), 'own'));
  }

  if (existsSync(THIRD_PARTY_DIR)) {
    readdirSync(THIRD_PARTY_DIR)
      .map((v) => join(THIRD_PARTY_DIR, v, 'skills'))
      .filter((p) => existsSync(p))
      .sort()
      .forEach((vendorSkills) => {
        readdirSync(vendorSkills)
          .filter((d) => statSync(join(vendorSkills, d)).isDirectory())
          .sort()
          .forEach((d) => push(d, join(vendorSkills, d), 'third-party'));
      });
  }

  return out;
}

/** 校验单个技能，返回 { name, description, problems[], warnings[] } */
function checkSkill(dirName, dir = join(SKILLS_DIR, dirName)) {
  const skillMd = join(dir, 'SKILL.md');
  const problems = [];
  const warnings = [];

  if (!existsSync(skillMd)) {
    problems.push('缺少 SKILL.md');
    return { name: dirName, description: '', problems, warnings };
  }

  const text = readFileSync(skillMd, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) {
    warnings.push('SKILL.md 带 UTF-8 BOM（已容忍，但建议去掉：部分运行时解析 frontmatter 会失败）');
  }
  const fm = parseFrontmatter(text);

  if (!fm) problems.push('SKILL.md 开头没有 --- frontmatter ---');
  else {
    if (!fm.name) problems.push('frontmatter 缺 name');
    else {
      if (fm.name !== dirName) problems.push(`name (${fm.name}) 与目录名 (${dirName}) 不一致`);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) problems.push(`name 只能含小写字母/数字/连字符：${fm.name}`);
    }
    if (!fm.description) problems.push('frontmatter 缺 description');
    else {
      if (fm.description.length > 1024) problems.push(`description 超长 ${fm.description.length} > 1024`);
      if (!/^Use when|^[用当]/.test(fm.description)) warnings.push('description 建议以 "Use when…" 开头（便于按场景检索）');
    }
    if (!fm.license) warnings.push('frontmatter 缺 license');
  }

  // 引用的相对文件是否存在（只检查 `references/` 与 `assets/` 下的裸路径引用）
  const refs = [...text.matchAll(/`((?:references|assets)\/[^`\s]+)`/g)].map((m) => m[1]);
  for (const r of new Set(refs)) {
    if (!existsSync(join(dir, r))) problems.push(`引用了不存在的文件：${r}`);
  }

  return { name: fm?.name || dirName, description: fm?.description || '', version: fm?.version, problems, warnings };
}

function validateAll(quiet = false) {
  const entries = scanSkillDirs();
  if (!entries.length) {
    fail('skills/ 与 third-party/*/skills/ 下都没有技能目录');
    return 1;
  }
  let bad = 0;
  let warned = 0;
  for (const e of entries) {
    const r = checkSkill(e.name, e.dir);
    const tag = e.origin === 'third-party' ? '[third-party] ' : '';
    if (r.problems.length) {
      bad += 1;
      fail(`${tag}${e.name}：${r.problems.join('；')}`);
    } else if (!quiet) {
      ok(`${tag}${e.name}（description ${r.description.length} 字符）`);
    }
    // 第三方技能的 description 未以 Use when 开头属正常（原样收录，不改他人文案）
    const ws = e.origin === 'third-party' ? r.warnings.filter((w) => !w.includes('Use when')) : r.warnings;
    if (!quiet) ws.forEach((w) => warn(`${tag}${e.name}：${w}`));
    warned += ws.length;
  }
  if (bad) {
    console.log(`\n校验失败：${bad}/${entries.length} 个技能有问题`);
    return 1;
  }
  if (!quiet) {
    const own = entries.filter((e) => e.origin === 'own').length;
    console.log(`\n校验通过：${entries.length} 个技能（自有 ${own}，第三方 ${entries.length - own}）`);
  }
  return 0;
}

function defaultDest() {
  return join(os.homedir(), '.agents', 'skills');
}

function install() {
  const dest = resolve(val('--dest') || defaultDest());
  const useLink = has('--link');
  const force = has('--force');
  const only = val('--only')?.split(',').map((s) => s.trim()).filter(Boolean);

  const code = validateAll(true);
  if (code !== 0) {
    validateAll(false);
    console.log('\n存在校验问题，已中止安装。修好后再跑（或用 --validate 单独查看）。');
    return 1;
  }

  let entries = scanSkillDirs();
  if (only) {
    const missing = only.filter((n) => !entries.some((e) => e.name === n));
    if (missing.length) {
      fail(`--only 指定了不存在的技能：${missing.join(', ')}`);
      return 1;
    }
    entries = entries.filter((e) => only.includes(e.name));
  }

  mkdirSync(dest, { recursive: true });
  console.log(`安装到：${dest}${useLink ? '（符号链接模式）' : ''}\n`);

  let installed = 0;
  for (const e of entries) {
    const src = e.dir;
    const target = join(dest, e.name);
    const tag = e.origin === 'third-party' ? '[third-party] ' : '';
    if (existsSync(target)) {
      if (!force) {
        warn(`${tag}${e.name}：目标已存在，跳过（加 --force 覆盖）`);
        continue;
      }
      rmSync(target, { recursive: true, force: true });
    }
    if (useLink) {
      try {
        symlinkSync(src, target, 'junction');
      } catch (err) {
        fail(`${tag}${e.name}：建链接失败（${err.code || err.message}），改用复制`);
        cpSync(src, target, { recursive: true });
      }
    } else {
      cpSync(src, target, { recursive: true });
    }
    ok(`${tag}${e.name}${useLink ? ' → ' + src : ''}`);
    installed += 1;
  }

  console.log(`\n完成：安装 ${installed} 个，跳过 ${entries.length - installed} 个`);
  if (!useLink && installed) {
    console.log('提示：复制模式下改动本仓库不会自动同步，更新请重跑本脚本（加 --force）。');
  }
  return 0;
}

if (has('--help') || has('-h')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\*\*?/, ''));
  process.exit(0);
}

if (has('--list')) {
  for (const e of scanSkillDirs()) {
    const r = checkSkill(e.name, e.dir);
    const tag = e.origin === 'third-party' ? '[third-party] ' : '';
    console.log(`${tag}${r.name}${r.version ? ' @' + r.version : ''}`);
    console.log(`  ${r.description.slice(0, 110)}${r.description.length > 110 ? '…' : ''}\n`);
  }
  process.exit(0);
}

if (has('--validate')) process.exit(validateAll(false));
process.exit(install());
