import { useLocation, useNavigate } from "react-router";
import { Menu, Bell, Search, ChevronRight } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useUIStore from "../../stores/uiStore";
import Avatar from "../ui/Avatar";

const routeLabels = {
  "/dashboard": "Dashboard",
  "/attendance": "Check In",
  "/attendance/history": "My History",
  "/attendance/team": "Team Attendance",
  "/attendance/all": "All Attendance",
  "/leaves/apply": "Apply Leave",
  "/leaves/my": "My Leaves",
  "/leaves/approvals": "Leave Approvals",
  "/leaves/balances": "Leave Balances",
  "/employees": "Employees",
  "/employees/add": "Add Employee",
  "/departments": "Departments",
  "/reports": "Reports",
  "/settings/profile": "Profile",
  "/settings/organization": "Organization Settings",
};

export default function Topbar() {
  const { user } = useAuthStore();
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const location = useLocation();

  const pageTitle = routeLabels[location.pathname] || "Dashboard";

  const breadcrumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, i, arr) => {
      const path = "/" + arr.slice(0, i + 1).join("/");
      return {
        label:
          routeLabels[path] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        path,
        isLast: i === arr.length - 1,
      };
    });

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-surface-200/50 w-full transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-8 h-16 w-full max-w-[1600px] mx-auto">
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
            className="p-2 -ml-2 rounded-md text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-[13px] font-medium tracking-tight">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-2">
                {i > 0 && <span className="text-surface-300">/</span>}
                <span
                  className={
                    crumb.isLast
                      ? "text-surface-900"
                      : "text-surface-500 hover:text-surface-900 transition-colors cursor-pointer"
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          {/* Mobile title */}
          <h1 className="sm:hidden text-sm font-semibold text-surface-900">
            {pageTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-md text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-surface-200">
            <div className="text-right hidden md:block">
              <p className="text-[13px] font-semibold text-surface-900 leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-widest mt-1">
                {user?.role}
              </p>
            </div>
            <Avatar
              name={user ? `${user.firstName} ${user.lastName}` : ""}
              size="sm"
              className="ring-1 ring-surface-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
