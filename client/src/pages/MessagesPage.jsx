import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Smile,
  ShieldCheck,
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

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(activeConv.id, messageInput);
    setMessageInput('');
  };

  const handleSendDemoImage = () => {
    const demoImg =
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
    sendMessage(activeConv.id, 'Sharing a photo from our trail meetup! 🏔️', demoImg);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden h-[78vh] flex">
          {/* Left Column: Conversations List */}
          <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Conversations Header */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-[#071A2B] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FF5A1F]" />
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

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === activeConv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
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

                    <div className="flex-1 overflow-hidden text-xs">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold truncate ${isActive ? 'text-[#FF5A1F]' : 'text-[#071A2B]'}`}>
                          {conv.name}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">{conv.lastTime}</span>
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
              })}
            </div>
          </div>

          {/* Right Column: Active Chat Stream */}
          <div className="hidden sm:flex flex-1 flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#FF5A1F]/30"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-[#071A2B] flex items-center gap-1.5">
                    <span>{activeConv.name}</span>
                    {activeConv.type === 'group' && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        Group Chat
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeConv.subtitle || 'Active conversation with verified travelers'}
                  </p>
                </div>
              </div>

              {activeConv.tripId && (
                <button
                  onClick={() => navigate('trip-detail', { id: activeConv.tripId })}
                  className="btn-secondary-cb !py-1.5 !px-3.5 !text-xs font-semibold"
                >
                  View Trip Details →
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
              {activeConv.messages.map((msg) => {
                const isMe = msg.isSelf || msg.sender === currentUser?.name;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.avatar}
                        alt={msg.sender}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}

                    <div className={`max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-[10px] font-bold text-slate-500 ml-1">
                          {msg.sender}
                        </span>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#FF5A1F] text-white rounded-br-sm'
                            : 'bg-white border border-slate-200/90 text-[#071A2B] rounded-bl-sm'
                        }`}
                      >
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Attachment"
                            className="w-full max-h-48 object-cover rounded-xl mb-2"
                          />
                        )}
                        <p>{msg.text}</p>
                      </div>

                      <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-[#FF5A1F]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendDemoImage}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#FF5A1F] transition-colors cursor-pointer"
                title="Attach photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${activeConv.name}...`}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A1F]"
              />

              <button
                type="submit"
                className="p-2.5 rounded-full bg-[#FF5A1F] hover:bg-[#E04812] text-white shadow-md shadow-[#FF5A1F]/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
