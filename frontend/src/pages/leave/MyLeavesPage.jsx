import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getMyLeavesApi, cancelLeaveApi } from '../../api/leaveApi';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function MyLeavesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [activeTab, page]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeTab !== 'all') params.status = activeTab;
      const { data } = await getMyLeavesApi(params);
      setLeaves(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to fetch leave records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelLeaveApi(cancelTarget._id);
      toast.success('Leave request cancelled');
      setCancelTarget(null);
      fetchLeaves();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel leave';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="My Leaves"
        description="View and manage your leave requests"
        actions={
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/leaves/apply')}
          >
            Apply Leave
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-surface-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No leave records"
          description={activeTab === 'all' ? 'You have not applied for any leaves yet' : `No ${activeTab} leave requests found`}
          action={
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/leaves/apply')}
            >
              Apply Leave
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <Card key={leave._id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={leave.leaveType} dot>
                      {leave.leaveType}
                    </Badge>
                    <Badge variant={leave.status}>
                      {leave.status}
                    </Badge>
                    {leave.isHalfDay && (
                      <Badge variant="half-day">
                        Half Day ({leave.halfDayPeriod})
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-surface-700 mt-2">
                    {dayjs(leave.startDate).format('MMM DD, YYYY')}
                    {!leave.isHalfDay && leave.startDate !== leave.endDate && (
                      <span> - {dayjs(leave.endDate).format('MMM DD, YYYY')}</span>
                    )}
                    <span className="text-surface-400 font-normal ml-2">
                      ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                    </span>
                  </p>
                  <p className="text-xs text-surface-400 mt-1 line-clamp-1">
                    {leave.reason}
                  </p>
                  {leave.rejectionReason && (
                    <p className="text-xs text-danger-500 mt-1">
                      Rejection reason: {leave.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400">
                    Applied {dayjs(leave.createdAt).format('MMM DD')}
                  </span>
                  {leave.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(leave)}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-center mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Leave Request"
        message={`Are you sure you want to cancel your ${cancelTarget?.leaveType} leave request for ${dayjs(cancelTarget?.startDate).format('MMM DD, YYYY')}?`}
        confirmText="Yes, Cancel"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}
