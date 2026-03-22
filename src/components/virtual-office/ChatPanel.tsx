import { useState, useRef, useEffect, useCallback } from 'react';
import { useOfficeStore, type ChatMessage } from '../../store/office.store';
import { bridge } from './PhaserBridge';

export default function ChatPanel() {
  const { messages, chatVisible, chatFocused } = useOfficeStore();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Toggle with Enter when not focused
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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      useOfficeStore.getState().toggleChat();
    }
  }, [handleSend]);

  if (!chatVisible) {
    return (
      <button
        onClick={() => useOfficeStore.getState().toggleChat()}
        style={toggleButtonStyle}
      >
        CHAT [ENTER]
      </button>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>COMMS</span>
        <button
          onClick={() => useOfficeStore.getState().toggleChat()}
          style={closeStyle}
        >×</button>
      </div>

      <div ref={listRef} style={messagesStyle}>
        {messages.length === 0 && (
          <div style={emptyStyle}>No messages yet. Say hello!</div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </div>

      <div style={inputRowStyle}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={inputStyle}
          maxLength={500}
          autoFocus
        />
        <button onClick={handleSend} style={sendStyle}>→</button>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={bubbleStyle}>
      <span style={nameStyle}>{msg.username}</span>
      <span style={timeStyle}>{time}</span>
      <div style={textStyle}>{msg.message}</div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '268px',
  right: '10px',
  width: '320px',
  bottom: '50px',
  background: 'rgba(26, 26, 46, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  color: '#E8E0E0',
  zIndex: 950,
  backdropFilter: 'blur(8px)',
};

const headerStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '10px',
  letterSpacing: '0.2em',
  color: '#A0AEC0',
};

const closeStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#A0AEC0',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '0 4px',
};

const messagesStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 14px',
};

const emptyStyle: React.CSSProperties = {
  color: '#4A5568',
  textAlign: 'center',
  paddingTop: '40px',
  fontSize: '11px',
};

const bubbleStyle: React.CSSProperties = {
  marginBottom: '8px',
};

const nameStyle: React.CSSProperties = {
  color: '#63B3ED',
  fontSize: '10px',
  fontWeight: 'bold',
  marginRight: '8px',
};

const timeStyle: React.CSSProperties = {
  color: '#4A5568',
  fontSize: '9px',
};

const textStyle: React.CSSProperties = {
  color: '#E2E8F0',
  marginTop: '2px',
  lineHeight: '1.4',
  wordBreak: 'break-word',
};

const inputRowStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  gap: '8px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  padding: '8px 10px',
  color: '#E8E0E0',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '12px',
  outline: 'none',
};

const sendStyle: React.CSSProperties = {
  background: 'rgba(66, 153, 225, 0.3)',
  border: '1px solid rgba(66, 153, 225, 0.5)',
  borderRadius: '4px',
  color: '#63B3ED',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: "'JetBrains Mono', monospace",
};

const toggleButtonStyle: React.CSSProperties = {
  position: 'fixed',
  top: '268px',       // Below the toolbar buttons (140px top + ~3 buttons * 42px each)
  right: '10px',
  width: '160px',
  background: 'rgba(26, 26, 46, 0.85)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '4px',
  color: '#A0AEC0',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.12em',
  padding: '10px 12px',
  cursor: 'pointer',
  zIndex: 950,
  textAlign: 'center' as const,
  boxSizing: 'border-box' as const,
};
