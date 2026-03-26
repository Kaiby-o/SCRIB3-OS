import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Generic Supabase data-fetching hook                                */
/*  Usage: const { data, loading } = useSupabase('profiles', '*')      */
/* ------------------------------------------------------------------ */

export function useSupabaseQuery<T>(
  table: string,
  select: string = '*',
  filters?: { column: string; value: string | boolean | number }[],
  orderBy?: { column: string; ascending?: boolean },
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let query = supabase.from(table).select(select);

      if (filters) {
        for (const f of filters) {
          query = query.eq(f.column, f.value);
        }
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: result, error: err } = await query;

      if (!cancelled) {
        if (err) {
          console.warn(`[useSupabaseQuery] ${table}:`, err.message);
          setError(err.message);
        } else {
          setData((result ?? []) as T[]);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy)]);

  return { data, loading, error };
}

/* Single row fetch */
export function useSupabaseRow<T>(
  table: string,
  column: string,
  value: string,
  select: string = '*',
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!value) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data: result, error } = await supabase
        .from(table)
        .select(select)
        .eq(column, value)
        .single();

      if (!cancelled) {
        if (error) console.warn(`[useSupabaseRow] ${table}:`, error.message);
        setData(result as T | null);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [table, column, value, select]);

  return { data, loading };
}

/* Insert helper */
export async function supabaseInsert<T extends Record<string, unknown>>(
  table: string,
  row: T,
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) {
    console.error(`[supabaseInsert] ${table}:`, error.message);
    return { data: null, error: error.message };
  }
  return { data: data as T, error: null };
}
