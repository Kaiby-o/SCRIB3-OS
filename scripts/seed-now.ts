/**
 * Non-interactive seed script — runs immediately with SEED_PASSWORD env var
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.SEED_PASSWORD || 'Scrib3Dev2026!';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: 'ben.lydiat@scrib3.co', display_name: 'Ben Lydiatt', role: 'admin' },
  { email: 'sixtyne@scrib3.co', display_name: 'Sixtyne Perez', role: 'csuite' },
  { email: 'ck@scrib3.co', display_name: 'CK', role: 'team' },
  { email: 'nick@scrib3.co', display_name: 'Nick Mitchell', role: 'csuite' },
];

async function seed() {
  for (const user of USERS) {
    console.log(`→ ${user.display_name} (${user.email}) as ${user.role}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: user.display_name, role: user.role },
    });

    let userId: string;
    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('  ⚡ Already exists — updating profile');
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === user.email);
        if (!existing) { console.error('  ✗ Cannot find existing user'); continue; }
        userId = existing.id;
      } else {
        console.error(`  ✗ ${error.message}`);
        continue;
      }
    } else {
      userId = data.user!.id;
      console.log(`  ✓ Auth created: ${userId}`);
    }

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      xp: 0,
    }, { onConflict: 'id' });

    if (profileErr) console.error(`  ✗ Profile: ${profileErr.message}`);
    else console.log(`  ✓ Profile upserted`);
  }
  console.log('\nDone.');
}

seed().catch(console.error);
