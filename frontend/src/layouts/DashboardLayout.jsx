import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
