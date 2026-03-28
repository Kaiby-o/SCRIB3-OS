import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam, getInitials } from '../lib/team';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  In-App Chat System                                                 */
/*  Channels: #general, #design, #dev, #pr, + DMs                     */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unread: number;
}

const channels: Channel[] = [
  { id: 'general', name: 'general', type: 'channel', unread: 3 },
  { id: 'brand', name: 'brand', type: 'channel', unread: 1 },
  { id: 'pr', name: 'pr', type: 'channel', unread: 0 },
  { id: 'dev', name: 'dev', type: 'channel', unread: 5 },
  { id: 'accounts', name: 'accounts', type: 'channel', unread: 0 },
  { id: 'dm-sixtyne', name: 'Sixtyne Perez', type: 'dm', unread: 2 },
  { id: 'dm-kevin', name: 'Kevin Moran', type: 'dm', unread: 0 },
  { id: 'dm-elena', name: 'Elena Zheng', type: 'dm', unread: 1 },
];

const mockMessages: Record<string, ChatMessage[]> = {
  general: [
    { id: 'm1', channelId: 'general', senderName: 'Sixtyne Perez', content: 'Team standup notes are in the #brand channel. Please review before EOD.', timestamp: '2026-03-27T09:15:00Z' },
    { id: 'm2', channelId: 'general', senderName: 'Ben Lydiat', content: 'SCRIB3-OS is now live at s3-os.com. Please log in and explore — feedback welcome.', timestamp: '2026-03-27T10:30:00Z' },
    { id: 'm3', channelId: 'general', senderName: 'Nick Mitchell', content: 'Reminder: pre-alignment checklist is now mandatory for all new projects. No exceptions.', timestamp: '2026-03-27T11:00:00Z' },
    { id: 'm4', channelId: 'general', senderName: 'Elena Zheng', content: 'Franklin Templeton QBR deck is ready for review. Link in #accounts.', timestamp: '2026-03-27T14:20:00Z' },
  ],
  brand: [
    { id: 'm5', channelId: 'brand', senderName: 'Kevin Moran', content: 'Rootstock brand refresh Phase 2 assets are uploaded to Drive. Ready for review.', timestamp: '2026-03-27T09:45:00Z' },
    { id: 'm6', channelId: 'brand', senderName: 'Samantha Kelly', content: 'BENJI content series — client loved the first batch. Proceeding with Phase 2.', timestamp: '2026-03-27T13:00:00Z' },
  ],
  dev: [
    { id: 'm7', channelId: 'dev', senderName: 'CK', content: 'Linear integration is live. Tasks page pulls directly from our workspace. 30s auto-refresh.', timestamp: '2026-03-27T08:00:00Z' },
    { id: 'm8', channelId: 'dev', senderName: 'Ben Lydiat', content: 'Systems map has been rebuilt in the OS aesthetic. All 40+ nodes, journeys, layers. Check /systems-map.', timestamp: '2026-03-27T15:00:00Z' },
    { id: 'm9', channelId: 'dev', senderName: 'CK', content: 'Dashboard widgets are drag-and-drop now. Settings page controls which widgets are visible.', timestamp: '2026-03-27T16:00:00Z' },
  ],
  pr: [
    { id: 'm10', channelId: 'pr', senderName: 'Matthew Brannon', content: 'Cardano coverage report uploaded. 3 tier-1 placements this month.', timestamp: '2026-03-27T10:00:00Z' },
  ],
  accounts: [
    { id: 'm11', channelId: 'accounts', senderName: 'Elena Zheng', content: 'Canton scope watch: client requesting weekend content again. Using approved response from scope watch page.', timestamp: '2026-03-27T11:30:00Z' },
  ],
  'dm-sixtyne': [
    { id: 'm12', channelId: 'dm-sixtyne', senderName: 'Sixtyne Perez', content: 'Great progress on the OS. Can we schedule a walkthrough for the c-suite next week?', timestamp: '2026-03-27T09:00:00Z' },
    { id: 'm13', channelId: 'dm-sixtyne', senderName: 'Ben Lydiat', content: 'Absolutely. I\'ll set something up for Tuesday. Want to cover the finance dashboard + tasks integration.', timestamp: '2026-03-27T09:05:00Z' },
  ],
  'dm-kevin': [],
  'dm-elena': [
    { id: 'm14', channelId: 'dm-elena', senderName: 'Elena Zheng', content: 'The client hub pages are really helpful. Can we add the SOW document links?', timestamp: '2026-03-27T12:00:00Z' },
  ],
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [activeChannel, setActiveChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find((c) => c.id === activeChannel);
  const channelMessages = messages[activeChannel] ?? [];

  // Load messages from Supabase for active channel
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMessages((prev) => ({
          ...prev,
          [channelId]: data.map((m: Record<string, unknown>) => ({
            id: m.id as string,
            channelId: m.channel_id as string,
            senderName: (m.sender_name ?? '') as string,
            content: (m.content ?? '') as string,
            timestamp: (m.created_at ?? '') as string,
          })),
        }));
      }
    } catch { /* fall back to mock data */ }
  }, []);

  useEffect(() => { loadMessages(activeChannel); }, [activeChannel, loadMessages]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel(`chat-${activeChannel}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeChannel}` },
        (payload: { new: Record<string, unknown> }) => {
          const m = payload.new;
          const msg: ChatMessage = {
            id: m.id as string,
            channelId: m.channel_id as string,
            senderName: (m.sender_name ?? '') as string,
            content: (m.content ?? '') as string,
            timestamp: (m.created_at ?? '') as string,
          };
          setMessages((prev) => {
            const existing = prev[activeChannel] ?? [];
            if (existing.find((e) => e.id === msg.id)) return prev;
            return { ...prev, [activeChannel]: [...existing, msg] };
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannel]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic local update
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channelId: activeChannel,
      senderName: profile?.display_name ?? 'You',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [activeChannel]: [...(prev[activeChannel] ?? []), tempMsg] }));

    // Write to Supabase (real-time subscription will also fire)
    void supabase.from('chat_messages').insert({
      channel_id: activeChannel,
      sender_id: profile?.id ?? null,
      sender_name: profile?.display_name ?? 'Unknown',
      content,
    });
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Chat</span>
        <BurgerButton />
      </header>

      <div className="flex" style={{ height: 'calc(100vh - 86px)', marginTop: '86px' }}>
        {/* Sidebar — channel list */}
        <div style={{ width: '240px', borderRight: '0.733px solid var(--border-default)', overflow: 'auto', padding: '16px 0', flexShrink: 0 }}>
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', opacity: 0.4 }}>Channels</span>
          </div>
          {channels.filter((c) => c.type === 'channel').map((ch) => (
            <ChannelItem key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => setActiveChannel(ch.id)} />
          ))}

          <div style={{ padding: '16px 16px 8px', marginTop: '8px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', opacity: 0.4 }}>Direct Messages</span>
          </div>
          {channels.filter((c) => c.type === 'dm').map((ch) => (
            <ChannelItem key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => setActiveChannel(ch.id)} />
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Channel header */}
          <div style={{ padding: '12px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
              {currentChannel?.type === 'channel' ? '#' : ''}{currentChannel?.name}
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
            {channelMessages.length === 0 ? (
              <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.3 }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>No messages yet. Start the conversation.</span>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const member = mockTeam.find((m) => m.name === msg.senderName);
                return (
                  <div key={msg.id} className="flex gap-3" style={{ marginBottom: '16px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {member?.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '12px' }}>{getInitials(msg.senderName)}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{msg.senderName}</span>
                        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.35 }}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div style={{ padding: '12px 24px', borderTop: '0.733px solid var(--border-default)', flexShrink: 0 }}>
            <div className="flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message ${currentChannel?.type === 'channel' ? '#' : ''}${currentChannel?.name ?? ''}...`}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', flex: 1, background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 20px', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={!newMessage.trim()}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '75.641px', border: 'none', background: newMessage.trim() ? '#000' : 'rgba(0,0,0,0.1)', color: newMessage.trim() ? '#EAF2D7' : 'var(--text-primary)', cursor: newMessage.trim() ? 'pointer' : 'default' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelItem: React.FC<{ channel: Channel; active: boolean; onClick: () => void }> = ({ channel: ch, active, onClick }) => (
  <button onClick={onClick} className="flex items-center justify-between" style={{
    width: '100%', padding: '8px 16px', background: active ? 'var(--bg-surface)' : 'transparent',
    border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 100ms',
  }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-surface)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', color: 'var(--text-primary)', opacity: active ? 1 : 0.6 }}>
      {ch.type === 'channel' ? '# ' : ''}{ch.name}
    </span>
    {ch.unread > 0 && (
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', background: '#D7ABC5', color: '#000', padding: '1px 6px', borderRadius: '75.641px', fontWeight: 600 }}>
        {ch.unread}
      </span>
    )}
  </button>
);

export default ChatPage;
