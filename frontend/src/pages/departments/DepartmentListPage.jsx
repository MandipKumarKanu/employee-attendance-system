import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { getDepartmentsApi, createDepartmentApi } from '../../api/departmentApi';

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });
  const [addErrors, setAddErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const { data } = await getDepartmentsApi();
      setDepartments(data.data || []);
    } catch {
      toast.error('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const errors = {};
    if (!newDept.name.trim()) errors.name = 'Name is required';
    if (!newDept.code.trim()) errors.code = 'Code is required';
    setAddErrors(errors);
    if (Object.keys(errors).length) return;

    setIsCreating(true);
    try {
      await createDepartmentApi({
        name: newDept.name.trim(),
        code: newDept.code.trim().toUpperCase(),
        description: newDept.description.trim(),
      });
      toast.success('Department created successfully');
      setShowAddModal(false);
      setNewDept({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create department';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage your organization's departments"
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Department
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments"
          description="Create your first department to get started"
          action={
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Department
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card
              key={dept._id}
              hoverable
              onClick={() => navigate(`/departments/${dept._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <Badge variant={dept.isActive ? 'approved' : 'default'} dot>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 className="text-base font-semibold text-surface-800 mb-1">
                {dept.name}
              </h3>
              <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">
                {dept.code}
              </p>

              {dept.description && (
                <p className="text-sm text-surface-500 line-clamp-2 mb-3">
                  {dept.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                <div className="flex items-center gap-1.5 text-sm text-surface-500">
                  <Users className="w-4 h-4" />
                  <span>{dept.employees || 0} employees</span>
                </div>
                {dept.manager && (
                  <p className="text-xs text-surface-400">
                    Mgr: {dept.manager.firstName} {dept.manager.lastName?.[0]}.
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Department"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            value={newDept.name}
            onChange={(e) => setNewDept((d) => ({ ...d, name: e.target.value }))}
            error={addErrors.name}
            placeholder="e.g. Engineering"
          />
          <Input
            label="Department Code"
            value={newDept.code}
            onChange={(e) => setNewDept((d) => ({ ...d, code: e.target.value }))}
            error={addErrors.code}
            placeholder="e.g. ENG"
          />
          <div>
            <label className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={newDept.description}
              onChange={(e) => setNewDept((d) => ({ ...d, description: e.target.value }))}
              placeholder="Brief description of the department..."
              rows={3}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-800
                placeholder:text-surface-400 transition-all duration-200
                hover:border-surface-300
                focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} isLoading={isCreating}>
              Create Department
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
