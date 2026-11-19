import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    selectedUser: null,
    onlineUsers: [],
    loadingUser: true, // Auth verification initially pending
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loadingUser = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setLoadingUser: (state, action) => {
      state.loadingUser = action.payload;
    },
  },
});

export const {
  setUserData,
  setSelectedUser,
  setOnlineUsers,
  setLoadingUser,
} = userSlice.actions;

export default userSlice.reducer;
