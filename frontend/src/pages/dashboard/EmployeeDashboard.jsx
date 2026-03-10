import { useEffect, useState } from "react";
import { Clock, CalendarDays, TrendingUp, Timer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import useAuthStore from "../../stores/authStore";
import useAttendanceStore from "../../stores/attendanceStore";
import { getMyHistoryApi } from "../../api/attendanceApi";
import dayjs from "dayjs";

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);
  const { todayRecord, isCheckedIn, fetchToday, checkIn, checkOut } =
    useAttendanceStore();
  const [recentHistory, setRecentHistory] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchToday();
    fetchRecent();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecent = async () => {
    try {
      const { data } = await getMyHistoryApi({
        startDate: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
        limit: 7,
      });
      setRecentHistory(data || []);

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const startOfWeek = dayjs().startOf("week").add(1, "day");
      const weekly = days.map((day, i) => {
        const date = startOfWeek.add(i, "day").format("YYYY-MM-DD");
        const record = (data || []).find(
          (r) => dayjs(r.date).format("YYYY-MM-DD") === date,
        );
        return {
          day,
          hours: record?.totalHours || 0,
        };
      });
      setWeeklyData(weekly);
    } catch {
      // defaults
    }
  };

  const handleCheckInOut = async () => {
    setIsLoading(true);
    try {
      if (isCheckedIn) {
        await checkOut("manual");
      } else {
        await checkIn("manual");
      }
      fetchRecent();
    } catch {
      // Error handled by store
    } finally {
      setIsLoading(false);
    }
  };

  const hoursThisWeek = weeklyData
    .reduce((sum, d) => sum + d.hours, 0)
    .toFixed(1);
  const daysPresent = Array.isArray(recentHistory)
    ? recentHistory.filter((r) => r.status === "present" || r.status === "late")
        .length
    : 0;

  return (
    <div>
      <PageHeader
        title={`Good ${currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 17 ? "afternoon" : "evening"}, ${user?.firstName}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Check In/Out Card */}
        <Card className="lg:col-span-1 flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center text-center py-4">
            <p className="text-[12px] font-bold text-surface-400 uppercase tracking-widest mb-3">
              {dayjs().format("dddd, MMMM D")}
            </p>
            <p className="text-[40px] font-display font-semibold text-surface-900 mb-1 tabular-nums tracking-tight leading-none">
              {dayjs(currentTime).format("h:mm:ss")}
            </p>
            <p className="text-[13px] font-medium text-surface-500 mb-8">
              {dayjs(currentTime).format("A")}
            </p>

            <button
              onClick={handleCheckInOut}
              disabled={isLoading || todayRecord?.checkOut?.time}
              className={`
                w-36 h-36 rounded-[2.5rem] flex items-center justify-center text-white font-semibold text-lg
                transition-all duration-300 shadow-sm border border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  todayRecord?.checkOut?.time
                    ? "bg-surface-200 text-surface-500 border-surface-300 cursor-not-allowed"
                    : isCheckedIn
                      ? "bg-danger-600 hover:bg-danger-700 hover:shadow-md hover:-translate-y-1 active:translate-y-0"
                      : "bg-brand-600 hover:bg-brand-700 hover:shadow-md hover:-translate-y-1 active:translate-y-0"
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                {todayRecord?.checkOut?.time ? (
                  <>
                    <span className="text-xl">✓</span>
                    <span className="text-[15px]">Done</span>
                  </>
                ) : isCheckedIn ? (
                  <>
                    <span className="text-[15px]">Check Out</span>
                  </>
                ) : (
                  <>
                    <span className="text-[15px]">Check In</span>
                  </>
                )}
              </div>
            </button>

            {todayRecord?.checkIn?.time && (
              <div className="mt-8 text-[13px] text-surface-500 space-y-1">
                <p>
                  Checked in at{" "}
                  <span className="font-medium text-surface-700">
                    {dayjs(todayRecord.checkIn.time).format("h:mm A")}
                  </span>
                </p>
                {todayRecord.checkOut?.time && (
                  <p>
                    Checked out at{" "}
                    <span className="font-medium text-surface-700">
                      {dayjs(todayRecord.checkOut.time).format("h:mm A")}
                    </span>
                  </p>
                )}
                {todayRecord.totalHours > 0 && (
                  <p className="font-semibold text-surface-900 mt-2 text-[14px]">
                    {todayRecord.totalHours} hours today
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Hours This Week"
            value={hoursThisWeek}
            icon={Timer}
            accent="brand"
          />
          <StatCard
            title="Days Present (7d)"
            value={daysPresent}
            icon={TrendingUp}
            accent="success"
          />
          <StatCard
            title="Casual Leaves"
            value={user?.leaveBalances?.casual || 0}
            icon={CalendarDays}
            accent="info"
          />
          <StatCard
            title="Sick Leaves"
            value={user?.leaveBalances?.sick || 0}
            icon={CalendarDays}
            accent="danger"
          />
        </div>
      </div>

      {/* Weekly chart + Recent history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Weekly Hours</Card.Title>
          </Card.Header>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#71717a" }}
                  domain={[0, 10]}
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
                  dataKey="hours"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Recent Attendance</Card.Title>
          </Card.Header>
          {!Array.isArray(recentHistory) || recentHistory.length === 0 ? (
            <p className="text-sm text-surface-400 py-4">No recent records</p>
          ) : (
            <div className="space-y-2">
              {recentHistory.slice(0, 5).map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      {dayjs(record.date).format("ddd, MMM D")}
                    </p>
                    <p className="text-xs text-surface-400">
                      {record.checkIn?.time
                        ? dayjs(record.checkIn.time).format("h:mm A")
                        : "-"}
                      {" - "}
                      {record.checkOut?.time
                        ? dayjs(record.checkOut.time).format("h:mm A")
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-500">
                      {record.totalHours || 0}h
                    </span>
                    <Badge variant={record.status} dot>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
