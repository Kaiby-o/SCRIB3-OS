# SKILL-REALTIME-PATTERNS.md — Supabase Realtime Architecture
**Expertise Level:** Expert  
**Domain:** Supabase Realtime, WebSocket channel design, multi-role broadcast filtering, optimistic UI, React integration  
**Context:** SCRIB3-OS — multi-role project management platform  

---

## CORE PHILOSOPHY

Realtime is not a feature to bolt on. For SCRIB3-OS, it's the core collaborative contract: when a TEAM member marks a task complete, the CLIENT milestone bar updates before the meeting ends. When a file is approved, the CONTRACTOR knows immediately without refreshing.

The architecture must: (1) ensure each role only receives events relevant to their access level, (2) be resilient to connection drops without data staleness, (3) handle optimistic UI gracefully when the server corrects state.

---

## 1. CHANNEL ARCHITECTURE

### 1.1 Channel Map

```
CHANNEL STRUCTURE
─────────────────
project:{project_id}:tasks          → Task CRUD events (filtered by role RLS)
project:{project_id}:milestones     → Milestone status/progress changes
project:{project_id}:approvals      → Approval workflow state changes
project:{project_id}:files          → New file uploads (visibility-filtered)
global:leaderboard                  → XP rank changes (TEAM only)
user:{user_id}:notifications        → Personal: XP award, achievement unlock, mentions
```

### 1.2 Channel Subscription Pattern

```typescript
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  subscribeToProject(projectId: string, handlers: ProjectHandlers) {
    const channelKey = `project:${projectId}`;
    
    if (this.channels.has(channelKey)) {
      this.unsubscribe(channelKey);
    }

    const channel = this.supabase
      .channel(channelKey)
      // Tasks
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, handlers.onTaskChange)
      // Milestones
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'milestones',
        filter: `project_id=eq.${projectId}`
      }, handlers.onMilestoneChange)
      // Approvals
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'approvals',
        filter: `project_id=eq.${projectId}`
      }, handlers.onApprovalChange)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${channelKey}`);
        }
        if (status === 'CHANNEL_ERROR') {
          // Retry after backoff
          setTimeout(() => this.subscribeToProject(projectId, handlers), 2000);
        }
      });

    this.channels.set(channelKey, channel);
    return channel;
  }

  subscribeToUserNotifications(userId: string, handlers: NotificationHandlers) {
    const channelKey = `user:${userId}`;
    
    const channel = this.supabase
      .channel(channelKey)
      .on('broadcast', { event: 'xp_award' }, handlers.onXPAward)
      .on('broadcast', { event: 'achievement_unlock' }, handlers.onAchievementUnlock)
      .on('broadcast', { event: 'task_assigned' }, handlers.onTaskAssigned)
      .subscribe();

    this.channels.set(channelKey, channel);
    return channel;
  }

  unsubscribe(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((_, key) => this.unsubscribe(key));
  }
}
```

---

## 2. ROLE-BASED EVENT FILTERING

Supabase RLS applies to `postgres_changes` subscriptions — clients only receive changes to rows they have SELECT access to. However, the filtering happens server-side based on the authenticated user's JWT. Ensure:

1. JWT contains `role` claim (via Supabase auth hook)
2. RLS policies cover all tables being subscribed
3. CLIENT users will receive task events only if their RLS policy allows it

```sql
-- Ensure auth hook sets role claim
-- In Supabase: Auth > Hooks > JWT template
-- Add to custom claims:
-- {
--   "role": "{{ .UserMetadata.role }}"
-- }

-- Then RLS policies can use: auth.jwt() ->> 'role'
```

### 2.1 Broadcast-based Notifications (server-to-client, bypasses RLS)

For user-specific events like XP awards, use broadcast (not postgres_changes):

```typescript
// Server-side (Supabase Edge Function or backend):
async function broadcastXPAward(supabaseAdmin: SupabaseClient, userId: string, payload: XPPayload) {
  await supabaseAdmin
    .channel(`user:${userId}`)
    .send({
      type: 'broadcast',
      event: 'xp_award',
      payload: {
        xpAmount: payload.xpAmount,
        newTotal: payload.newTotal,
        eventType: payload.eventType,
        leveledUp: payload.leveledUp,
        newLevel: payload.newLevel,
      }
    });
}
```

---

## 3. REACT HOOKS

### 3.1 useRealtime — Core Hook

```typescript
// hooks/useRealtime.ts
import { useEffect, useRef } from 'react';
import { useSupabase } from './useSupabase';
import { RealtimeManager } from '@/lib/realtime';

let realtimeManager: RealtimeManager | null = null;

function getRealtimeManager(supabase: SupabaseClient) {
  if (!realtimeManager) realtimeManager = new RealtimeManager(supabase);
  return realtimeManager;
}

