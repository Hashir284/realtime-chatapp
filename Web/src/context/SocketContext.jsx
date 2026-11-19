import { createContext, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setOnlineUsers } from "../redux/userSlice";
import { addMessage, addNotification } from "../redux/messageSlice";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userData, selectedUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Browser notification permission request
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (userData?._id) {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const socketURL = isLocal ? "http://localhost:4000" : "/";

      const newSocket = io(socketURL, {
        query: {
          userId: userData._id,
        },
      });

      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      newSocket.on("newMessage", (newMessage) => {
        if (selectedUser?._id === newMessage.senderId) {
          dispatch(addMessage(newMessage));
        } else {
          dispatch(
            addNotification({
              senderId: newMessage.senderId,
              message: newMessage.message || (newMessage.image ? "Sent an image" : ""),
              createdAt: newMessage.createdAt,
            })
          );
        }

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Message Received", {
            body: newMessage.message || "Sent you an image",
            icon: "/images.png",
          });
        }
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [userData?._id, selectedUser?._id, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
