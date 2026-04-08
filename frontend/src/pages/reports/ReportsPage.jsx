import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  CalendarDays,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/ui/Spinner";
import {
  getAttendanceSummaryApi,
  getDepartmentBreakdownApi,
  getLeaveAnalyticsApi,
  getMonthlyOverviewApi,
  exportCSVApi,
  exportPDFApi,
} from "../../api/reportApi";
import { getDepartmentsApi } from "../../api/departmentApi";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [isExporting, setIsExporting] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState(
    dayjs().subtract(30, "day").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [deptFilter, setDeptFilter] = useState("");

  // Data
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);
  const [leaveAnalytics, setLeaveAnalytics] = useState(null);
  const [monthlyOverview, setMonthlyOverview] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, deptFilter]);

  const fetchDepartments = async () => {
    try {
      const { data } = await getDepartmentsApi();
      setDepartments(data.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = { startDate, endDate };
      if (deptFilter) params.department = deptFilter;

      const [summaryRes, breakdownRes, leaveRes, monthlyRes] =
        await Promise.allSettled([
          getAttendanceSummaryApi(params),
          getDepartmentBreakdownApi(params),
          getLeaveAnalyticsApi(params),
          getMonthlyOverviewApi(params),
        ]);

      if (summaryRes.status === "fulfilled") {
        const data = summaryRes.value.data.data;
        setAttendanceTrend(
          Array.isArray(data)
            ? data.map((d) => ({
                date: dayjs(d._id).format("MMM DD"),
                present: d.totalPresent + d.totalLate,
                absent: d.totalAbsent,
                late: d.totalLate,
              }))
            : [],
        );
      }

      if (breakdownRes.status === "fulfilled") {
        const data = breakdownRes.value.data.data;
        setDeptBreakdown(Array.isArray(data) ? data : []);
      }

      if (leaveRes.status === "fulfilled") {
        setLeaveAnalytics(leaveRes.value.data.data || null);
      }

      if (monthlyRes.status === "fulfilled") {
        setMonthlyOverview(monthlyRes.value.data.data || null);
      }
    } catch {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type) => {
    setIsExporting(type);
    try {
      const params = { startDate, endDate };
      if (deptFilter) params.department = deptFilter;

      const response =
        type === "csv"
          ? await exportCSVApi(params)
          : await exportPDFApi(params);
      const blob = new Blob([response.data], {
        type: type === "csv" ? "text/csv" : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${startDate}-to-${endDate}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  // Stat computations
  const totalPresent = attendanceTrend.reduce((s, d) => s + d.present, 0);
  const totalLate = attendanceTrend.reduce((s, d) => s + d.late, 0);
  const totalAbsent = attendanceTrend.reduce((s, d) => s + d.absent, 0);
  const avgAttendance =
    attendanceTrend.length > 0
      ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) || 0
      : 0;

  const tooltipStyle = {
    background: "#0f172a",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    boxShadow:
      "0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.03)",
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analytics and insights for attendance and leave"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              isLoading={isExporting === "csv"}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              isLoading={isExporting === "pdf"}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="sm:w-44"
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="sm:w-44"
        />
        <Select
          label="Department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="sm:w-48"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Present"
              value={totalPresent}
              icon={Users}
              accent="success"
            />
            <StatCard
              title="Total Absent"
              value={totalAbsent}
              icon={Users}
              accent="danger"
            />
            <StatCard
              title="Late Arrivals"
              value={totalLate}
              icon={Clock}
              accent="warning"
            />
            <StatCard
              title="Avg Attendance"
              value={`${avgAttendance}%`}
              icon={TrendingUp}
              accent="brand"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Attendance Trend */}
            <Card>
              <Card.Header>
                <Card.Title>Attendance Trend</Card.Title>
                <Card.Description>
                  {dayjs(startDate).format("MMM DD")} -{" "}
                  {dayjs(endDate).format("MMM DD, YYYY")}
                </Card.Description>
              </Card.Header>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={attendanceTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="rptPresentGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: "#ffffff" }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="present"
                      stroke="#2563eb"
                      fill="url(#rptPresentGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="step"
                      dataKey="late"
                      stroke="#94a3b8"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Department Breakdown */}
            <Card>
              <Card.Header>
                <Card.Title>Department Breakdown</Card.Title>
                <Card.Description>
                  Attendance rate by department
                </Card.Description>
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
                      stroke="#e2e8f0"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="department.code"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      width={50}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: "#ffffff" }}
                      cursor={{ fill: "#f8fafc" }}
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

          {/* Leave Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <Card.Title>Leave Distribution</Card.Title>
                <Card.Description>Leave requests by type</Card.Description>
              </Card.Header>
              {leaveAnalytics?.byType ? (
                <div className="space-y-3">
                  {Object.entries(leaveAnalytics.byType).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-50"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-surface-400" />
                          <span className="text-sm text-surface-600 capitalize">
                            {type}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-surface-800">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-surface-400 py-4">
                  No leave data available
                </p>
              )}
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Leave Stats</Card.Title>
                <Card.Description>Overview of leave requests</Card.Description>
              </Card.Header>
              {leaveAnalytics?.byStatus ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(leaveAnalytics.byStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="text-center p-4 rounded-xl bg-surface-50"
                      >
                        <p className="text-2xl font-display font-bold text-surface-900">
                          {count}
                        </p>
                        <p className="text-xs text-surface-400 tracking-wide mt-1 capitalize">
                          {status}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-surface-400 py-4">
                  No leave data available
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
