import { NavLink, useLocation } from "react-router";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "../../stores/authStore";
import useUIStore from "../../stores/uiStore";
import Avatar from "../ui/Avatar";

const getNavItems = (role) => {
  const items = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      label: "Attendance",
      icon: Clock,
      children: [
        { label: "Check In", to: "/attendance", icon: Clock },
        ...(role !== "admin"
          ? [{ label: "My History", to: "/attendance/history", icon: History }]
          : []),
        ...(role === "manager" || role === "admin"
          ? [
              {
                label: "Team Attendance",
                to: "/attendance/team",
                icon: UsersRound,
              },
            ]
          : []),
        ...(role === "admin"
          ? [
              {
                label: "All Attendance",
                to: "/attendance/all",
                icon: ListChecks,
              },
            ]
          : []),
      ],
    },
    {
      label: "Leaves",
      icon: CalendarDays,
      children: [
        ...(role !== "admin"
          ? [
              { label: "Apply Leave", to: "/leaves/apply", icon: CalendarDays },
              { label: "My Leaves", to: "/leaves/my", icon: ClipboardList },
            ]
          : []),
        ...(role === "manager" || role === "admin"
          ? [{ label: "Approvals", to: "/leaves/approvals", icon: Scale }]
          : []),
        ...(role === "admin"
          ? [
              {
                label: "Leave Balances",
                to: "/leaves/balances",
                icon: BarChart3,
              },
            ]
          : []),
      ],
    },
  ];

  if (role === "admin" || role === "manager") {
    items.push({
      label: "Employees",
      icon: Users,
      children: [
        { label: "All Employees", to: "/employees", icon: Users },
        ...(role === "admin"
          ? [{ label: "Add Employee", to: "/employees/add", icon: UserPlus }]
          : []),
      ],
    });
  }

  if (role === "admin") {
    items.push({
      label: "Departments",
      icon: Building2,
      to: "/departments",
    });
  }

  if (role === "admin" || role === "manager") {
    items.push({
      label: "Reports",
      icon: BarChart3,
      to: "/reports",
    });
  }

  items.push({
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Profile", to: "/settings/profile", icon: Settings },
      // ...(role === "admin"
      //   ? [
      //       {
      //         label: "Organization",
      //         to: "/settings/organization",
      //         icon: Briefcase,
      //       },
      //     ]
      //   : []),
    ],
  });

  return items;
};

function NavGroup({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = item.children?.some(
    (child) => location.pathname === child.to,
  );

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
          isActive
            ? "text-white bg-surface-800"
            : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/50",
        )}
      >
        <span className="flex items-center gap-2.5">
          <item.icon
            className={clsx(
              "w-4 h-4 transition-colors",
              isActive ? "text-white" : "text-surface-500",
            )}
          />
          {item.label}
        </span>
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 transition-transform text-surface-500",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-[20px] mt-1 space-y-0.5 my-1 border-l border-surface-800 pl-3 py-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                      isActive
                        ? "text-white font-medium"
                        : "text-surface-400 hover:text-surface-100",
                    )
                  }
                >
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
        "fixed top-0 left-0 h-screen flex flex-col z-30 transition-all duration-[300ms] ease-out-expo border-r border-surface-800",
        sidebarOpen ? "w-[260px]" : "w-0 overflow-hidden",
        "bg-[#09090b]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-800 shrink-0">
        <div className="w-8 h-8 rounded flex items-center justify-center relative">
          <div className="absolute w-5 h-5 border-[1.5px] border-brand-500 rounded-full"></div>
          <div className="absolute w-5 h-5 border-[1.5px] border-brand-500 rounded-full rotate-45"></div>
          <div className="absolute w-5 h-5 border-[1.5px] border-brand-500 rounded-full -rotate-45"></div>
          <div className="absolute w-1.5 h-1.5 bg-danger-500 rounded-full"></div>
        </div>
        <span className="text-[16px] font-display font-bold tracking-wide">
          <span className="text-danger-500">Nepa</span>
          <span className="text-brand-500">Tronix</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5 scrollbar-hide relative z-10">
        {navItems.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-white bg-surface-800"
                    : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/50",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-surface-500",
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-800">
        <div className="flex items-center gap-3">
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            size="sm"
            className="ring-1 ring-surface-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] font-medium text-surface-500 uppercase tracking-wider mt-0.5">
              {user.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
