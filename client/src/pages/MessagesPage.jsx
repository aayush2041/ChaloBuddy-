import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  CheckCheck,
  ArrowLeft,
  Users,
  Search,
} from 'lucide-react';

export default function MessagesPage() {
  const {
    conversations,
    activeConvId,
    setActiveConvId,
    sendMessage,
    currentUser,
    navigate,
  } = useStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Responsive view state for mobile screens (< 768px): 'list' or 'chat'
  const [mobileView, setMobileView] = useState('list');
  const messagesEndRef = useRef(null);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll message feed whenever active conversation changes or new message is added
  useEffect(() => {
    if (mobileView === 'chat' || window.innerWidth >= 768) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages?.length, activeConvId, mobileView]);

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    setMobileView('chat');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv) return;
    sendMessage(activeConv.id, messageInput);
    setMessageInput('');
  };

  const handleSendDemoImage = () => {
    if (!activeConv) return;
    const demoImg =
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
    sendMessage(activeConv.id, 'Sharing a photo from our trail meetup! 🏔️', demoImg);
  };

  return (
    <div className="bg-[#F5F7F8] pt-[72px] md:pt-24 pb-0 md:pb-20 h-[calc(100dvh-56px)] md:h-auto md:min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-0 sm:px-4 md:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-none sm:rounded-2xl md:rounded-3xl border-0 sm:border border-slate-200/90 shadow-none sm:shadow-xl overflow-hidden flex-1 md:h-[78vh] lg:h-[80vh] flex flex-col md:flex-row min-h-0">
          
          {/* ======================================================== */}
          {/* Left Column: Conversations List                           */}
          {/* On mobile: visible when mobileView === 'list'             */}
          {/* On desktop: always visible (md:flex)                      */}
          {/* ======================================================== */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex-col bg-slate-50/50 flex-shrink-0 ${
              mobileView === 'list' ? 'flex h-full' : 'hidden md:flex'
            }`}
          >
            {/* Conversations Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white space-y-2.5 sm:space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-sm sm:text-base text-[#071A2B] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5A1F]" />
                  <span>Messages</span>
                </h2>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {conversations.length} Active
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search group or buddy..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Conversation List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No conversations match your search.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConv?.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors active:bg-orange-100/50 ${
                        isActive ? 'bg-orange-50/70 border-l-4 border-l-[#FF5A1F]' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                        {conv.type === 'group' && (
                          <span className="absolute -bottom-1 -right-1 bg-[#071A2B] text-white p-0.5 rounded-full text-[9px]">
                            <Users className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 overflow-hidden text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`font-bold truncate ${isActive ? 'text-[#FF5A1F]' : 'text-[#071A2B]'}`}>
                            {conv.name}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{conv.lastTime}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-[#FF5A1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* Right Column: Active Chat Stream                          */}
          {/* On mobile: visible when mobileView === 'chat'             */}
          {/* On desktop: always visible (md:flex)                      */}
          {/* ======================================================== */}
          <div
            className={`flex-1 flex-col bg-white min-w-0 ${
              mobileView === 'chat' ? 'flex h-full' : 'hidden md:flex'
            }`}
          >
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 flex-shrink-0 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Mobile Back Button: Returns to Conversation List */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-[#071A2B] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                      title="Back to conversation list"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5 text-[#071A2B]" />
                    </button>

                    <div className="relative flex-shrink-0">
                      <img
                        src={activeConv.avatar}
                        alt={activeConv.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-cover ring-2 ring-[#FF5A1F]/30"
                      />
                      {activeConv.type === 'group' && (
                        <span className="absolute -bottom-1 -right-1 bg-[#071A2B] text-white p-0.5 rounded-full text-[8px]">
                          <Users className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#071A2B] truncate">
                          {activeConv.name}
                        </h3>
                        {activeConv.type === 'group' && (
                          <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex-shrink-0 hidden xs:inline-block">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                        {activeConv.subtitle || 'Active conversation with verified travelers'}
                      </p>
                    </div>
                  </div>

                  {activeConv.tripId && (
                    <button
                      onClick={() => navigate('trip-detail', { id: activeConv.tripId })}
                      className="btn-secondary-cb !py-1 !px-2.5 sm:!py-1.5 sm:!px-3.5 !text-[11px] sm:!text-xs font-semibold flex-shrink-0 whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">View Trip Details →</span>
                      <span className="sm:hidden">Trip Details →</span>
                    </button>
                  )}
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50/40 min-h-0">
                  {activeConv.messages.map((msg) => {
                    const isMe = msg.isSelf || msg.sender === currentUser?.name;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 sm:gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.avatar}
                            alt={msg.sender}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}

                        <div className={`max-w-[82%] sm:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <span className="text-[10px] font-bold text-slate-500 ml-1 block truncate">
                              {msg.sender}
                            </span>
                          )}

                          <div
                            className={`p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm break-words [overflow-wrap:anywhere] ${
                              isMe
                                ? 'bg-[#FF5A1F] text-white rounded-br-sm'
                                : 'bg-white border border-slate-200/90 text-[#071A2B] rounded-bl-sm'
                            }`}
                          >
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Attachment"
                                className="w-full max-h-40 sm:max-h-48 object-cover rounded-xl mb-2"
                              />
                            )}
                            <p className="break-words [overflow-wrap:anywhere]">{msg.text}</p>
                          </div>

                          <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.time}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#FF5A1F]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Composer Bar */}
                <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-slate-200 bg-white flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleSendDemoImage}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#FF5A1F] transition-colors cursor-pointer flex-shrink-0"
                    title="Attach photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeConv.name}...`}
                    className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F]"
                  />

                  <button
                    type="submit"
                    className="p-2 sm:p-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#E04812] text-white shadow-md shadow-[#FF5A1F]/30 transition-all cursor-pointer flex-shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">No conversation selected</p>
                <p className="text-xs text-slate-400 mt-1">Choose a conversation from the list to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
