import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../Api/api";
import {
  setUserData,
  setSelectedUser,
} from "../redux/userSlice";
import {
  setMessages,
  addMessage,
  clearNotificationsForUser,
} from "../redux/messageSlice";
import {
  FiSend,
  FiLogOut,
  FiUser,
  FiMessageSquare,
  FiSearch,
  FiBell,
  FiCheck,
} from "react-icons/fi";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, selectedUser, onlineUsers } = useSelector((state) => state.user);
  const { messages, notifications } = useSelector((state) => state.message);

  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/user/all");
        setAllUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    if (userData) {
      fetchUsers();
    }
  }, [userData]);

  // Fetch messages whenever selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;
      try {
        setLoadingMessages(true);
        const res = await api.get(`/message/${selectedUser._id}`);
        dispatch(setMessages(res.data));
        // Clear unread notifications for this selected user
        dispatch(clearNotificationsForUser(selectedUser._id));
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, dispatch]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser?._id) return;

    try {
      setSending(true);
      const text = messageInput;
      setMessageInput("");

      const res = await api.post(`/message/send/${selectedUser._id}`, {
        message: text,
      });

      dispatch(addMessage(res.data));
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(setUserData(null));
      dispatch(setSelectedUser(null));
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const filteredUsers = allUsers.filter((u) =>
    u.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Sidebar: Users List */}
      <aside className="w-80 md:w-96 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {/* User Profile Bar */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center font-bold text-lg">
              {userData?.userName ? userData.userName[0].toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-tight">
                {userData?.userName || "My Account"}
              </h2>
              <span className="text-xs text-[var(--status-online)] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--status-online)] inline-block"></span>
                Online
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--status-error)] transition cursor-pointer"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-input)] text-xs rounded-xl pl-9 pr-3 py-2 border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-2 py-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Conversations
          </div>
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-6">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineUsers.includes(user._id);
              const userNotifications = notifications.filter(
                (n) => n.senderId === user._id
              );

              return (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? "bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                      : "hover:bg-[var(--bg-input)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center font-medium">
                      {user.userName ? user.userName[0].toUpperCase() : <FiUser />}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--status-online)] border-2 border-[var(--bg-surface)]"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">
                        {user.userName}
                      </p>
                      {userNotifications.length > 0 && (
                        <span className="bg-[var(--accent-primary)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          {userNotifications.length}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[var(--bg-app)]">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <header className="h-16 px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] flex items-center justify-center font-bold">
                    {selectedUser.userName ? selectedUser.userName[0].toUpperCase() : "U"}
                  </div>
                  {onlineUsers.includes(selectedUser._id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--status-online)] border-2 border-[var(--bg-surface)]"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedUser.userName}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Notification count badge if any */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1 rounded-full text-xs font-medium">
                  <FiBell className="w-3.5 h-3.5" />
                  <span>{notifications.length} new alert(s)</span>
                </div>
              )}
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] space-y-2">
                  <FiMessageSquare className="w-10 h-10 stroke-[1.5]" />
                  <p className="text-sm">No messages yet. Say hello to {selectedUser.userName}!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === userData?._id;
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-[var(--accent-primary)] text-white rounded-br-xs"
                            : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-xs"
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <div
                          className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                            isMe ? "text-white/80" : "text-[var(--text-muted)]"
                          }`}
                        >
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                          {isMe && <FiCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input field */}
            <footer className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${selectedUser.userName}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-[var(--bg-input)] text-sm rounded-xl px-4 py-3 border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)]"
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 text-white p-3 rounded-xl transition cursor-pointer flex items-center justify-center shadow-md"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4">
              <FiMessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Welcome to ChatFlow, {userData?.userName || "Friend"}!
            </h2>
            <p className="text-sm max-w-sm">
              Select a friend from the left sidebar to start a real-time conversation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
