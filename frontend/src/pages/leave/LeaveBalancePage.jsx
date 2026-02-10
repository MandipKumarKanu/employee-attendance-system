import { useEffect, useState } from 'react';
import { Search, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import { getUsersApi, updateLeaveBalancesApi } from '../../api/userApi';

export default function LeaveBalancePage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit modal
  const [editUser, setEditUser] = useState(null);
  const [balances, setBalances] = useState({ casual: 0, sick: 0, earned: 0, unpaid: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      const { data } = await getUsersApi(params);
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setBalances({
      casual: user.leaveBalances?.casual || 0,
      sick: user.leaveBalances?.sick || 0,
      earned: user.leaveBalances?.earned || 0,
      unpaid: user.leaveBalances?.unpaid || 0,
    });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setIsSaving(true);
    try {
      await updateLeaveBalancesApi(editUser._id, balances);
      toast.success(`Leave balances updated for ${editUser.firstName} ${editUser.lastName}`);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update leave balances';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-surface-700">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-surface-400">{row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => (
        <span className="text-surface-600">{row.department?.name || '-'}</span>
      ),
    },
    {
      key: 'casual',
      label: 'Casual',
      render: (row) => (
        <span className="font-medium text-info-600">{row.leaveBalances?.casual || 0}</span>
      ),
    },
    {
      key: 'sick',
      label: 'Sick',
      render: (row) => (
        <span className="font-medium text-danger-600">{row.leaveBalances?.sick || 0}</span>
      ),
    },
    {
      key: 'earned',
      label: 'Earned',
      render: (row) => (
        <span className="font-medium text-success-600">{row.leaveBalances?.earned || 0}</span>
      ),
    },
    {
      key: 'unpaid',
      label: 'Unpaid',
      render: (row) => (
        <span className="font-medium text-surface-500">{row.leaveBalances?.unpaid || 0}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditModal(row)}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave Balances"
        description="View and manage employee leave balances"
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          icon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={users}
        isLoading={isLoading}
      />

      <div className="flex justify-center mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit Leave Balances"
        size="md"
      >
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-surface-50 rounded-lg p-3">
              <Avatar name={`${editUser.firstName} ${editUser.lastName}`} size="md" />
              <div>
                <p className="text-sm font-medium text-surface-700">
                  {editUser.firstName} {editUser.lastName}
                </p>
                <p className="text-xs text-surface-400">{editUser.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Casual Leave"
                type="number"
                min={0}
                value={balances.casual}
                onChange={(e) => setBalances((b) => ({ ...b, casual: Number(e.target.value) }))}
              />
              <Input
                label="Sick Leave"
                type="number"
                min={0}
                value={balances.sick}
                onChange={(e) => setBalances((b) => ({ ...b, sick: Number(e.target.value) }))}
              />
              <Input
                label="Earned Leave"
                type="number"
                min={0}
                value={balances.earned}
                onChange={(e) => setBalances((b) => ({ ...b, earned: Number(e.target.value) }))}
              />
              <Input
                label="Unpaid Leave"
                type="number"
                min={0}
                value={balances.unpaid}
                onChange={(e) => setBalances((b) => ({ ...b, unpaid: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setEditUser(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
