import { useLocation, useNavigate } from 'react-router';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';
import Avatar from '../ui/Avatar';

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/attendance': 'Check In',
  '/attendance/history': 'My History',
  '/attendance/team': 'Team Attendance',
  '/attendance/all': 'All Attendance',
  '/leaves/apply': 'Apply Leave',
  '/leaves/my': 'My Leaves',
  '/leaves/approvals': 'Leave Approvals',
  '/leaves/balances': 'Leave Balances',
  '/employees': 'Employees',
  '/employees/add': 'Add Employee',
  '/departments': 'Departments',
  '/reports': 'Reports',
  '/settings/profile': 'Profile',
  '/settings/organization': 'Organization Settings',
};

export default function Topbar() {
  const { user } = useAuthStore();
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const location = useLocation();

  const pageTitle = routeLabels[location.pathname] || 'Dashboard';

  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, i, arr) => {
      const path = '/' + arr.slice(0, i + 1).join('/');
      return {
        label: routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path,
        isLast: i === arr.length - 1,
      };
    });

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                toggleMobileSidebar();
              } else {
                toggleSidebar();
              }
            }}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-surface-300" />}
                <span
                  className={
                    crumb.isLast
                      ? 'text-surface-800 font-medium'
                      : 'text-surface-400'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          {/* Mobile title */}
          <h1 className="sm:hidden text-base font-semibold text-surface-800">{pageTitle}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-surface-100">
            <Avatar name={user ? `${user.firstName} ${user.lastName}` : ''} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-surface-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
