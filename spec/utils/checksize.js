#!/usr/bin/env node
const { exec } = require('child_process');
const limit = 5000;
exec('du -k --total browser/*', (err, stdout) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const lines = stdout.split('\n');
  const entries = {};
  lines.forEach((line) => {
    if (!line.length) {
      return;
    }
    const [kb, entry] = line.split('\t');
    entries[entry] = parseInt(kb);
  });
  if (entries.total < limit) {
    console.log(`Total size for build is ${entries.total}kb, below ${limit}kb`);
    process.exit(0);
  }
  Object.keys(entries).forEach((entry) => {
    if (entry === 'total') {
      return;
    }
    console.log(`Size of ${entry} is ${entries[entry]}kb`);
  });
  console.log(`Total size for build is ${entries.total}kb, above ${limit}kb`);
  process.exit(1);
});
