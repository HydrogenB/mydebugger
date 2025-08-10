#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = process.cwd();
const TOOLS_DIR = path.join(ROOT_DIR, 'src', 'tools');

async function getToolsToMigrate() {
  const tools = [
    'clickjacking',
    'csvtomd',
    'deep-link-chain',
    'device-trace',
    'dynamic-link-probe',
    'fetch-render',
    'generate-large-image',
    'header-scanner',
    'headers',
    'image-compressor',
    'json-converter',
    'jwt',
    'jwtplayground',
    'linktracer',
    'metadata-echo',
    'networksuit',
    'pentest',
    'permission-tester',
    'pre-rendering-tester',
    'push-tester',
    'qrcode',
    'qrscan',
    'regex',
    'stayawake',
    'storage-sync',
    'thong-thai',
    'url',
    'virtual-card'
  ];

  // Check which tools still need migration
  const needsMigration = [];
  
  for (const tool of tools) {
    const toolPath = path.join(TOOLS_DIR, tool);
    const hasComponents = await pathExists(path.join(toolPath, 'components'));
    const hasHooks = await pathExists(path.join(toolPath, 'hooks'));
    
    if (!hasComponents || !hasHooks) {
      needsMigration.push(tool);
    }
  }
  
  return needsMigration;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function migrateTools(tools) {
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const tool of tools) {
    try {
      console.log(`\n=== Migrating ${tool} ===`);
      execSync(`node scripts/migrate-mvvm-to-feature.mjs --tool ${tool} --write`, {
        stdio: 'inherit',
        cwd: ROOT_DIR
      });
      results.success.push(tool);
    } catch (error) {
      console.error(`Error migrating ${tool}:`, error.message);
      results.failed.push(tool);
    }
  }

  return results;
}

async function main() {
  console.log('Preparing to migrate all tools...');
  
  const toolsToMigrate = await getToolsToMigrate();
  
  if (toolsToMigrate.length === 0) {
    console.log('All tools have already been migrated!');
    return;
  }

  console.log(`\nFound ${toolsToMigrate.length} tools to migrate:`);
  console.log(toolsToMigrate.join(', '));
  
  console.log('\nStarting migration process...');
  const results = await migrateTools(toolsToMigrate);
  
  console.log('\n=== Migration Summary ===');
  console.log(`Successfully migrated: ${results.success.length} tools`);
  console.log(`Failed to migrate: ${results.failed.length} tools`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed tools:');
    console.log(results.failed.join(', '));
  }
  
  console.log('\nMigration complete!');
}

main().catch(console.error);
