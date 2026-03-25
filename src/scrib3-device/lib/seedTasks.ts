import { supabase } from './supabase';

const PROJECT_ID = '00000000-0000-0000-0000-000000000002';

const SEED_TASKS = [
  { title: 'DESIGN SYSTEM — VARIABLES & TOKENS',     status: 'complete',    due_date: '2026-03-01' },
  { title: 'CRT SCREEN EFFECT STACK',               status: 'complete',    due_date: '2026-03-05' },
  { title: 'DEVICE SHELL — CHASSIS + CHROME',       status: 'complete',    due_date: '2026-03-08' },
  { title: 'AUTH — DATA MODULE CARD',               status: 'complete',    due_date: '2026-03-10' },
  { title: 'CARTRIDGE INSERT ANIMATION',            status: 'review',      due_date: '2026-03-14' },
  { title: 'BOOT SEQUENCE — TYPEWRITER TERMINAL',   status: 'review',      due_date: '2026-03-14' },
  { title: 'MODULE EXPANSION SYSTEM — MOD-01',      status: 'in_progress', due_date: '2026-03-18' },
  { title: 'TASK KANBAN — SUPABASE INTEGRATION',    status: 'in_progress', due_date: '2026-03-20' },
  { title: 'XP + GAMIFICATION ENGINE',              status: 'open',        due_date: '2026-03-25' },
  { title: 'FILE DELIVERY MODULE — MOD-02',         status: 'open',        due_date: '2026-04-01' },
  { title: 'REALTIME SUBSCRIPTIONS WIRING',         status: 'open',        due_date: '2026-04-05' },
  { title: 'COMMS MODULE — MOD-04 (TEAM ONLY)',     status: 'open',        due_date: '2026-04-10' },
];

export async function seedTasksIfEmpty(): Promise<void> {
  try {
    // Step 1: Check if any tasks exist for this project
    const { data: existing, error: checkErr } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', PROJECT_ID)
      .limit(1);

    if (checkErr) {
      console.warn('[seed] Cannot read tasks table:', checkErr.code, checkErr.message);
      // Try without filter to confirm table access
      const { error: noFilterErr } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);
      console.warn('[seed] Without project_id filter:', noFilterErr?.message ?? 'OK (table accessible)');
      return;
    }

    if (existing && existing.length > 0) {
      console.log('[seed] Tasks already seeded, skipping.');
      return;
    }

    // Step 2: Insert seed rows
    console.log('[seed] Inserting', SEED_TASKS.length, 'tasks...');
    const rows = SEED_TASKS.map(t => ({
      project_id: PROJECT_ID,
      title: t.title,
      status: t.status,
      due_date: t.due_date,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from('tasks')
      .insert(rows)
      .select('id');

    if (insertErr) {
      console.error('[seed] Insert failed:', insertErr.code, insertErr.message);
      console.error('[seed] Hint:', insertErr.hint ?? 'none');
    } else {
      console.log('[seed] Seeded', inserted?.length, 'tasks successfully.');
    }
  } catch (e) {
    console.error('[seed] Unexpected error:', e);
  }
}
