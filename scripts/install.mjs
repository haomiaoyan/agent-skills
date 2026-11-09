#!/usr/bin/env node
/**
 * 安装 / 校验 / 列举本仓库的技能。
 *
 *   node scripts/install.mjs --list
 *   node scripts/install.mjs                      # 复制安装到默认目录
 *   node scripts/install.mjs --dest <dir>         # 指定目标目录
 *   node scripts/install.mjs --link               # 用符号链接（改仓库即生效，需权限）
 *   node scripts/install.mjs --only a,b           # 只装指定技能或分类（写分类名装整类）
 *   node scripts/install.mjs --topic a,b          # 按主题装（主题定义在 topics/catalog.json）
 *   node scripts/install.mjs --list-topics        # 列出主题与命中数
 *   node scripts/install.mjs --force              # 覆盖已存在的同名技能
 *   node scripts/install.mjs --validate           # 只校验，不安装
 *
 * 两套分类维度：skills/<阶段>/<技能>/ 是物理归档，topics/ 是主题索引。
 * 安装时一律平铺到目标目录（目标运行时认的是技能名，不认分类）。
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
const CATALOG_PATH = join(ROOT, 'topics', 'catalog.json');

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
 * 扫描自有技能与第三方技能，返回 [{ name, dir, origin, category? }]。
 * - skills/<name>/                       → origin: 'own'（兼容旧的平铺结构）
 * - skills/<category>/<name>/             → origin: 'own', category=<category>
 * - third-party/<vendor>/skills/<name>/  → origin: 'third-party'
 *
 * 判定「这是技能目录」的依据是目录内含 SKILL.md，而不是层级位置：
 * 分类目录（planning/ 等）只有 README.md，不会被误当成技能。
 * 同名时自有优先（安装到目标目录会发生冲突，第三方先被跳过并告警）。
 */
