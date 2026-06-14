import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faTimes,
  faPaperPlane,
  faCircle,
  faCheck,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { getSocket, initializeSocket } from '../services/socket';
import api from '../services/api';
import toast from 'react-hot-toast';
import ChatRating from './ChatRating';
import { getInitials, getAvatarColor, formatDateSeparator, isSameDay, getOrCreateGuestId } from '../utils/chatHelpers';

// WhatsApp Business number for Nonsa Travels
const WHATSAPP_NUMBER = '260970462777';

const ChatWidget = () => {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState('active');
  const [showRating, setShowRating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminOnline, setAdminOnline] = useState(false);
  const [noResponseTimer, setNoResponseTimer] = useState(null);
  const [showWhatsAppSuggestion, setShowWhatsAppSuggestion] = useState(false);
  const [guestId] = useState(() => (isSignedIn ? null : getOrCreateGuestId()));
  const [guestInfo, setGuestInfo] = useState(() => {
    if (isSignedIn) return null;
    const name = localStorage.getItem('nonsa_guest_name');
    const email = localStorage.getItem('nonsa_guest_email');
    return name && email ? { name, email } : null;
  });
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Display name and identifier for the current visitor, whether signed in or a guest
  const senderName = isSignedIn ? (user?.fullName || user?.firstName || 'Guest') : (guestInfo?.name || 'Guest');
  const senderId = isSignedIn ? user?.id : guestId;

  // Open WhatsApp with pre-filled message
  const openWhatsApp = (customMessage) => {
    const message = customMessage || `Hi! I'm ${senderName} from nonsatravels.com. I need assistance.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  // Save guest details and start a chat session
  const handleGuestFormSubmit = (e) => {
    e.preventDefault();
    const name = guestForm.name.trim();
    const email = guestForm.email.trim();
    if (!name || !email) {
      toast.error('Please enter your name and email');
      return;
    }
    localStorage.setItem('nonsa_guest_name', name);
    localStorage.setItem('nonsa_guest_email', email);
    setGuestInfo({ name, email });
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  const initializeChat = useCallback(async () => {
    if (isSignedIn && !user) return;
    if (!isSignedIn && !guestInfo) return;

    try {
      const body = isSignedIn
        ? { userName: user.fullName || user.firstName || 'Guest', userEmail: user.email || '' }
        : { guestId, userName: guestInfo.name, userEmail: guestInfo.email };

      const response = await api.post('/chat/session', body);

      if (response.data.success) {
        setChatId(response.data.data.id);
        setMessages(response.data.data.messages || []);

        // Mark admin messages as read when opening chat
        const unreadAdminMessages = response.data.data.messages.filter(
          (msg) => msg.sender === 'admin' && !msg.read
        ).length;
        setUnreadCount(unreadAdminMessages);
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  }, [isSignedIn, user, guestInfo, guestId]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!chatId || !senderId) return;

    const socket = initializeSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-chat', {
        chatId,
        userId: senderId,
        isAdmin: false,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chat-history', (chat) => {
      setMessages(chat.messages || []);
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      // If message is from admin, they are online - clear WhatsApp suggestion
      if (message.sender === 'admin') {
        setAdminOnline(true);
        setShowWhatsAppSuggestion(false);
        if (noResponseTimer) {
          clearTimeout(noResponseTimer);
          setNoResponseTimer(null);
        }
      }
      
      // If message is from admin and chat is closed, increment unread count
      if (message.sender === 'admin' && !isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on('user-typing', () => {
      setIsTyping(true);
      setAdminOnline(true);
      setShowWhatsAppSuggestion(false);
    });

    socket.on('user-stop-typing', () => {
      setIsTyping(false);
    });

    // Listen for admin online status
    socket.on('admin-status', ({ online }) => {
      setAdminOnline(online);
      if (online) {
        setShowWhatsAppSuggestion(false);
      }
    });

    socket.on('messages-read', () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === 'user' ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on('status-updated', ({ status }) => {
      setChatStatus(status);
      if (status === 'closed') {
        toast.success('Chat session ended');
        setShowRating(true);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('chat-history');
        socketRef.current.off('admin-status');
        socketRef.current.off('new-message');
        socketRef.current.off('user-typing');
        socketRef.current.off('user-stop-typing');
        socketRef.current.off('messages-read');
        socketRef.current.off('status-updated');
      }
    };
  }, [chatId, senderId, isOpen]);

  // Open chat and mark messages as read
  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    
    if (chatId && socketRef.current) {
      socketRef.current.emit('mark-read', {
        chatId,
        reader: 'user',
      });
    }
  };

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !chatId || !socketRef.current) return;

    const messageData = {
      chatId,
      sender: 'user',
      senderName,
      senderId,
      message: inputMessage.trim(),
    };

    socketRef.current.emit('send-message', messageData);
    setInputMessage('');

    // Start timer to suggest WhatsApp if no admin response in 2 minutes
    if (noResponseTimer) {
      clearTimeout(noResponseTimer);
    }
    const timer = setTimeout(() => {
      setShowWhatsAppSuggestion(true);
    }, 120000); // 2 minutes
    setNoResponseTimer(timer);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit('stop-typing', { chatId });
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    if (!socketRef.current || !chatId) return;

    socketRef.current.emit('typing', {
      chatId,
      userName: senderName,
      isAdmin: false,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', { chatId });
    }, 1000);
  };

  // Initialize chat once the visitor's identity is known (signed-in user or guest)
  useEffect(() => {
    if (chatId) return;
    if (isSignedIn && user) {
      initializeChat();
    } else if (!isSignedIn && guestInfo) {
      initializeChat();
    }
  }, [isSignedIn, user, guestInfo, chatId, initializeChat]);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-primary hover:bg-secondary text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        aria-label="Open chat"
      >
        <FontAwesomeIcon icon={faComments} className="text-xl sm:text-2xl group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-accent text-gray-900 text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 animate-slide-up max-h-[calc(100vh-2rem)] sm:max-h-[500px]">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <FontAwesomeIcon icon={faComments} className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold">Chat Support</h3>
                <div className="flex items-center gap-2 text-xs">
                  <FontAwesomeIcon
                    icon={faCircle}
                    className={`text-[8px] ${
                      isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'
                    }`}
                  />
                  <span>
                    {!isConnected
                      ? 'Connecting...'
                      : adminOnline
                      ? 'Our team is online'
                      : "We'll reply as soon as we can"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {!isSignedIn && !guestInfo ? (
              <div className="animate-fade-in">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faComments} className="text-3xl text-primary" />
                </div>
                <p className="font-semibold text-gray-700 text-center mb-1">Start a conversation</p>
                <p className="text-sm text-gray-500 text-center mb-4">Tell us a bit about yourself so we can get back to you.</p>
                <form onSubmit={handleGuestFormSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-white"
                  />
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Your email"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2.5 rounded-xl transition-all hover:shadow-lg font-semibold text-sm"
                  >
                    Start Chat
                  </button>
                </form>
              </div>
            ) : showRating ? (
              <ChatRating
                chatId={chatId}
                guestId={guestId}
                onRated={() => {
                  setShowRating(false);
                  setIsOpen(false);
                }}
              />
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4 animate-fade-in">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faComments} className="text-3xl text-primary" />
                </div>
                <p className="font-semibold text-gray-700">Send us a message</p>
                <p className="text-sm mt-1 mb-4">Our team will get back to you as soon as possible.</p>

                {/* WhatsApp Option */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs text-gray-500 mb-2">Need a quicker response? Message us on WhatsApp:</p>
                  <button
                    onClick={() => openWhatsApp('Hi! I need help with booking a hotel on Nonsa Travels.')}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const showDateSeparator =
                  index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);

                return (
                  <div key={msg.id || index}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-3">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDateSeparator(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      } animate-fade-in`}
                    >
                      {msg.sender === 'admin' && (
                        <div
                          className={`w-7 h-7 rounded-full ${getAvatarColor(
                            msg.senderName || 'Support Team'
                          )} text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0`}
                        >
                          {getInitials(msg.senderName || 'Support Team')}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {msg.sender === 'admin' && (
                          <p className="text-xs font-semibold mb-1 text-primary">
                            {msg.senderName || 'Support Team'}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            msg.sender === 'user' ? 'justify-end' : ''
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              msg.sender === 'user'
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {msg.sender === 'user' && (
                            <FontAwesomeIcon
                              icon={msg.read ? faCheckDouble : faCheck}
                              className="text-[10px] text-white/80"
                              title={msg.read ? 'Read' : 'Sent'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            {/* WhatsApp Suggestion when admin is offline */}
            {showWhatsAppSuggestion && (
              <div className="flex justify-center animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center max-w-[90%]">
                  <p className="text-sm text-gray-700 mb-2">
                    Our team may be away right now. We&apos;ll reply here as soon as we can, or you can reach us on WhatsApp:
                  </p>
                  <button
                    onClick={() => openWhatsApp()}
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                    Continue on WhatsApp
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-gray-100 bg-white rounded-b-2xl flex-shrink-0"
          >
            {/* WhatsApp quick action */}
            {!adminOnline && messages.length > 0 && !showWhatsAppSuggestion && (
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="w-full mb-2 flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-700 py-1"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                <span>Prefer WhatsApp? Chat with us there!</span>
              </button>
            )}
            {chatStatus === 'closed' && !showRating && (
              <div className="mb-2 sm:mb-3 text-center text-xs sm:text-sm text-gray-500 bg-gray-50 py-2 rounded-lg">
                This chat has been closed. 
                <button 
                  onClick={() => setShowRating(true)}
                  className="text-primary hover:underline ml-1"
                >
                  Rate your experience
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm sm:text-base"
                disabled={!isConnected || chatStatus === 'closed'}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected || chatStatus === 'closed'}
                className="bg-primary disabled:bg-gray-400 disabled:opacity-60 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed group flex-shrink-0"
                aria-label="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
