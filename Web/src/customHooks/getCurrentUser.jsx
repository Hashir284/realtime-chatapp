import { useEffect } from "react";
import api from "../Api/api";
import { useDispatch } from "react-redux";
import { setUserData, setLoadingUser } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/current");
        dispatch(setUserData(res.data));
      } catch (error) {
        dispatch(setUserData(null));
        dispatch(setLoadingUser(false));
      }
    };
    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
