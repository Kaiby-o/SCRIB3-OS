import { useState, useRef, useEffect, useCallback } from 'react';
import { useOfficeStore, type ChatMessage } from '../../store/office.store';
import { bridge } from './PhaserBridge';

export default function ChatPanel() {
  const { messages, chatVisible, chatFocused } = useOfficeStore();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !chatFocused) {
        e.preventDefault();
        useOfficeStore.getState().toggleChat();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chatFocused]);

  const handleFocus = useCallback(() => {
    useOfficeStore.getState().setChatFocused(true);
    bridge.emit('chat:focus');
  }, []);

  const handleBlur = useCallback(() => {
    useOfficeStore.getState().setChatFocused(false);
    bridge.emit('chat:blur');
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    bridge.emit('chat:send', input.trim());
    setInput('');
    inputRef.current?.focus();
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') { inputRef.current?.blur(); useOfficeStore.getState().toggleChat(); }
  }, [handleSend]);

  // Toggle button (when chat is closed)
  if (!chatVisible) {
    return (
      <button
        onClick={() => useOfficeStore.getState().toggleChat()}
        style={{
          position: 'fixed', bottom: '56px', right: '16px', zIndex: 960,
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(234, 242, 215, 0.1)', borderRadius: '75.641px',
          padding: '8px 16px', cursor: 'pointer',
          fontFamily: "'Owners Wide', sans-serif", fontSize: '10px',
          letterSpacing: '1px', textTransform: 'uppercase' as const,
          color: 'rgba(234, 242, 215, 0.5)', transition: 'all 150ms',
        }}
      >
        Chat · Enter
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '56px', right: '16px', zIndex: 960,
      width: '340px', height: '400px',
      background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(234, 242, 215, 0.08)', borderRadius: '10.258px',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(234, 242, 215, 0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '11px', color: '#EAF2D7', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Office Chat
        </span>
        <button
          onClick={() => useOfficeStore.getState().toggleChat()}
          style={{ background: 'none', border: 'none', color: 'rgba(234, 242, 215, 0.4)', fontSize: '16px', cursor: 'pointer', padding: '4px', minWidth: '28px', minHeight: '28px' }}
        >&times;</button>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.length === 0 && (
          <div style={{ color: 'rgba(234, 242, 215, 0.2)', textAlign: 'center', paddingTop: '60px', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>
            No messages yet
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(234, 242, 215, 0.06)', display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={500}
          autoFocus
          style={{
            flex: 1,
            background: 'rgba(234, 242, 215, 0.04)',
            border: '1px solid rgba(234, 242, 215, 0.08)',
            borderRadius: '75.641px',
            padding: '8px 14px',
            color: '#EAF2D7',
            fontFamily: "'Owners Wide', sans-serif", fontSize: '12px',
            outline: 'none',
          }}
        />
        <button onClick={handleSend} style={{
          background: '#D7ABC5', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'opacity 150ms',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', fontWeight: 600, color: '#D7ABC5', letterSpacing: '0.5px' }}>{msg.username}</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', color: 'rgba(234, 242, 215, 0.2)' }}>{time}</span>
      </div>
      <div style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', color: 'rgba(234, 242, 215, 0.8)', lineHeight: '1.5', wordBreak: 'break-word' }}>{msg.message}</div>
    </div>
  );
}
