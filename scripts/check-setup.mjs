#!/usr/bin/env node
/**
 * Practical test checklist — run before npm run dev
 * Usage: npm run check
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')
const placeholder = /^(your[_-]?api[_-]?key|your_actual_api_key_here|xxx+)$/i

let failed = 0

function pass(msg) {
  console.log(`  ✓ ${msg}`)
}
function fail(msg) {
  console.log(`  ✗ ${msg}`)
  failed++
}

console.log('\nVeil — practical test checklist\n')

const nodeMajor = Number(process.versions.node.split('.')[0])
if (nodeMajor >= 18) pass(`Node.js ${process.versions.node}`)
else fail(`Node.js ${process.versions.node} — need ≥ 18`)

if (existsSync(resolve(root, 'node_modules'))) pass('Dependencies installed (node_modules)')
else fail('Run npm install first')

let geminiKey = ''
if (existsSync(envPath)) {
  pass('.env file exists')
  const env = readFileSync(envPath, 'utf8')
  const m = env.match(/^VITE_GEMINI_API_KEY=(.*)$/m)
  geminiKey = (m?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
} else {
  fail('.env missing — run: cp .env.example .env')
}

if (geminiKey && !placeholder.test(geminiKey)) {
  pass('VITE_GEMINI_API_KEY is set (real PDF import & screening enabled)')
} else {
  fail('VITE_GEMINI_API_KEY missing or placeholder — only Demo Patients will work without AI')
}

const ctMatch = existsSync(envPath) && readFileSync(envPath, 'utf8').match(/^VITE_CT_API_BASE=(.*)$/m)
const ctBase = (ctMatch?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
if (!ctBase || ctBase.endsWith('/studies')) {
  pass('VITE_CT_API_BASE is valid (or using default /studies endpoint)')
} else if (ctBase.endsWith('/api/v2')) {
  fail('VITE_CT_API_BASE should end with /studies — app auto-fixes, but update .env for clarity')
} else {
  pass(`VITE_CT_API_BASE set (${ctBase})`)
}

console.log('\nManual browser test (after npm run dev):\n')
console.log('  1. Quiz → search "Breast Cancer" or "Type 2 Diabetes"')
console.log('  2. Matches → pick a recruiting trial')
console.log('  3. Verify → Connect wallet → Demo Patients OR upload a real PDF')
console.log('  4. DevTools → Network: expect generativelanguage.googleapis.com for AI; no Veil server')
console.log('  5. Prove → Generate Midnight proof (Compact circuits in browser)\n')

const managed = resolve(root, 'contracts/managed/eligibility/contract/index.js')
if (existsSync(managed)) pass('Compact managed contract present')
else fail('Run npm run compact to compile contracts/eligibility.compact')

if (failed > 0) {
  console.log(`${failed} check(s) failed.\n`)
  process.exit(1)
}
console.log('All automated checks passed. Start the app: npm run dev\n')
