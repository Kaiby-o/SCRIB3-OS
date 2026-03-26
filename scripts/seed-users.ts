/**
 * SCRIB3-OS User Seed Script
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as env vars
 *     (service role key bypasses RLS — never expose to client)
 *   - You'll be prompted for passwords interactively
 *
 * This script:
 *   1. Creates auth users via Supabase Admin API
 *   2. Upserts profile rows with role assignments
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Example:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-users.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedUser {
  email: string;
  display_name: string;
  role: string;
}

const SEED_USERS: SeedUser[] = [
  { email: 'ben.lydiat@scrib3.co', display_name: 'Ben Lydiat', role: 'admin' },
  { email: 'sixtyne@scrib3.co', display_name: 'Sixtyne Perez', role: 'csuite' },
  { email: 'ck@scrib3.co', display_name: 'CK', role: 'team' },
  { email: 'nick@scrib3.co', display_name: 'Nick Mitchell', role: 'csuite' },
];

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function seedUser(user: SeedUser, password: string) {
  console.log(`\n→ Seeding ${user.display_name} (${user.email}) as ${user.role}...`);

  // Create auth user (or skip if exists)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: { display_name: user.display_name, role: user.role },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log(`  ⚡ Auth user already exists — updating profile only`);
      // Fetch existing user
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email === user.email);
      if (existing) {
        await upsertProfile(existing.id, user);
      }
      return;
    }
    console.error(`  ✗ Auth error: ${authError.message}`);
    return;
  }

  if (!authData.user) {
    console.error(`  ✗ No user returned`);
    return;
  }

  console.log(`  ✓ Auth user created: ${authData.user.id}`);
  await upsertProfile(authData.user.id, user);
}

async function upsertProfile(userId: string, user: SeedUser) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      xp: 0,
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.error(`  ✗ Profile upsert error: ${error.message}`);
  } else {
    console.log(`  ✓ Profile upserted with role: ${user.role}`);
  }
}

async function main() {
  console.log('=== SCRIB3-OS User Seed ===\n');
  console.log('Users to seed:');
  SEED_USERS.forEach((u) => console.log(`  • ${u.display_name} <${u.email}> — ${u.role}`));

  // First check if profiles table has the role column
  console.log('\nChecking profiles table schema...');
  const { error: schemaError } = await supabase.from('profiles').select('role').limit(1);
  if (schemaError && schemaError.message.includes('role')) {
    console.log('\n⚠️  The "role" column may not exist on the profiles table.');
    console.log('Run this SQL in Supabase Dashboard → SQL Editor:\n');
    console.log(`  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'team'`);
    console.log(`    CHECK (role IN ('admin', 'team', 'csuite', 'client', 'vendor'));`);
    console.log(`  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;`);
    console.log(`  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;\n`);
    const cont = await prompt('Continue anyway? (y/n): ');
    if (cont.toLowerCase() !== 'y') process.exit(0);
  } else {
    console.log('  ✓ profiles.role column exists');
  }

  // Get a shared password or per-user passwords
  const mode = await prompt('\nUse the same password for all users? (y/n): ');

  if (mode.toLowerCase() === 'y') {
    const password = await prompt('Enter shared password: ');
    for (const user of SEED_USERS) {
      await seedUser(user, password);
    }
  } else {
    for (const user of SEED_USERS) {
      const password = await prompt(`Password for ${user.display_name}: `);
      await seedUser(user, password);
    }
  }

  console.log('\n=== Seed complete ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
