import { supabase } from '../../../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { bridge } from '../../PhaserBridge';
import { useOfficeStore, type RemoteUser } from '../../../../store/office.store';
import { getAvatarColor } from './AvatarGenerator';

interface PresenceState {
  userId: string;
  username: string;
  x: number;
  y: number;
  direction: string;
  color: string;
}

export class MultiplayerSystem {
  private channel: RealtimeChannel | null = null;
  private userId: string;
  private username: string;
  private color: string;

  constructor(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
    this.color = getAvatarColor(userId);
  }

  async connect(): Promise<void> {
    this.channel = supabase.channel('office:main', {
      config: { presence: { key: this.userId } },
    });

    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel!.presenceState<PresenceState>();
      const users: Record<string, RemoteUser> = {};

      for (const [key, presences] of Object.entries(state)) {
        if (key === this.userId) continue;
        const p = presences[0] as unknown as PresenceState;
        if (p) {
          users[key] = {
            userId: p.userId,
            username: p.username,
            x: p.x,
            y: p.y,
            direction: p.direction,
            color: p.color,
          };
        }
      }

      useOfficeStore.getState().setOnlineUsers(users);
      bridge.emit('presence:sync', users);
    });

    this.channel.on('presence', { event: 'leave' }, ({ key }) => {
      useOfficeStore.getState().removeUser(key);
      bridge.emit('presence:leave', key);
    });

    this.channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      useOfficeStore.getState().addMessage({
        id: `${payload.userId}-${payload.timestamp}`,
        userId: payload.userId,
        username: payload.username,
        message: payload.message,
        timestamp: payload.timestamp,
      });
      bridge.emit('chat:message', payload);
    });

    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        useOfficeStore.getState().setConnected(true);
        // Track initial position
        await this.channel!.track({
          userId: this.userId,
          username: this.username,
          x: 480,
          y: 320,
          direction: 'down',
          color: this.color,
        });
      }
    });
  }

  async broadcastPosition(x: number, y: number, direction: string): Promise<void> {
    if (!this.channel) return;
    await this.channel.track({
      userId: this.userId,
      username: this.username,
      x,
      y,
      direction,
      color: this.color,
    });
  }

  async broadcastChat(message: string): Promise<void> {
    if (!this.channel) return;

    const payload = {
      userId: this.userId,
      username: this.username,
      message,
      timestamp: Date.now(),
    };

    // Add own message to store immediately
    useOfficeStore.getState().addMessage({
      id: `${this.userId}-${payload.timestamp}`,
      ...payload,
    });

    await this.channel.send({
      type: 'broadcast',
      event: 'chat',
      payload,
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await supabase.removeChannel(this.channel);
      this.channel = null;
      useOfficeStore.getState().setConnected(false);
    }
  }
}
