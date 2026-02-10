import { useEffect, useState } from 'react';
import { Users, Clock, CalendarDays, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getTeamAttendanceApi } from '../../api/attendanceApi';
import { getPendingLeavesApi } from '../../api/leaveApi';
import { getTodayApi } from '../../api/attendanceApi';
import useAuthStore from '../../stores/authStore';
import dayjs from 'dayjs';

export default function ManagerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [teamData, setTeamData] = useState({ teamUsers: [], records: [] });
  const [todayRecord, setTodayRecord] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, todayRes, leavesRes] = await Promise.allSettled([
          getTeamAttendanceApi({}),
          getTodayApi(),
          getPendingLeavesApi({ limit: 1 }),
        ]);

        if (teamRes.status === 'fulfilled') setTeamData(teamRes.value.data.data || { teamUsers: [], records: [] });
        if (todayRes.status === 'fulfilled') setTodayRecord(todayRes.value.data.data);
        if (leavesRes.status === 'fulfilled') setPendingCount(leavesRes.value.data.pagination?.total || 0);
      } catch {
        // defaults
      }
    };
    fetchData();
  }, []);

  const teamSize = teamData.teamUsers.length;
  const presentCount = teamData.records.filter((r) => r.checkIn?.time).length;
  const myStatus = todayRecord?.checkIn?.time
    ? todayRecord.checkOut?.time ? 'Checked Out' : 'Checked In'
    : 'Not Checked In';

  return (
    <div>
      <PageHeader title="Manager Dashboard" description={`Welcome back, ${user?.firstName}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Team Size" value={teamSize} icon={Users} accent="brand" />
        <StatCard title="Present Today" value={`${presentCount}/${teamSize}`} icon={Clock} accent="success" />
        <StatCard title="My Status" value={myStatus} icon={Clock} accent={todayRecord?.checkIn?.time ? 'success' : 'warning'} />
        <StatCard title="Pending Approvals" value={pendingCount} icon={CalendarDays} accent="warning" />
      </div>

      {/* Team attendance today */}
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Team Attendance Today</Card.Title>
          <Card.Description>{dayjs().format('dddd, MMMM D, YYYY')}</Card.Description>
        </Card.Header>
        {teamData.teamUsers.length === 0 ? (
          <p className="text-sm text-surface-400 py-4">No team members found</p>
        ) : (
          <div className="space-y-2">
            {teamData.teamUsers.map((member) => {
              const record = teamData.records.find((r) => r.user?._id === member._id || r.user === member._id);
              const status = record?.checkIn?.time
                ? record.checkOut?.time ? 'checked-out' : 'present'
                : 'absent';

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={`${member.firstName} ${member.lastName}`} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-surface-700">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-surface-400">{member.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {record?.checkIn?.time && (
                      <span className="text-xs text-surface-400">
                        {dayjs(record.checkIn.time).format('h:mm A')}
                      </span>
                    )}
                    <Badge
                      variant={status === 'present' ? 'present' : status === 'checked-out' ? 'present' : 'absent'}
                      dot
                    >
                      {status === 'present' ? 'Present' : status === 'checked-out' ? 'Checked Out' : 'Absent'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
