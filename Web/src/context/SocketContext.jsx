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
      const newSocket = io("http://localhost:4000", {
        query: {
          userId: userData._id,
        },
      });

      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      newSocket.on("newMessage", (newMessage) => {
        // Agar receiver currently isi user ke chatbox me khula hai toh messages me append karo
        if (selectedUser?._id === newMessage.senderId) {
          dispatch(addMessage(newMessage));
        } else {
          // Warna notification add karo
          dispatch(
            addNotification({
              senderId: newMessage.senderId,
              message: newMessage.message,
              createdAt: newMessage.createdAt,
            })
          );
        }

        // Play subtle sound or show browser native notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Message Received", {
            body: newMessage.message,
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
