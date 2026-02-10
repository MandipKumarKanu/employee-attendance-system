import { NavLink, useLocation } from 'react-router';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  Building2,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  History,
  UsersRound,
  ClipboardList,
  UserPlus,
  Scale,
  ListChecks,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';
import Avatar from '../ui/Avatar';

const getNavItems = (role) => {
  const items = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
    },
    {
      label: 'Attendance',
      icon: Clock,
      children: [
        { label: 'Check In', to: '/attendance', icon: Clock },
        ...(role !== 'admin' ? [{ label: 'My History', to: '/attendance/history', icon: History }] : []),
        ...(role === 'manager' || role === 'admin'
          ? [{ label: 'Team Attendance', to: '/attendance/team', icon: UsersRound }]
          : []),
        ...(role === 'admin'
          ? [{ label: 'All Attendance', to: '/attendance/all', icon: ListChecks }]
          : []),
      ],
    },
    {
      label: 'Leaves',
      icon: CalendarDays,
      children: [
        ...(role !== 'admin' ? [
          { label: 'Apply Leave', to: '/leaves/apply', icon: CalendarDays },
          { label: 'My Leaves', to: '/leaves/my', icon: ClipboardList },
        ] : []),
        ...(role === 'manager' || role === 'admin'
          ? [{ label: 'Approvals', to: '/leaves/approvals', icon: Scale }]
          : []),
        ...(role === 'admin'
          ? [{ label: 'Leave Balances', to: '/leaves/balances', icon: BarChart3 }]
          : []),
      ],
    },
  ];

  if (role === 'admin' || role === 'manager') {
    items.push({
      label: 'Employees',
      icon: Users,
      children: [
        { label: 'All Employees', to: '/employees', icon: Users },
        ...(role === 'admin' ? [{ label: 'Add Employee', to: '/employees/add', icon: UserPlus }] : []),
      ],
    });
  }

  if (role === 'admin') {
    items.push({
      label: 'Departments',
      icon: Building2,
      to: '/departments',
    });
  }

  if (role === 'admin' || role === 'manager') {
    items.push({
      label: 'Reports',
      icon: BarChart3,
      to: '/reports',
    });
  }

  items.push({
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Profile', to: '/settings/profile', icon: Settings },
      ...(role === 'admin' ? [{ label: 'Organization', to: '/settings/organization', icon: Briefcase }] : []),
    ],
  });

  return items;
};

function NavGroup({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = item.children?.some((child) => location.pathname === child.to);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'text-brand-500 bg-brand-500/10'
            : 'text-surface-300 hover:text-surface-100 hover:bg-surface-800'
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className="w-[18px] h-[18px]" />
          {item.label}
        </span>
        <ChevronDown
          className={clsx('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-0.5 border-l border-surface-700 pl-3">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                      isActive
                        ? 'text-brand-500 bg-brand-500/10 font-medium'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                    )
                  }
                >
                  <child.icon className="w-4 h-4" />
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen bg-surface-900 flex flex-col z-30 transition-all duration-300',
        sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-800">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <span className="text-sm font-display font-bold text-white">E</span>
        </div>
        <span className="text-base font-display font-bold text-white">EAS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-brand-500 bg-brand-500/10 border-l-[3px] border-brand-500 -ml-px'
                    : 'text-surface-300 hover:text-surface-100 hover:bg-surface-800'
                )
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-800 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-surface-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-surface-500 hover:text-danger-400 hover:bg-surface-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
