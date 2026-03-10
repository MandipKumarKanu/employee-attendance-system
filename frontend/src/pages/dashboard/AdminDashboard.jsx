import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  CalendarDays,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getUsersApi } from "../../api/userApi";
import {
  getAttendanceSummaryApi,
  getDepartmentBreakdownApi,
} from "../../api/reportApi";
import { getPendingLeavesApi } from "../../api/leaveApi";
import { getDepartmentsApi } from "../../api/departmentApi";
import dayjs from "dayjs";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    todayPresent: 0,
    pendingLeaves: 0,
    departments: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptsRes, leavesRes, summaryRes, breakdownRes] =
          await Promise.allSettled([
            getUsersApi({ limit: 1 }),
            getDepartmentsApi(),
            getPendingLeavesApi({ limit: 5 }),
            getAttendanceSummaryApi({
              startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
              endDate: dayjs().format("YYYY-MM-DD"),
            }),
            getDepartmentBreakdownApi({
              startDate: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
              endDate: dayjs().format("YYYY-MM-DD"),
            }),
          ]);

        setStats({
          employees:
            usersRes.status === "fulfilled"
              ? usersRes.value.data.pagination?.total || 0
              : 0,
          departments:
            deptsRes.status === "fulfilled"
              ? deptsRes.value.data.data?.length || 0
              : 0,
          pendingLeaves:
            leavesRes.status === "fulfilled"
              ? leavesRes.value.data.pagination?.total || 0
              : 0,
          todayPresent: 0,
        });

        if (summaryRes.status === "fulfilled") {
          const data = summaryRes.value.data.data || [];
          setAttendanceData(
            data.slice(-14).map((d) => ({
              date: dayjs(d._id).format("MMM DD"),
              present: d.totalPresent + d.totalLate,
              absent: d.totalAbsent,
              late: d.totalLate,
            })),
          );

          const today = data.find(
            (d) => d._id === dayjs().format("YYYY-MM-DD"),
          );
          if (today) {
            setStats((s) => ({
              ...s,
              todayPresent: today.totalPresent + today.totalLate,
            }));
          }
        }

        if (breakdownRes.status === "fulfilled") {
          setDeptBreakdown(breakdownRes.value.data.data || []);
        }

        if (leavesRes.status === "fulfilled") {
          setPendingLeaves(leavesRes.value.data.data?.slice(0, 5) || []);
        }
      } catch {
        // Data will show as 0/empty
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your organization"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.employees}
          icon={Users}
          accent="brand"
        />
        <StatCard
          title="Present Today"
          value={stats.todayPresent}
          icon={Clock}
          accent="success"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={CalendarDays}
          accent="warning"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
          accent="info"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Attendance Trend</Card.Title>
            <Card.Description>Last 14 days</Card.Description>
          </Card.Header>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "13px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#2563eb"
                  fill="url(#presentGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="step"
                  dataKey="late"
                  stroke="#a1a1aa"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Department Overview</Card.Title>
            <Card.Description>Attendance rate by department</Card.Description>
          </Card.Header>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="department.code"
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  width={50}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{
                    background: "#18181b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "13px",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Bar
                  dataKey="attendanceRate"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Pending Leaves */}
      <Card>
        <Card.Header>
          <Card.Title>Pending Leave Requests</Card.Title>
        </Card.Header>
        {pendingLeaves.length === 0 ? (
          <p className="text-sm text-surface-400 py-4">
            No pending leave requests
          </p>
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div
                key={leave._id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </p>
                    <p className="text-xs text-surface-400">
                      {dayjs(leave.startDate).format("MMM DD")} -{" "}
                      {dayjs(leave.endDate).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>
                <Badge variant={leave.leaveType} dot>
                  {leave.leaveType}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
