import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import useAuthStore from './stores/authStore';
import { FullPageSpinner } from './components/ui/Spinner';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';

// Attendance Pages
import CheckInPage from './pages/attendance/CheckInPage';
import AttendanceHistoryPage from './pages/attendance/AttendanceHistoryPage';
import TeamAttendancePage from './pages/attendance/TeamAttendancePage';
import AllAttendancePage from './pages/attendance/AllAttendancePage';

// Leave Pages
import ApplyLeavePage from './pages/leave/ApplyLeavePage';
import MyLeavesPage from './pages/leave/MyLeavesPage';
import LeaveApprovalsPage from './pages/leave/LeaveApprovalsPage';
import LeaveBalancePage from './pages/leave/LeaveBalancePage';

// Department Pages
import DepartmentListPage from './pages/departments/DepartmentListPage';
import DepartmentDetailPage from './pages/departments/DepartmentDetailPage';

// Employee Pages
import EmployeeListPage from './pages/employees/EmployeeListPage';
import AddEmployeePage from './pages/employees/AddEmployeePage';
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Settings
import ProfilePage from './pages/settings/ProfilePage';
import OrganizationSettingsPage from './pages/settings/OrganizationSettingsPage';

// Other
import NotFoundPage from './pages/NotFoundPage';

function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  const roleRoutes = {
    admin: '/dashboard/admin',
    manager: '/dashboard/manager',
    employee: '/dashboard/employee',
  };

  return <Navigate to={roleRoutes[user.role] || '/dashboard/employee'} replace />;
}

export default function App() {
  const { isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) return <FullPageSpinner />;

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - role redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/employee"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance" element={<CheckInPage />} />
        <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
        <Route
          path="/attendance/team"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <TeamAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/all"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AllAttendancePage />
            </ProtectedRoute>
          }
        />

        {/* Leaves */}
        <Route path="/leaves/apply" element={<ApplyLeavePage />} />
        <Route path="/leaves/my" element={<MyLeavesPage />} />
        <Route
          path="/leaves/approvals"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <LeaveApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves/balances"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LeaveBalancePage />
            </ProtectedRoute>
          }
        />

        {/* Departments */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <DepartmentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <EmployeeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/add"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <EmployeeDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route
          path="/settings/organization"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrganizationSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
