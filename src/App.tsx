import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StoryDetails from "./pages/StoryDetails";
import CreateStory from "./pages/CreateStory";
import EditStory from "./pages/EditStory";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

const PrivateRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/story/:id" element={<Layout><StoryDetails /></Layout>} />
          
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><Layout><CreateStory /></Layout></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><Layout><EditStory /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute role="system_marshal"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