export function useProjectRealtime(projectId: string | null) {
  const supabase = useSupabase();
  const tasksStore = useTasksStore();
  
  useEffect(() => {
    if (!projectId) return;
    
    const manager = getRealtimeManager(supabase);
    
    manager.subscribeToProject(projectId, {
      onTaskChange: (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        if (eventType === 'INSERT') {
          tasksStore.addTask(newRecord);
        } else if (eventType === 'UPDATE') {
          tasksStore.updateTask(newRecord.id, newRecord);
          
          // If task completed, recalculate milestone progress
          if (newRecord.status === 'complete' && oldRecord.status !== 'complete') {
            tasksStore.recalculateMilestoneProgress(newRecord.project_id);
          }
        } else if (eventType === 'DELETE') {
          tasksStore.removeTask(oldRecord.id);
        }
      },
      
      onMilestoneChange: (payload) => {
        tasksStore.updateMilestone(payload.new);
      },
      
      onApprovalChange: (payload) => {
        // Trigger visual notification for approval state changes
        if (payload.new.status !== payload.old?.status) {
          showApprovalStatusChange(payload.new);
        }
      }
    });
    
    return () => {
      manager.unsubscribe(`project:${projectId}`);
    };
  }, [projectId]);
}
```

### 3.2 useUserNotifications

```typescript
export function useUserNotifications() {
  const supabase = useSupabase();
  const userId = useAuthStore(s => s.user?.id);
  
  useEffect(() => {
    if (!userId) return;
    
    const manager = getRealtimeManager(supabase);
    
    manager.subscribeToUserNotifications(userId, {
      onXPAward: (payload) => {
        const { xpAmount, newTotal, leveledUp, newLevel } = payload;
        
        // Show XP float
        spawnXPFloat(xpAmount, document.querySelector('.xp-bar-container'));
        
        // Update store
        useGamificationStore.getState().updateXP(newTotal);
        
        // Level-up sequence if applicable
        if (leveledUp && newLevel) {
          triggerLevelUp(newLevel, document.getElementById('device-shell'));
        }
      },
      
      onAchievementUnlock: (payload) => {
        showAchievementUnlock(payload.achievement);
        useGamificationStore.getState().addAchievement(payload.achievement);
      },
      
      onTaskAssigned: (payload) => {
        showTerminalNotification(`NEW TASK ASSIGNED: ${payload.title}`);
      }
    });
    
    return () => {
      manager.unsubscribe(`user:${userId}`);
    };
  }, [userId]);
}
```

---

## 4. OPTIMISTIC UI PATTERN

For task status changes, apply optimistically and revert if server rejects:

```typescript
// In TasksStore (Zustand)
const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],
  
  async completeTask(taskId: string) {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 1. Optimistic update — immediate UI response
    set(s => ({
      tasks: s.tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: 'complete', completed_at: new Date().toISOString() }
          : t
      )
    }));
    
    // 2. CRT transition on the task card
    document.querySelector(`[data-task-id="${taskId}"]`)?.classList.add('task--completing');
    
    try {
      // 3. Server update
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'complete', completed_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // 4. XP award via Edge Function
      await supabase.functions.invoke('award-task-xp', { body: { taskId } });
      
    } catch (err) {
      // 5. Revert on failure
      set(s => ({
        tasks: s.tasks.map(t => 
          t.id === taskId ? { ...task } : t
        )
      }));
      
      document.querySelector(`[data-task-id="${taskId}"]`)?.classList.remove('task--completing');
      
      // Show error in CRT style
      showCRTError('TASK UPDATE FAILED — RETRYING');
    }
  }
}));
```

---

## 5. CONNECTION STATE HANDLING

```typescript
// Connection status indicator for device chrome
export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const supabase = useSupabase();
  
  useEffect(() => {
    const channel = supabase.channel('connection-check')
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('connected');
        if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('disconnected');
        if (s === 'CLOSED') setStatus('disconnected');
      });
    
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return status;
}

// Map to device LED
function ConnectionLED({ status }) {
  const ledState = {
    connected: 'active',
    connecting: 'pulsing',
    disconnected: 'error'
  }[status];
  
  return <StatusLED state={ledState} label="NET" />;
}
```

---

## 6. PERFORMANCE GUIDELINES

| Concern | Solution |
|---|---|
| Too many channels | Max 1 project channel + 1 user channel per session; unsubscribe on unmount |
| Stale data on reconnect | Full refetch of active module data on reconnect |
| Broadcast flood | Debounce UI updates: batch changes within 100ms window |
| Memory leak | Always return cleanup function from useEffect; unsubscribeAll on logout |
| Supabase free tier limit | 200 concurrent connections — monitor; upgrade if team > 150 concurrent users |

---

## 7. SUPABASE EDGE FUNCTION: XP AWARD (REFERENCE)

```typescript
// supabase/functions/award-task-xp/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { taskId } = await req.json();
  
  // Get task details
  const { data: task } = await supabase
    .from('tasks')
    .select('assigned_to, due_date, completed_at, xp_value')
    .eq('id', taskId)
    .single();
  
  if (!task?.assigned_to) return new Response('No assignee', { status: 400 });
  
  // Calculate XP
  const isOnTime = task.due_date 
    ? new Date(task.completed_at!) <= new Date(task.due_date)
    : true;
  const xpAmount = isOnTime ? (task.xp_value ?? 20) : Math.floor((task.xp_value ?? 20) * 0.4);
  
  // Award XP
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', task.assigned_to)
    .single();
  
  const newXP = (profile?.xp ?? 0) + xpAmount;
  const newLevel = getLevelFromXP(newXP).level;
  const leveledUp = newLevel > (profile?.level ?? 1);
  
  await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', task.assigned_to);
  await supabase.from('xp_events').insert({
    profile_id: task.assigned_to,
    event_type: 'task_complete',
    xp_awarded: xpAmount,
    reference_id: taskId
  });
  
  // Broadcast to user's personal channel
  await supabase.channel(`user:${task.assigned_to}`).send({
    type: 'broadcast',
    event: 'xp_award',
    payload: { xpAmount, newTotal: newXP, leveledUp, newLevel: leveledUp ? newLevel : null }
  });
  
  return new Response(JSON.stringify({ xpAmount, newXP, leveledUp }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```
