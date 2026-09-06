import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Generate from './pages/Generate.jsx';
import MyImages from './pages/MyImages.jsx';
import Favorites from './pages/Favorites.jsx';
import PromptHistory from './pages/PromptHistory.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="generate" element={<Generate />} />
        <Route path="images" element={<MyImages />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="history" element={<PromptHistory />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
