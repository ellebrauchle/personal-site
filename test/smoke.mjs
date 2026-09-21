// test/smoke.mjs — the safety checks, run against a site that is already running.
//
//   node test/smoke.mjs http://localhost:3000
//   node test/smoke.mjs https://your-site.vercel.app
//
// It asks the server for the files a visitor must never see, sends it rubbish, and floods it,
// and it checks that no reply anywhere contains your key. It does NOT call Parley, so it costs
// nothing — but it DOES use up the request cap on purpose: for a made-up visitor when you run it
// locally, for your own address once deployed (Vercel overwrites the forwarded address), so after
// a deployed run expect "429 slow down" from your own questions for up to ten minutes.
//
// Run the four tests first, or restart the server afterwards.

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = new URL((process.argv[2] || 'http://localhost:3000').replace(/\/+$/, ''));
const local = base.hostname === 'localhost' || base.hostname === '127.0.0.1';
const here = path.dirname(fileURLToPath(import.meta.url));

// If there is a .env.local next to dev.js, we check that its key never appears in a reply.
// The key is only ever compared, never printed.
let secret = '';
try {
  const text = fs.readFileSync(path.join(here, '..', '.env.local'), 'utf8').replace(/^﻿/, '');
  const match = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith('PARLEY_API_KEY='));
  if (match) secret = match.slice('PARLEY_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
} catch (err) {
  // no .env.local: we still check for the generic key prefix below
}

// A raw request, so that paths like /../package.json reach the server exactly as written
// (fetch would tidy them up before they ever left the machine).
function request(method, rawPath, body, headers) {
  const transport = base.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request({
      protocol: base.protocol,
      hostname: base.hostname,
      port: base.port || (base.protocol === 'https:' ? 443 : 80),
      method,
      path: rawPath,
      headers: Object.assign({}, headers, body ? { 'content-type': 'application/json' } : {}),
    }, (res) => {
      const parts = [];
      res.on('data', (p) => parts.push(p));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(parts).toString('utf8') }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const results = [];
const bodies = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : ''));
}

// Deployed, /api/chat.js is not a file but the function's own route, so Vercel may answer 405
// instead of 404, and Vercel's edge refuses paths containing ".." with 400 before any route or
// function runs (locally dev.js answers 404). Either is fine: nothing is served.
const PRIVATE_PATHS = [
  ['/.env.local', [404]],
  ['/api/chat.js', [404, 405]],
  ['/knowledge/profile.md', [404]],
  ['/knowledge/boundaries.md', [404]],
  ['/knowledge-sample/profile.md', [404]],
  ['/dev.js', [404]],
  ['/../package.json', [400, 404]],
  ['/%2e%2e/package.json', [400, 404]],
];

const run = async () => {
  console.log('Smoke test against ' + base.origin + '\n');

  for (const [p, allowed] of PRIVATE_PATHS) {
    const res = await request('GET', p);
    bodies.push(res.body);
    check(allowed.join(' or ') + ' for ' + p, allowed.includes(res.status), 'got ' + res.status);
  }

  const bad = await request('POST', '/api/chat', '{"question": "hello"', {});
  bodies.push(bad.body);
  check('400 for malformed JSON', bad.status === 400, 'got ' + bad.status);

  const huge = await request('POST', '/api/chat', JSON.stringify({ question: 'a'.repeat(10 * 1024), history: [] }), {});
  bodies.push(huge.body);
  check('400 for a 10 kB question', huge.status === 400, 'got ' + huge.status);

  // Twenty-five requests from one visitor. A made-up forwarded address keeps this burst from
  // using up your own allowance locally (deployed, the edge overwrites it and the burst counts
  // against you), and the bodies are invalid on purpose so nothing reaches Parley.
  const flood = { 'x-forwarded-for': '203.0.113.7' };
  let tooMany = 0;
  for (let i = 0; i < 25; i += 1) {
    const res = await request('POST', '/api/chat', '{"question":""}', flood);
    bodies.push(res.body);
    if (res.status === 429) tooMany += 1;
  }
  if (tooMany > 0 || local) {
    check('429 after 25 rapid requests', tooMany > 0, tooMany + ' of 25 were refused');
  } else {
    // The counters live in memory inside one running copy of the function. Vercel runs several
    // and cold-starts them, so a burst can be spread thin. Your budget cap is the real limit.
    console.log('WARN  429 after 25 rapid requests  (none refused — deployed counters are per-instance)');
  }

  const leaked = bodies.filter((b) => /sk-parley/i.test(b) || (secret.length > 8 && b.includes(secret)));
  check('no reply contained the key', leaked.length === 0, leaked.length + ' replies matched');

  const failures = results.filter((r) => !r.ok).length;
  console.log('\n' + (failures === 0 ? 'All smoke checks passed.' : failures + ' smoke checks failed.'));
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.log('FAIL  could not reach ' + base.origin + ' (' + err.code + ')');
  process.exit(1);
});
