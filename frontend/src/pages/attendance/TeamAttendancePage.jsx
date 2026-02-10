import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import StatCard from '../../components/dashboard/StatCard';
import { getTeamAttendanceApi } from '../../api/attendanceApi';

export default function TeamAttendancePage() {
  const [teamData, setTeamData] = useState({ teamUsers: [], records: [] });
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data } = await getTeamAttendanceApi({ date: selectedDate });
        setTeamData(data.data || { teamUsers: [], records: [] });
      } catch {
        setTeamData({ teamUsers: [], records: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const totalTeam = teamData.teamUsers.length;
  const presentMembers = teamData.teamUsers.filter((member) => {
    const record = teamData.records.find((r) => (r.user?._id || r.user) === member._id);
    return record?.checkIn?.time;
  });
  const presentCount = presentMembers.length;
  const absentCount = totalTeam - presentCount;
  const lateCount = teamData.records.filter((r) => r.status === 'late').length;

  return (
    <div>
      <PageHeader
        title="Team Attendance"
        description={dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
        actions={
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Team" value={totalTeam} icon={Users} accent="brand" />
        <StatCard title="Present" value={presentCount} icon={UserCheck} accent="success" />
        <StatCard title="Absent" value={absentCount} icon={UserX} accent="danger" />
        <StatCard title="Late" value={lateCount} icon={Clock} accent="warning" />
      </div>

      {/* Team Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-3/4" />
                  <div className="h-3 bg-surface-100 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : teamData.teamUsers.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-surface-400 py-8">No team members found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamData.teamUsers.map((member) => {
            const record = teamData.records.find(
              (r) => (r.user?._id || r.user) === member._id
            );
            const isPresent = record?.checkIn?.time;
            const isCheckedOut = record?.checkOut?.time;
            const status = isPresent
              ? record.status === 'late' ? 'late' : isCheckedOut ? 'present' : 'present'
              : 'absent';

            return (
              <Card key={member._id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${member.firstName} ${member.lastName}`} src={member.avatar} size="md" />
                    <div>
                      <p className="text-sm font-medium text-surface-800">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-surface-400">{member.employeeId}</p>
                    </div>
                  </div>
                  <Badge variant={status} dot>
                    {status === 'late' ? 'Late' : isPresent ? (isCheckedOut ? 'Done' : 'In') : 'Absent'}
                  </Badge>
                </div>

                {isPresent && (
                  <div className="mt-3 pt-3 border-t border-surface-50 flex items-center gap-4 text-xs text-surface-400">
                    <span>In: {dayjs(record.checkIn.time).format('h:mm A')}</span>
                    {isCheckedOut && (
                      <span>Out: {dayjs(record.checkOut.time).format('h:mm A')}</span>
                    )}
                    {record.totalHours > 0 && (
                      <span className="ml-auto font-medium text-surface-600">{record.totalHours}h</span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
