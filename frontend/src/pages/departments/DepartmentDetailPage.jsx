import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Building2, ArrowLeft, Edit3, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { getDepartmentApi, updateDepartmentApi } from '../../api/departmentApi';
import { getUsersByDepartmentApi } from '../../api/userApi';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, empRes] = await Promise.allSettled([
        getDepartmentApi(id),
        getUsersByDepartmentApi(id),
      ]);

      if (deptRes.status === 'fulfilled') {
        const dept = deptRes.value.data.data;
        setDepartment(dept);
        setEditForm({
          name: dept.name || '',
          code: dept.code || '',
          description: dept.description || '',
        });
      } else {
        toast.error('Failed to fetch department details');
        navigate('/departments');
      }

      if (empRes.status === 'fulfilled') {
        setEmployees(empRes.value.data.data || []);
      }
    } catch {
      toast.error('Failed to load department');
      navigate('/departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (!editForm.code.trim()) errors.code = 'Code is required';
    setEditErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSaving(true);
    try {
      await updateDepartmentApi(id, {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        description: editForm.description.trim(),
      });
      toast.success('Department updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update department';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const employeeColumns = [
    {
      key: 'name',
      label: 'Name',
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
      label: 'Employee ID',
      render: (row) => <span className="text-surface-600">{row.employeeId}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <Badge variant={row.role}>{row.role}</Badge>,
    },
    {
      key: 'status',
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
      render: (row) => (
        <span className="text-surface-500">{dayjs(row.joiningDate).format('MMM DD, YYYY')}</span>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!department) return null;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/departments')}
          className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </button>
      </div>

      <PageHeader
        title={department.name}
        description={`${department.code} - ${department.description || 'No description'}`}
        actions={
          <Button
            variant="outline"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setShowEditModal(true)}
          >
            Edit Department
          </Button>
        }
      />

      {/* Department Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Employees</p>
              <p className="text-xl font-display font-bold text-surface-900">{employees.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-info-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Manager</p>
              <p className="text-sm font-medium text-surface-700">
                {department.manager
                  ? `${department.manager.firstName} ${department.manager.lastName}`
                  : 'Not assigned'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wide">Status</p>
              <Badge variant={department.isActive ? 'approved' : 'absent'} dot>
                {department.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <Card.Header>
          <Card.Title>Department Employees</Card.Title>
          <Card.Description>{employees.length} members</Card.Description>
        </Card.Header>
        <Table
          columns={employeeColumns}
          data={employees}
          isLoading={false}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Department"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            error={editErrors.name}
          />
          <Input
            label="Department Code"
            value={editForm.code}
            onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
            error={editErrors.code}
          />
          <div>
            <label className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-800
                placeholder:text-surface-400 transition-all duration-200
                hover:border-surface-300
                focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowEditModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
