import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { getUsersApi } from '../../api/userApi';
import { getDepartmentsApi } from '../../api/departmentApi';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sort
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, roleFilter, deptFilter, statusFilter, sortBy, sortOrder]);

  const fetchDepartments = async () => {
    try {
      const { data } = await getDepartmentsApi();
      setDepartments(data.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10, sortBy, sortOrder };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';

      const { data } = await getUsersApi(params);
      setEmployees(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-surface-700">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-surface-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      label: 'ID',
      sortable: true,
      render: (row) => <span className="text-surface-600 font-mono text-xs">{row.employeeId}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => <span className="text-surface-600">{row.department?.name || '-'}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => <Badge variant={row.role}>{row.role}</Badge>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'approved' : 'absent'} dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'joiningDate',
      label: 'Joined',
      sortable: true,
      render: (row) => (
        <span className="text-surface-500 text-xs">{dayjs(row.joiningDate).format('MMM DD, YYYY')}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/employees/${row._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${total} total employees`}
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/employees/add')}
          >
            Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-40"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </Select>
        <Select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-48"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-36"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {/* Table */}
      {!isLoading && employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={employees}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <div className="flex justify-center mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
