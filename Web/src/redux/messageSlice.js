import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    notifications: [], // array of notification objects: { senderId, message, senderName, timestamp }
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotificationsForUser: (state, action) => {
      const senderId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.senderId !== senderId
      );
    },
  },
});

export const {
  setMessages,
  addMessage,
  addNotification,
  clearNotificationsForUser,
} = messageSlice.actions;

export default messageSlice.reducer;