function scanSkillDirs() {
  const out = [];
  const seen = new Set();

  const push = (name, dir, origin, category) => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push(category ? { name, dir, origin, category } : { name, dir, origin });
  };

  if (existsSync(SKILLS_DIR)) {
    readdirSync(SKILLS_DIR)
      .filter((d) => statSync(join(SKILLS_DIR, d)).isDirectory())
      .sort()
      .forEach((d) => {
        const dir = join(SKILLS_DIR, d);
        if (existsSync(join(dir, 'SKILL.md'))) {
          push(d, dir, 'own');                       // 旧的平铺技能
        } else {
          // 分类目录：逐个把含 SKILL.md 的子目录登记为技能
          readdirSync(dir)
            .filter((s) => statSync(join(dir, s)).isDirectory())
            .sort()
            .forEach((s) => {
              const skillDir = join(dir, s);
              if (existsSync(join(skillDir, 'SKILL.md'))) push(s, skillDir, 'own', d);
            });
        }
      });
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

/** 读取主题索引；文件缺失或 JSON 损坏时返回 null（由调用方决定如何报错） */
function loadCatalog() {
  if (!existsSync(CATALOG_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * 校验主题索引一致性：
 * - slug 必须与 topics/<slug>/README.md 对应
 * - 引用的技能名必须真实存在（防止写错名字或指向已删除的技能）
 * 返回错误数组，空表示一致。
 */
function validateCatalog(entries) {
  const problems = [];
  const catalog = loadCatalog();
  if (!catalog) {
    problems.push(`主题索引缺失或损坏：topics/catalog.json`);
    return { problems, catalog: null };
  }
  const known = new Set(entries.map((e) => e.name));
  const seenSlugs = new Set();
  for (const t of catalog.topics || []) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug || '')) {
      problems.push(`主题 slug 格式不合法：${t.slug}`);
    }
    if (seenSlugs.has(t.slug)) problems.push(`主题 slug 重复：${t.slug}`);
    seenSlugs.add(t.slug);
    if (!existsSync(join(ROOT, 'topics', t.slug, 'README.md'))) {
      problems.push(`主题 ${t.slug} 缺少 topics/${t.slug}/README.md`);
    }
    for (const name of t.skills || []) {
      if (!known.has(name)) problems.push(`主题 ${t.slug} 引用了不存在的技能：${name}`);
    }
  }
  return { problems, catalog };
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
    const tag = e.origin === 'third-party' ? '[third-party] ' : e.category ? `[${e.category}] ` : '';
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
  const cat = validateCatalog(entries);
  for (const p of cat.problems) {
    bad += 1;
    fail(`[catalog] ${p}`);
  }
  if (bad) {
    console.log(`\n校验失败：${bad} 项问题`);
    return 1;
  }
  if (!quiet) {
    const own = entries.filter((e) => e.origin === 'own').length;
    const topicCount = cat.catalog?.topics?.length ?? 0;
    console.log(`\n校验通过：${entries.length} 个技能（自有 ${own}，第三方 ${entries.length - own}），${topicCount} 个主题`);
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
  const topics = val('--topic')?.split(',').map((s) => s.trim()).filter(Boolean);
  const catalog = loadCatalog();

  const code = validateAll(true);
  if (code !== 0) {
    validateAll(false);
    console.log('\n存在校验问题，已中止安装。修好后再跑（或用 --validate 单独查看）。');
    return 1;
  }

  let entries = scanSkillDirs();

  // --topic：按主题筛（与 --only 取交集）
  if (topics) {
    const bySlug = new Map((catalog?.topics || []).map((t) => [t.slug, t]));
    const missing = topics.filter((t) => !bySlug.has(t));
    if (missing.length) {
      fail(`--topic 指定了不存在的主题：${missing.join(', ')}（用 --list-topics 查看）`);
      return 1;
    }
    const wanted = new Set(topics.flatMap((t) => bySlug.get(t).skills || []));
    if (wanted.size === 0) {
      console.log(`主题 ${topics.join(', ')} 当前没有收录任何技能，无需安装。`);
      return 0;
    }
    entries = entries.filter((e) => wanted.has(e.name));
  }

  if (only) {
    // --only 既能写技能名，也能写分类名（一次装整类）
    const knownCategories = new Set(entries.map((e) => e.category).filter(Boolean));
    const missing = only.filter(
      (n) => !entries.some((e) => e.name === n || e.category === n) && !knownCategories.has(n),
    );
    if (missing.length) {
      fail(`--only 指定了不存在的技能或分类：${missing.join(', ')}`);
      return 1;
    }
    entries = entries.filter((e) => only.includes(e.name) || (e.category && only.includes(e.category)));
  }

  mkdirSync(dest, { recursive: true });
  console.log(`安装到：${dest}${useLink ? '（符号链接模式）' : ''}\n`);

  let installed = 0;
  for (const e of entries) {
    const src = e.dir;
    const target = join(dest, e.name);
    const tag = e.origin === 'third-party' ? '[third-party] ' : e.category ? `[${e.category}] ` : '';
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
    const tag = e.origin === 'third-party' ? '[third-party] ' : e.category ? `[${e.category}] ` : '';
    console.log(`${tag}${r.name}${r.version ? ' @' + r.version : ''}`);
    console.log(`  ${r.description.slice(0, 110)}${r.description.length > 110 ? '…' : ''}\n`);
  }
  process.exit(0);
}

if (has('--list-topics')) {
  const catalog = loadCatalog();
  if (!catalog) {
    fail('主题索引缺失或损坏：topics/catalog.json');
    process.exit(1);
  }
  const entries = scanSkillDirs();
  const known = new Set(entries.map((e) => e.name));
  for (const t of catalog.topics || []) {
    const hit = (t.skills || []).filter((n) => known.has(n)).length;
    console.log(`${t.slug.padEnd(14)} ${t.name}  —  ${hit} 个技能`);
    console.log(`  ${t.description}`);
    console.log(`  ${(t.skills || []).join(', ') || '（当前为空）'}\n`);
  }
  process.exit(0);
}

if (has('--validate')) process.exit(validateAll(false));
process.exit(install());
