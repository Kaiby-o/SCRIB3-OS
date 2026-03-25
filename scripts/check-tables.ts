import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

async function check() {
  const { data, error } = await sb.from('profiles').select('id, role, display_name, email').limit(5);
  console.log('=== Profiles ===');
  if (error) console.log('Error:', error.message);
  else console.log(JSON.stringify(data, null, 2));

  for (const table of ['projects', 'project_members', 'tasks']) {
    const r = await sb.from(table).select('*').limit(1);
    console.log(`${table}: ${r.error ? 'NOT FOUND — ' + r.error.code : 'EXISTS'}`);
  }
}

check();
