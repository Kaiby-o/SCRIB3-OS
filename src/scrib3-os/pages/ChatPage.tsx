import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuthStore } from '../hooks/useAuth';
import { mockTeam, getInitials } from '../lib/team';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  In-App Chat System                                                 */
/*  Channels: #general, #brand, #dev, #pr, #accounts + DMs            */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, string[]>; // emoji → list of user names
  threadCount?: number;
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unread: number;
}

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '👀', '✅', '💯'];

const initialChannels: Channel[] = [
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
  const isMobile = useIsMobile();
  const { profile } = useAuthStore();
  const [activeChannel, setActiveChannel] = useState('general');
  const [showSidebar, setShowSidebar] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [channels, setChannels] = useState(initialChannels);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [emojiPickerMsg, setEmojiPickerMsg] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelMembers, setNewChannelMembers] = useState<string[]>([]);
  const [showNewDM, setShowNewDM] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChannel = channels.find((c) => c.id === activeChannel);
  const channelMessages = messages[activeChannel] ?? [];
  const myName = profile?.display_name ?? 'You';

  // Clear unread when switching channels
  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannel(channelId);
    setChannels((prev) => prev.map((c) => c.id === channelId ? { ...c, unread: 0 } : c));
    setReplyTo(null);
    setEmojiPickerMsg(null);
    setShowSidebar(false);
  }, []);

  // Load messages from Supabase
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

  // @mention handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const cursorPos = e.target.selectionStart ?? val.length;
    setMentionCursorPos(cursorPos);
    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionFilter(atMatch[1].toLowerCase());
      setMentionDropdown(true);
    } else {
      setMentionDropdown(false);
    }
  };

  const insertMention = (name: string) => {
    const textBeforeCursor = newMessage.slice(0, mentionCursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      const before = textBeforeCursor.slice(0, atMatch.index);
      const after = newMessage.slice(mentionCursorPos);
      setNewMessage(`${before}@${name} ${after}`);
    }
    setMentionDropdown(false);
    inputRef.current?.focus();
  };

  const filteredMentions = mockTeam.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter) && m.name !== myName
  ).slice(0, 6);

  // Add emoji reaction
  const addReaction = (msgId: string, emoji: string) => {
    setMessages((prev) => {
      const channelMsgs = [...(prev[activeChannel] ?? [])];
      const idx = channelMsgs.findIndex((m) => m.id === msgId);
      if (idx === -1) return prev;
      const msg = { ...channelMsgs[idx] };
      const reactions = { ...(msg.reactions ?? {}) };
      const users = [...(reactions[emoji] ?? [])];
      const userIdx = users.indexOf(myName);
      if (userIdx >= 0) users.splice(userIdx, 1);
      else users.push(myName);
      if (users.length > 0) reactions[emoji] = users;
      else delete reactions[emoji];
      msg.reactions = reactions;
      channelMsgs[idx] = msg;
      return { ...prev, [activeChannel]: channelMsgs };
    });
    setEmojiPickerMsg(null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');
    setReplyTo(null);

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      channelId: activeChannel,
      senderName: myName,
      content: replyTo ? `↩ Replying to ${replyTo.senderName}: "${replyTo.content.slice(0, 50)}${replyTo.content.length > 50 ? '...' : ''}"\n\n${content}` : content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [activeChannel]: [...(prev[activeChannel] ?? []), tempMsg] }));

    void supabase.from('chat_messages').insert({
      channel_id: activeChannel,
      sender_id: profile?.id ?? null,
      sender_name: myName,
      content: tempMsg.content,
    });
  };

  const handleFileClick = () => fileInputRef.current?.click();

  // Render message content with @mentions highlighted
  const renderContent = (text: string) => {
    const parts = text.split(/(@\w[\w\s]*?)(?=\s|$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1).trim();
        const member = mockTeam.find((m) => m.name.toLowerCase() === name.toLowerCase());
        if (member) {
          return <span key={i} style={{ background: 'rgba(215,171,197,0.2)', borderRadius: 4, padding: '0 4px', fontWeight: 600, color: '#D7ABC5', cursor: 'pointer' }} onClick={() => navigate(`/team/${member.id}`)}>{part}</span>;
        }
      }
      return part;
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

      <div className="flex" style={{ height: 'calc(100vh - 86px)', marginTop: '86px', position: 'relative' }}>
        {/* Sidebar toggle for mobile */}
        {isMobile && (
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)', background: 'var(--bg-primary)', cursor: 'pointer' }}>
            {showSidebar ? 'Close' : 'Channels'}
          </button>
        )}
        {/* Sidebar */}
        <div style={{ width: '240px', borderRight: '0.733px solid var(--border-default)', overflow: 'auto', padding: '16px 0', flexShrink: 0, ...(isMobile ? { position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 5, background: 'var(--bg-primary)', display: showSidebar ? 'block' : 'none' } : {}) }}>
          <div className="flex items-center justify-between" style={{ padding: '0 16px', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', opacity: 0.4 }}>Channels</span>
            <button onClick={() => setShowNewChannel(!showNewChannel)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: '0 4px', lineHeight: 1 }} title="New channel">+</button>
          </div>

          {showNewChannel && (
            <div style={{ padding: '0 12px', marginBottom: '12px' }}>
              <input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="Channel name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newChannelName.trim()) {
                    const slug = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
                    setChannels((prev) => [...prev, { id: slug, name: newChannelName.trim(), type: 'channel', unread: 0 }]);
                    setMessages((prev) => ({ ...prev, [slug]: [] }));
                    setActiveChannel(slug);
                    setNewChannelName(''); setShowNewChannel(false);
                  }
                  if (e.key === 'Escape') setShowNewChannel(false);
                }}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', width: '100%', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '6px', padding: '6px 10px', outline: 'none', marginBottom: '6px' }} />
              {/* Add members */}
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>Add Members</span>
              <div className="flex gap-1 flex-wrap" style={{ marginBottom: '6px' }}>
                {newChannelMembers.map((m) => (
                  <span key={m} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', padding: '2px 8px', borderRadius: '75.641px', background: 'rgba(215,171,197,0.15)', border: '1px solid rgba(215,171,197,0.3)' }}>{m}</span>
                ))}
              </div>
              <select onChange={(e) => { if (e.target.value && !newChannelMembers.includes(e.target.value)) setNewChannelMembers([...newChannelMembers, e.target.value]); e.target.value = ''; }}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', width: '100%', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '6px', padding: '4px 8px', outline: 'none', cursor: 'pointer', appearance: 'none' as const }}>
                <option value="">Select member...</option>
                {mockTeam.filter((m) => m.name !== myName && !newChannelMembers.includes(m.name)).map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              <button onClick={() => {
                if (newChannelName.trim()) {
                  const slug = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
                  setChannels((prev) => [...prev, { id: slug, name: newChannelName.trim(), type: 'channel', unread: 0 }]);
                  setMessages((prev) => ({ ...prev, [slug]: [] }));
                  setActiveChannel(slug);
                  setNewChannelName(''); setNewChannelMembers([]); setShowNewChannel(false);
                }
              }}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer', marginTop: '6px' }}>
                Create
              </button>
            </div>
          )}

          {channels.filter((c) => c.type === 'channel').map((ch) => (
            <ChannelItem key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => handleSelectChannel(ch.id)} />
          ))}

          <div className="flex items-center justify-between" style={{ padding: '16px 16px 8px', marginTop: '8px' }}>
            <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', opacity: 0.4 }}>Direct Messages</span>
            <button onClick={() => setShowNewDM(!showNewDM)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: '0 4px', lineHeight: 1 }} title="New message">+</button>
          </div>

          {showNewDM && (
            <div style={{ padding: '0 12px', marginBottom: '8px' }}>
              <select onChange={(e) => {
                if (e.target.value) {
                  const member = mockTeam.find((m) => m.id === e.target.value);
                  if (member) {
                    const dmId = `dm-${member.id}`;
                    if (!channels.find((c) => c.id === dmId)) {
                      setChannels((prev) => [...prev, { id: dmId, name: member.name, type: 'dm', unread: 0 }]);
                      setMessages((prev) => ({ ...prev, [dmId]: [] }));
                    }
                    setActiveChannel(dmId);
                    setShowNewDM(false);
                  }
                }
              }}
                style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', width: '100%', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '6px', padding: '6px 10px', outline: 'none', cursor: 'pointer', appearance: 'none' as const }}>
                <option value="">Select teammate...</option>
                {mockTeam.filter((m) => m.name !== myName).map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — {m.title}</option>
                ))}
              </select>
            </div>
          )}

          {channels.filter((c) => c.type === 'dm').map((ch) => (
            <ChannelItem key={ch.id} channel={ch} active={activeChannel === ch.id} onClick={() => handleSelectChannel(ch.id)} />
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                const isHovered = hoveredMsg === msg.id;
                return (
                  <div key={msg.id} className="flex gap-3" style={{ marginBottom: '16px', position: 'relative' }}
                    onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => { setHoveredMsg(null); if (emojiPickerMsg === msg.id) return; }}>
                    {/* Clickable avatar → profile */}
                    <div
                      onClick={() => member && navigate(`/team/${member.id}`)}
                      style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: member ? 'pointer' : 'default' }}>
                      {member?.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '12px' }}>{getInitials(msg.senderName)}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                        <span
                          onClick={() => member && navigate(`/team/${member.id}`)}
                          style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', cursor: member ? 'pointer' : 'default' }}>{msg.senderName}</span>
                        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.35 }}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{renderContent(msg.content)}</p>

                      {/* Reactions */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex gap-1 flex-wrap" style={{ marginTop: '4px' }}>
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', padding: '1px 6px', borderRadius: '75.641px', border: users.includes(myName) ? '1px solid #D7ABC5' : '1px solid rgba(0,0,0,0.1)', background: users.includes(myName) ? 'rgba(215,171,197,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {emoji} <span style={{ fontSize: '10px', opacity: 0.6 }}>{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message actions toolbar */}
                    {isHovered && (
                      <div className="flex items-center gap-1" style={{ position: 'absolute', top: -4, right: 0, background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '6px', padding: '2px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <button onClick={() => setEmojiPickerMsg(emojiPickerMsg === msg.id ? null : msg.id)} title="React"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '4px' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                          😀
                        </button>
                        <button onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }} title="Reply"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px 6px', borderRadius: '4px', fontFamily: "'Owners Wide', sans-serif", opacity: 0.5 }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.5'; }}>
                          ↩
                        </button>
                      </div>
                    )}

                    {/* Emoji picker */}
                    {emojiPickerMsg === msg.id && (
                      <div className="flex gap-1" style={{ position: 'absolute', top: -4, right: 70, background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '8px', padding: '4px 6px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', zIndex: 5 }}>
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '4px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center justify-between" style={{ padding: '8px 24px', borderTop: '0.5px solid rgba(0,0,0,0.06)', background: 'var(--bg-surface)' }}>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>
                Replying to <strong>{replyTo.senderName}</strong>: {replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? '...' : ''}
              </span>
              <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.4, padding: '2px 6px' }}>&times;</button>
            </div>
          )}

          {/* Message input */}
          <div style={{ padding: '12px 24px', borderTop: '0.733px solid var(--border-default)', flexShrink: 0, position: 'relative' }}>
            {/* @mention dropdown */}
            {mentionDropdown && filteredMentions.length > 0 && (
              <div style={{ position: 'absolute', bottom: '100%', left: 24, background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 10, minWidth: '200px' }}>
                {filteredMentions.map((m) => (
                  <button key={m.id} onClick={() => insertMention(m.name)} className="flex items-center gap-2"
                    style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', textAlign: 'left' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.avatarUrl ? <img src={m.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                        <span style={{ color: '#EAF2D7', fontFamily: "'Kaio', sans-serif", fontWeight: 900, fontSize: '9px' }}>{getInitials(m.name)}</span>}
                    </div>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{m.name}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, marginLeft: 'auto' }}>{m.title}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              {/* Paperclip for file attach */}
              <button onClick={handleFileClick} title="Attach file"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', opacity: 0.4, flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={() => { /* TODO: Supabase Storage upload */ }} />
              <input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !mentionDropdown) { e.preventDefault(); sendMessage(); }
                  if (e.key === 'Escape') { setMentionDropdown(false); setReplyTo(null); }
                }}
                placeholder={`Message ${currentChannel?.type === 'channel' ? '#' : ''}${currentChannel?.name ?? ''}... (type @ to mention)`}
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
