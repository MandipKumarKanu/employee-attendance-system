import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getMyHistoryApi } from '../../api/attendanceApi';

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    status: '',
  });

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      if (!params.status) delete params.status;
      const { data } = await getMyHistoryApi(params);
      setRecords(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.pages || 1,
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
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="font-medium text-surface-800">
          {dayjs(row.date).format('ddd, MMM D, YYYY')}
        </span>
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
      <PageHeader title="My Attendance History" description="View your past attendance records" />

      {/* Filters */}
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
