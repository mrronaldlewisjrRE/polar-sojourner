import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, X, MessageCircle, User, Users, Circle, Image, Paperclip, Loader2, Trash2 } from 'lucide-react';

export default function ChatInterface({ isOpen, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChannel, setActiveChannel] = useState(null); // null = Public, UUID = DM
    const [profiles, setProfiles] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});

    // File Upload State
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const fetchMessages = useCallback(async (channelId) => {
        let query = supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);

        if (channelId) {
            // DM: (sender = ME and recipient = THEM) OR (sender = THEM and recipient = ME)
            query = query.or(`and(sender_id.eq.${user.id},recipient_id.eq.${channelId}),and(sender_id.eq.${channelId},recipient_id.eq.${user.id})`);
        } else {
            // Public: recipient_id is null
            query = query.is('recipient_id', null);
        }

        const { data } = await query;
        if (data) setMessages(data);
    }, [user.id]);

    // 1. Fetch Profiles & Initial Messages
    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoading(true);
            // Fetch Profiles
            const { data: profilesData } = await supabase.from('profiles').select('*');
            const profileMap = {};
            profilesData?.forEach(p => profileMap[p.id] = p);
            setProfiles(profileMap);

            // Fetch Messages
            await fetchMessages(activeChannel);
            setLoading(false);
        };

        fetchData();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        // 3. Presence (Online Status)
        const presence = supabase.channel('online-users')
            .on('presence', { event: 'sync' }, () => {
                const state = presence.presenceState();
                const users = {};
                for (const id in state) {
                    const info = state[id][0];
                    users[info.user_id] = true;
                }
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presence.track({ user_id: user.id });
                }
            });

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(presence);
        };
    }, [isOpen, activeChannel, user.id, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        try {
            setUploading(true);
            let attachmentUrl = null;
            let attachmentType = null;

            // Upload File if exists
            if (attachment) {
                const fileExt = attachment.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('team-files')
                    .upload(filePath, attachment);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('team-files').getPublicUrl(filePath);
                attachmentUrl = data.publicUrl;
                attachmentType = attachment.type.startsWith('image/') ? 'image' : 'file';
            }

            const { error } = await supabase.from('messages').insert({
                content: newMessage,
                sender_id: user.id,
                recipient_id: activeChannel, // null or uuid
                attachment_url: attachmentUrl,
                attachment_type: attachmentType
            });

            if (!error) {
                setNewMessage('');
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Filter messages for display (Double check ensuring real-time pushed messages filter correctly)
    const displayMessages = messages.filter(m => {
        if (activeChannel) {
            return (m.sender_id === user.id && m.recipient_id === activeChannel) ||
                (m.sender_id === activeChannel && m.recipient_id === user.id);
        } else {
            return m.recipient_id === null;
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                    <MessageCircle className="text-cdh-red" size={20} />
                    <h2 className="font-bold text-gray-800 dark:text-white">Team Chat</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar (Channel List - Mini) */}
                <div className="w-16 bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-4 gap-4 border-r border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => { setActiveChannel(null); fetchMessages(null); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!activeChannel ? 'bg-cdh-red text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 hover:scale-105'}`}
                        title="Public Team Chat"
                    >
                        <Users size={20} />
                    </button>

                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-700"></div>

                    {Object.values(profiles).filter(p => p.id !== user.id).map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => { setActiveChannel(profile.id); fetchMessages(profile.id); }}
                            className={`relative w-10 h-10 rounded-full overflow-hidden transition-all border-2 ${activeChannel === profile.id ? 'border-cdh-red scale-110' : 'border-transparent hover:border-gray-300'}`}
                            title={profile.full_name || 'User'}
                        >
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {profile.full_name?.[0] || 'U'}
                                </div>
                            )}
                            {/* Online Dot */}
                            {onlineUsers[profile.id] && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium flex items-center gap-2">
                        {activeChannel ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {profiles[activeChannel]?.full_name || 'Unknown'}
                            </>
                        ) : (
                            <>
                                <Users size={16} /> Public Team Channel
                            </>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading && <div className="text-center text-gray-400 text-sm">Loading messages...</div>}

                        {!loading && displayMessages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                No messages yet. Say hello! 👋
                            </div>
                        )}

                        {displayMessages.map((msg, i) => {
                            const isMe = msg.sender_id === user.id;
                            const showAvatar = !isMe && (i === 0 || displayMessages[i - 1]?.sender_id !== msg.sender_id);

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                    {!isMe && (
                                        <div className="w-8 mr-2 flex-shrink-0">
                                            {showAvatar ? (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                    {profiles[msg.sender_id]?.avatar_url ? (
                                                        <img src={profiles[msg.sender_id].avatar_url} className="w-full h-full" alt="avatar" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                            {profiles[msg.sender_id]?.full_name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <div className="w-8 h-8" />}
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe
                                        ? 'bg-cdh-red text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-none'
                                        }`}>

                                        {/* Attachment Rendering */}
                                        {msg.attachment_url && msg.attachment_type === 'image' && (
                                            <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                                                <img src={msg.attachment_url} alt="Shared" className="max-w-full h-auto max-h-48 object-cover" />
                                            </div>
                                        )}
                                        {msg.attachment_url && msg.attachment_type !== 'image' && (
                                            <div className="mb-2">
                                                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline opacity-90 hover:opacity-100">
                                                    <Paperclip size={14} /> View Attachment
                                                </a>
                                            </div>
                                        )}

                                        <p>{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-red-100' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        {/* File Preview */}
                        {attachment && (
                            <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg max-w-max">
                                {attachment.type.startsWith('image/') ? (
                                    <Image size={16} className="text-gray-500" />
                                ) : (
                                    <Paperclip size={16} className="text-gray-500" />
                                )}
                                <span className="text-xs truncate max-w-[150px] dark:text-gray-300">{attachment.name}</span>
                                <button type="button" onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Attach File"
                            >
                                <Paperclip size={20} />
                            </button>

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={uploading ? "Uploading..." : "Type a message..."}
                                disabled={uploading}
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-cdh-red outline-none disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !attachment) || uploading}
                                className="p-2 bg-cdh-red hover:bg-cdh-dark text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 flex items-center justify-center"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
