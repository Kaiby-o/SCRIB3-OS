import { useEffect, useState } from 'react';
import styles from './TaskModule.module.css';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth.store';

const PROJECT_ID = '00000000-0000-0000-0000-000000000002';

type TaskStatus = 'open' | 'in_progress' | 'review' | 'complete';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  xp_value: number | null;
  assigned_to: string | null;
  operator_handle: string | null; // resolved from profiles join
}

const STATUS_CYCLE: TaskStatus[] = ['open', 'in_progress', 'review', 'complete'];
const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'open',        label: 'OPEN' },
  { key: 'in_progress', label: 'IN_PROGRESS' },
  { key: 'review',      label: 'REVIEW' },
  { key: 'complete',    label: 'COMPLETE' },
];

function getDaysCountdown(dueDate: string | null): string {
  if (!dueDate) return '';
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return `T+${Math.abs(diff)} DAYS`;
  if (diff === 0) return 'DUE TODAY';
  return `T-${diff} DAYS`;
}

function isLate(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

function formatHandle(uuid: string | null): string | null {
  if (!uuid) return null;
  return `OPR-${uuid.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export default function TaskModule() {
  const { role, user } = useAuthStore();
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (role === 'CLIENT') return;
    fetchTasks();
  }, [user, role]);

  const fetchTasks = async () => {
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, due_date, xp_value, assigned_to')
      .eq('project_id', PROJECT_ID);

    console.log('[TaskModule] fetch:', { rowCount: data?.length, error });

    if (error) {
      console.error('[TaskModule] error:', error.code, error.message);
      setFetchError(`${error.code}: ${error.message}`);
    } else {
      const rows = (data ?? []) as Omit<Task, 'operator_handle'>[];
      setTasks(rows.map(r => ({ ...r, operator_handle: formatHandle(r.assigned_to) })));
    }

    setLoading(false);
  };

  const cycleStatus = async (task: Task) => {
    const nextStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(task.status) + 1) % STATUS_CYCLE.length];
    // Optimistic
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus })
      .eq('id', task.id);
    if (error) {
      console.error('[TaskModule] update error:', error);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  // ── Render states ──────────────────────────────────────────────

  if (role === 'CLIENT') {
    return (
      <div className={styles.container}>
        <div className={styles.restricted}>
          <div className={styles.restrictedText}>
            ACCESS RESTRICTED — CLEARANCE LEVEL INSUFFICIENT
            <span className={styles.restrictedCursor}>█</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (loading && tasks.length === 0)) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>LOADING TASKS...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div className={styles.restricted}>
          <div className={styles.restrictedText} style={{ fontSize: '11px', lineHeight: '1.6' }}>
            FETCH ERROR<br />{fetchError}
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>NO TASKS FOUND — SEEDING...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className={styles.column}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{col.label}</span>
                <span className={styles.countBadge}>{colTasks.length}</span>
              </div>
              <div className={styles.taskList}>
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={styles.taskCard}
                    onClick={() => cycleStatus(task)}
                    data-task-id={task.id}
                    title="CLICK TO ADVANCE STATUS"
                  >
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskMeta}>
                      <span className={`${styles.taskDue} ${isLate(task.due_date) ? styles.taskDueLate : ''}`}>
                        {getDaysCountdown(task.due_date)}
                      </span>
                      <div className={styles.statusDot} />
                    </div>
                    {task.operator_handle && (
                      <div className={styles.taskAssignee}>{task.operator_handle}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
