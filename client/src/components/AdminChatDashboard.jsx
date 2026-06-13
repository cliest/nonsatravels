import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faPaperPlane,
  faCircle,
  faCheck,
  faCheckDouble,
  faUserCircle,
  faBolt,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { initializeSocket } from '../services/socket';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminChatDashboard = () => {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [cannedResponses, setCannedResponses] = useState([]);
  const [showCannedDropdown, setShowCannedDropdown] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats
  const loadChats = async () => {
    try {
      const statusFilter = filter === 'all' ? '' : filter;
      const response = await api.get(`/chat?status=${statusFilter}`);
      
      if (response.data.success) {
        setChats(response.data.data);
      }
    } catch (_error) {
      toast.error('Failed to load chats');
    }
  };

  // Load chat statistics
  const loadStats = async () => {
    try {
      const response = await api.get('/chat/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (_error) {
      // Silent fail - stats are optional
    }
  };

  // Load canned responses
  const loadCannedResponses = async () => {
    try {
      const response = await api.get('/canned-responses?isActive=true');
      if (response.data.success) {
        setCannedResponses(response.data.data);
      }
    } catch (_error) {
      // Silent fail - canned responses are optional
    }
  };

  // Initialize Socket.IO
  useEffect(() => {
    const socket = initializeSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('admin-notification', (notification) => {
      loadChats();
      loadStats();
      toast.success(`New message from ${notification.userName}`);
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      loadChats();
    });

    socket.on('user-typing', () => {
      setIsTyping(true);
    });

    socket.on('user-stop-typing', () => {
      setIsTyping(false);
    });

    socket.on('messages-read', () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === 'admin' ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('admin-notification');
        socketRef.current.off('new-message');
        socketRef.current.off('user-typing');
        socketRef.current.off('user-stop-typing');
        socketRef.current.off('messages-read');
      }
    };
  }, []);

  // Load data on mount and filter change
  useEffect(() => {
    loadChats();
    loadStats();
    loadCannedResponses();
  }, [filter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCannedDropdown && !event.target.closest('.canned-responses-container')) {
        setShowCannedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCannedDropdown]);

  // Join chat room when selecting a chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);

    if (socketRef.current) {
      socketRef.current.emit('join-chat', {
        chatId: chat.id,
        userId: user.id,
        isAdmin: true,
      });

      // Mark messages as read
      socketRef.current.emit('mark-read', {
        chatId: chat.id,
        reader: 'admin',
      });
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !selectedChat || !socketRef.current) return;

    const messageData = {
      chatId: selectedChat.id,
      sender: 'admin',
      senderName: user.fullName || 'Support Team',
      senderId: user.id,
      message: inputMessage.trim(),
    };

    socketRef.current.emit('send-message', messageData);
    setInputMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit('stop-typing', { chatId: selectedChat.id });
  };

  // Handle typing
  const handleTyping = (e) => {
    setInputMessage(e.target.value);

    if (!socketRef.current || !selectedChat) return;

    socketRef.current.emit('typing', {
      chatId: selectedChat.id,
      userName: user.fullName || 'Support Team',
      isAdmin: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', { chatId: selectedChat.id });
    }, 1000);
  };

  // Update chat status
  const handleStatusUpdate = async (status) => {
    if (!selectedChat) return;

    try {
      await api.patch(`/chat/${selectedChat.id}/status`, { status });
      
      if (socketRef.current) {
        socketRef.current.emit('update-status', {
          chatId: selectedChat.id,
          status,
        });
      }

      setSelectedChat({ ...selectedChat, status });
      loadChats();
      loadStats();
      toast.success(`Chat marked as ${status}`);
    } catch (_error) {
      toast.error('Failed to update chat status');
    }
  };

  // Insert canned response
  const handleInsertCannedResponse = async (response) => {
    setInputMessage(response.message);
    setShowCannedDropdown(false);
    
    // Increment usage count
    try {
      await api.post(`/canned-responses/${response.id}/use`);
    } catch (_error) {
      // Silent fail - usage count is optional
    }
  };

  // Send chat transcript
  const handleSendTranscript = async () => {
    if (!selectedChat) return;

    try {
      await api.post(`/chat/${selectedChat.id}/transcript`);
      toast.success('Chat transcript sent to customer');
    } catch (_error) {
      toast.error('Failed to send transcript');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-primary text-white p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <FontAwesomeIcon icon={faComments} />
          Chat Support Dashboard
        </h2>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
            <p className="text-sm opacity-90">Total Chats</p>
            <p className="text-3xl font-bold">{stats.totalChats || 0}</p>
          </div>
          <div className="bg-green-500/90 p-4 rounded-xl hover:bg-green-500 transition-all shadow-lg">
            <p className="text-sm opacity-90">Active</p>
            <p className="text-3xl font-bold">{stats.activeChats || 0}</p>
          </div>
          <div className="bg-accent p-4 rounded-xl hover:bg-accent/90 transition-all shadow-lg text-gray-900">
            <p className="text-sm opacity-90">Pending</p>
            <p className="text-3xl font-bold">{stats.pendingChats || 0}</p>
          </div>
          <div className="bg-red-500/90 p-4 rounded-xl hover:bg-red-500 transition-all shadow-lg">
            <p className="text-sm opacity-90">Unread</p>
            <p className="text-3xl font-bold">{stats.unreadMessages || 0}</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center gap-2">
          <FontAwesomeIcon
            icon={faCircle}
            className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-400'}`}
          />
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {/* Filter */}
          <div className="p-4 border-b border-gray-200">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="all">All Chats</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Chats */}
          <div className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FontAwesomeIcon icon={faComments} className="text-4xl mb-2" />
                <p>No chats found</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-all rounded-lg mx-2 my-1 ${
                    selectedChat?.id === chat.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="text-2xl text-gray-400"
                      />
                      <div>
                        <p className="font-semibold">{chat.userName}</p>
                        <p className="text-xs text-gray-500">{chat.userEmail}</p>
                      </div>
                    </div>
                    {chat.unreadUserMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadUserMessages}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.messages[chat.messages.length - 1]?.message || 'No messages'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        chat.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : chat.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {chat.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedChat.userName}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.userEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate('active')}
                    disabled={selectedChat.status === 'active'}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('closed')}
                    disabled={selectedChat.status === 'closed'}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-all hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                    className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                      msg.sender === 'admin'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'user' && (
                        <p className="text-xs font-semibold mb-1">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p
                          className={`text-xs ${
                            msg.sender === 'admin'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {msg.sender === 'admin' && (
                          <FontAwesomeIcon
                            icon={msg.read ? faCheckDouble : faCheck}
                            className={`text-xs ${
                              msg.read ? 'text-blue-200' : 'text-blue-300'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 bg-white"
              >
                <div className="flex gap-2 items-start">
                  {/* Canned Responses Dropdown */}
                  <div className="relative canned-responses-container">
                    <button
                      type="button"
                      onClick={() => setShowCannedDropdown(!showCannedDropdown)}
                      disabled={!isConnected || selectedChat.status === 'closed'}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 px-4 py-3 rounded-xl transition-all disabled:cursor-not-allowed"
                      title="Quick replies"
                    >
                      <FontAwesomeIcon icon={faBolt} />
                    </button>
                    
                    {showCannedDropdown && (
                      <div className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                          <p className="text-sm font-semibold text-gray-700">Quick Replies</p>
                        </div>
                        {cannedResponses.length > 0 ? (
                          <div className="p-2">
                            {cannedResponses.map((response) => (
                              <button
                                key={response.id}
                                type="button"
                                onClick={() => handleInsertCannedResponse(response)}
                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {response.title}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {response.message}
                                </p>
                                {response.shortcut && (
                                  <p className="text-xs text-primary mt-1">
                                    Shortcut: {response.shortcut}
                                  </p>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No quick replies available
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    disabled={!isConnected || selectedChat.status === 'closed'}
                  />
                  
                  {/* Send Transcript Button */}
                  <button
                    type="button"
                    onClick={handleSendTranscript}
                    disabled={!isConnected}
                    className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 px-4 py-3 rounded-xl transition-all disabled:cursor-not-allowed"
                    title="Send chat transcript to customer"
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !isConnected || selectedChat.status === 'closed'}
                    className="bg-primary disabled:bg-gray-400 disabled:opacity-60 text-white px-6 py-3 rounded-xl transition-all hover:shadow-lg disabled:cursor-not-allowed group"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FontAwesomeIcon icon={faComments} className="text-6xl mb-4" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatDashboard;
