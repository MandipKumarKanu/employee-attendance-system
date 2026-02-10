import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, Building2, CalendarDays, Clock, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { getUserApi } from '../../api/userApi';
import { getUserAttendanceApi } from '../../api/attendanceApi';
import { getMyLeavesApi } from '../../api/leaveApi';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leaves', label: 'Leaves' },
];

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    if (employee) {
      if (activeTab === 'attendance') fetchAttendance();
      if (activeTab === 'leaves') fetchLeaves();
    }
  }, [activeTab, employee]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    try {
      const { data } = await getUserApi(id);
      setEmployee(data.data);

      // Fetch recent attendance for overview
      try {
        const { data: attData } = await getUserAttendanceApi(id, {
          startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
          endDate: dayjs().format('YYYY-MM-DD'),
          limit: 7,
        });
        const records = attData.data || [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const startOfWeek = dayjs().startOf('week').add(1, 'day');
        const weekly = days.map((day, i) => {
          const date = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
          const record = records.find((r) => dayjs(r.date).format('YYYY-MM-DD') === date);
          return { day, hours: record?.totalHours || 0 };
        });
        setWeeklyData(weekly);
      } catch {
        // non-critical
      }
    } catch {
      toast.error('Failed to load employee details');
      navigate('/employees');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await getUserAttendanceApi(id, {
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        limit: 30,
      });
      setAttendance(data.data || []);
    } catch {
      toast.error('Failed to load attendance records');
    }
  };

  const fetchLeaves = async () => {
    try {
      const { data } = await getMyLeavesApi({ userId: id, limit: 20 });
      setLeaves(data.data || []);
    } catch {
      toast.error('Failed to load leave records');
    }
  };

  const attendanceColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="font-medium text-surface-700">{dayjs(row.date).format('ddd, MMM DD')}</span>
      ),
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (row) => (
        <span className="text-surface-600">
          {row.checkIn?.time ? dayjs(row.checkIn.time).format('h:mm A') : '-'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (row) => (
        <span className="text-surface-600">
          {row.checkOut?.time ? dayjs(row.checkOut.time).format('h:mm A') : '-'}
        </span>
      ),
    },
    {
      key: 'totalHours',
      label: 'Hours',
      render: (row) => <span className="font-medium text-surface-700">{row.totalHours || 0}h</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status} dot>{row.status}</Badge>,
    },
  ];

  const leaveColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge variant={row.leaveType} dot>{row.leaveType}</Badge>,
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (row) => (
        <span className="text-surface-600">
          {dayjs(row.startDate).format('MMM DD')}
          {row.startDate !== row.endDate && ` - ${dayjs(row.endDate).format('MMM DD')}`}
        </span>
      ),
    },
    {
      key: 'days',
      label: 'Days',
      render: (row) => <span className="font-medium text-surface-700">{row.totalDays}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status} dot>{row.status}</Badge>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => <span className="text-surface-500 text-xs line-clamp-1">{row.reason}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!employee) return null;

  const balances = employee.leaveBalances || {};
  const balanceItems = [
    { label: 'Casual', value: balances.casual || 0, color: 'bg-info-500', bgColor: 'bg-info-100' },
    { label: 'Sick', value: balances.sick || 0, color: 'bg-danger-500', bgColor: 'bg-danger-100' },
    { label: 'Earned', value: balances.earned || 0, color: 'bg-success-500', bgColor: 'bg-success-100' },
    { label: 'Unpaid', value: balances.unpaid || 0, color: 'bg-surface-400', bgColor: 'bg-surface-100' },
  ];

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
      </div>

      {/* Employee Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar name={`${employee.firstName} ${employee.lastName}`} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-display font-bold text-surface-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <Badge variant={employee.role}>{employee.role}</Badge>
              <Badge variant={employee.isActive ? 'approved' : 'absent'} dot>
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-surface-400 font-mono">{employee.employeeId}</p>

            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-surface-500">
                <Mail className="w-4 h-4" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center gap-1.5 text-sm text-surface-500">
                  <Phone className="w-4 h-4" />
                  {employee.phone}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-surface-500">
                <Building2 className="w-4 h-4" />
                {employee.department?.name || 'No Department'}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-surface-500">
                <CalendarDays className="w-4 h-4" />
                Joined {dayjs(employee.joiningDate).format('MMM DD, YYYY')}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/employees/${employee._id}`)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-surface-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-brand-600 border-brand-500'
                : 'text-surface-400 border-transparent hover:text-surface-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Balances */}
          <Card>
            <Card.Header>
              <Card.Title>Leave Balances</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              {balanceItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-surface-600">{item.label}</span>
                    <span className="text-sm font-semibold text-surface-800">{item.value} days</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${item.bgColor}`}>
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${Math.min((item.value / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Hours */}
          <Card>
            <Card.Header>
              <Card.Title>This Week's Hours</Card.Title>
            </Card.Header>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#A8A29E' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#A8A29E' }} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      background: '#292524',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F5F5F4',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#FB923C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <Card.Header>
            <Card.Title>Attendance History</Card.Title>
            <Card.Description>Last 30 days</Card.Description>
          </Card.Header>
          <Table
            columns={attendanceColumns}
            data={attendance}
            isLoading={false}
          />
        </Card>
      )}

      {activeTab === 'leaves' && (
        <Card>
          <Card.Header>
            <Card.Title>Leave History</Card.Title>
          </Card.Header>
          <Table
            columns={leaveColumns}
            data={leaves}
            isLoading={false}
          />
        </Card>
      )}
    </div>
  );
}
