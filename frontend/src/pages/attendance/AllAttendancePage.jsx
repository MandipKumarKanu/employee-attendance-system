import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getAllAttendanceApi } from '../../api/attendanceApi';
import { getDepartmentsApi } from '../../api/departmentApi';

export default function AllAttendancePage() {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    status: '',
    department: '',
  });

  useEffect(() => {
    getDepartmentsApi()
      .then((res) => setDepartments(res.data.data || []))
      .catch(() => {});
  }, []);

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      if (!params.status) delete params.status;
      if (!params.department) delete params.department;
      const { data } = await getAllAttendanceApi(params);
      setRecords(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0,
      });
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters]);

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            name={row.user ? `${row.user.firstName} ${row.user.lastName}` : '?'}
            src={row.user?.avatar}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-surface-800">
              {row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Unknown'}
            </p>
            <p className="text-xs text-surface-400 font-mono">{row.user?.employeeId || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-surface-700">{dayjs(row.date).format('MMM D, YYYY')}</span>
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
      render: (row) => (
        <span className="font-mono text-surface-600">{row.totalHours || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status} dot>{row.status}</Badge>,
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="text-xs text-surface-400 capitalize">{row.checkIn?.method || '-'}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="All Attendance"
        description={`${pagination.total} total records`}
      />

      <Card className="mb-6 !p-4">
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          />
          <Select
            label="Department"
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="half-day">Half Day</option>
            <option value="on-leave">On Leave</option>
          </Select>
        </div>
      </Card>

      <Table columns={columns} data={records} isLoading={isLoading} />

      <div className="mt-4 flex justify-center">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => fetchData(p)}
        />
      </div>
    </div>
  );
}
