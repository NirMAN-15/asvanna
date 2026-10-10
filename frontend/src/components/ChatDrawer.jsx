import React, { useState, useEffect, useRef, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';

export default function ChatDrawer({
  isOpen,
  onClose,
  order,
  listingId,
  otherPartyName = 'Counterparty',
  otherPartyRole = 'FARMER',
}) {
  const { user } = useContext(AuthContext);
  const { lang, t } = useContext(LanguageContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollTimerRef = useRef(null);

  const orderId = order?.id || order?.order_id;
  const currentListingId = listingId || order?.listing_id || 1;

  // Fetch messages whenever orderId changes or drawer opens
  useEffect(() => {
    if (!isOpen || !orderId) return;

    fetchMessages();

    // Poll every 3 seconds for new live messages
    pollTimerRef.current = setInterval(() => {
      fetchMessages(true);
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get(`/marketplace/orders/${orderId}/messages`);
      if (res.data?.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch chat messages:', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await API.post(`/marketplace/orders/${orderId}/messages`, {
        text,
        listingId: currentListingId,
      });

      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const sendQuickReply = (text) => {
    setInputText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Drawer Container */}
      <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant/40 animate-slideLeft">
        {/* Header */}
        <div className="p-4 bg-primary text-white flex items-center justify-between border-b border-primary-container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">
                {otherPartyRole === 'BUYER' ? 'store' : 'agriculture'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-tight text-white">
                  {otherPartyName || (otherPartyRole === 'BUYER' ? 'Buyer' : 'Farmer')}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/20 text-white">
                  {otherPartyRole}
                </span>
              </div>
              <p className="text-xs text-primary-fixed-dim font-mono">
                {order?.order_code || `Order #${orderId}`} • {order?.crop_name_en || order?.crop_name || 'Produce'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Close Chat"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Order Brief Strip */}
        {order && (
          <div className="px-4 py-2 bg-surface-container text-xs text-on-surface-variant flex items-center justify-between border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">
                {order.requested_quantity_kg || order.quantity_kg} kg
              </span>
              <span>•</span>
              <span className="font-semibold text-secondary">
                LKR {order.offered_price_per_kg || order.price_per_kg}/kg
              </span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                order.status === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {order.status || 'ORDER'}
            </span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low/40">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-lg animate-spin mr-2">progress_activity</span>
              Loading live messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">chat</span>
              </div>
              <p className="font-semibold text-sm text-on-surface">No messages yet</p>
              <p className="text-xs text-on-surface-variant">
                Direct chat between buyer and farmer for order coordination and pickup details.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMine =
                (user && m.sender_id && Number(m.sender_id) === Number(user.id)) ||
                (user && m.sender_role === user.role);
              const isSystem = m.sender_role === 'SYSTEM' || !m.sender_role;

              if (isSystem) {
                return (
                  <div key={m.id || idx} className="flex justify-center my-2">
                    <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-center max-w-xs shadow-xs">
                      {m.message_text || m.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      {isMine ? 'You' : m.sender_name || otherPartyName}
                    </span>
                    <span className="text-[9px] text-outline">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs break-words ${
                      isMine
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface-container-lowest text-on-surface border border-outline-variant/50 rounded-tl-none'
                    }`}
                  >
                    {m.message_text || m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 pt-2 pb-1 bg-surface-container-lowest border-t border-outline-variant/30 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => sendQuickReply('Is the crop ready for inspection?')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant transition"
          >
            Inspection ready?
          </button>
          <button
            type="button"
            onClick={() => sendQuickReply('What is the preferred pickup date?')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant transition"
          >
            Pickup date?
          </button>
          <button
            type="button"
            onClick={() => sendQuickReply('Payment is ready via bank transfer.')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant transition"
          >
            Payment ready
          </button>
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 bg-surface-container-lowest flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to discuss order..."
            className="flex-1 h-10 px-3.5 text-xs bg-surface-container border border-outline-variant rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 bg-primary hover:bg-primary-container text-white rounded-full flex items-center justify-center transition shadow-xs disabled:opacity-50 cursor-pointer flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
