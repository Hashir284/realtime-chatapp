import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { useSelector } from "react-redux";
import useGetCurrentUser from "./customHooks/getCurrentUser";

function App() {
  useGetCurrentUser();
  const { userData, loadingUser } = useSelector((state) => state.user);

  // Jab tak backend se user authentication verify nahi hoti, tab tak loader show karein
  // Is se refresh karne par Login page ka jhatka (flicker) nahi lagega
  if (loadingUser) {
    return (
      <div className="h-screen w-full bg-[var(--bg-app)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
          <span className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">
            Loading ChatFlow...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/login"
        element={userData ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/signup"
        element={userData ? <Navigate to="/dashboard" /> : <SignUp />}
      />
      <Route
        path="/dashboard"
        element={userData ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
