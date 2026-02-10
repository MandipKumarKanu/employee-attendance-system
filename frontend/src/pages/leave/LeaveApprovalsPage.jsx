import { useEffect, useState } from 'react';
import { CalendarDays, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { getPendingLeavesApi, getTeamLeavesApi, approveLeaveApi, rejectLeaveApi } from '../../api/leaveApi';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function LeaveApprovalsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [activeTab, page]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      let response;

      if (activeTab === 'pending') {
        response = await getPendingLeavesApi(params);
      } else {
        params.status = activeTab;
        response = await getTeamLeavesApi(params);
      }

      setLeaves(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);

      if (activeTab === 'pending') {
        setPendingCount(response.data.pagination?.total || 0);
      }
    } catch {
      toast.error('Failed to fetch leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setActionLoading(leaveId);
    try {
      await approveLeaveApi(leaveId);
      toast.success('Leave approved successfully');
      fetchLeaves();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve leave';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsRejecting(true);
    try {
      await rejectLeaveApi(rejectTarget._id, { rejectionReason: rejectReason.trim() });
      toast.success('Leave rejected');
      setRejectTarget(null);
      setRejectReason('');
      fetchLeaves();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject leave';
      toast.error(message);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Leave Approvals"
        description="Review and manage leave requests from your team"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-surface-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-brand-600 border-brand-500'
                : 'text-surface-400 border-transparent hover:text-surface-600'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold">
                {pendingCount}
              </span>
            )}
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
          title={`No ${activeTab} requests`}
          description={
            activeTab === 'pending'
              ? 'All leave requests have been reviewed'
              : `No ${activeTab} leave requests found`
          }
        />
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <Card key={leave._id}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Employee info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar
                    name={`${leave.user?.firstName || ''} ${leave.user?.lastName || ''}`}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-700">
                      {leave.user?.firstName} {leave.user?.lastName}
                    </p>
                    <p className="text-xs text-surface-400">
                      {leave.user?.employeeId} {leave.user?.department?.name ? `- ${leave.user.department.name}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={leave.leaveType} dot>
                        {leave.leaveType}
                      </Badge>
                      {leave.isHalfDay && (
                        <Badge variant="half-day">
                          Half Day ({leave.halfDayPeriod})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dates & details */}
                <div className="text-sm sm:text-right">
                  <p className="font-medium text-surface-700">
                    {dayjs(leave.startDate).format('MMM DD, YYYY')}
                    {!leave.isHalfDay && leave.startDate !== leave.endDate && (
                      <span> - {dayjs(leave.endDate).format('MMM DD, YYYY')}</span>
                    )}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'} - Applied {dayjs(leave.createdAt).format('MMM DD')}
                  </p>
                  <p className="text-xs text-surface-500 mt-1 line-clamp-2">
                    {leave.reason}
                  </p>
                </div>

                {/* Actions */}
                {activeTab === 'pending' && (
                  <div className="flex items-center gap-2 sm:ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(leave._id)}
                      isLoading={actionLoading === leave._id}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setRejectTarget(leave);
                        setRejectReason('');
                      }}
                      disabled={actionLoading === leave._id}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {activeTab !== 'pending' && (
                  <div className="flex items-center">
                    <Badge variant={leave.status} dot>
                      {leave.status}
                    </Badge>
                  </div>
                )}
              </div>

              {leave.rejectionReason && (
                <div className="mt-3 pt-3 border-t border-surface-100">
                  <p className="text-xs text-danger-500">
                    <span className="font-medium">Rejection reason:</span> {leave.rejectionReason}
                  </p>
                </div>
              )}
            </Card>
          ))}

          <div className="flex justify-center mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Leave Request"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-sm font-medium text-surface-700">
              {rejectTarget?.user?.firstName} {rejectTarget?.user?.lastName}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {rejectTarget?.leaveType} leave - {rejectTarget?.totalDays} day(s)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1.5">
              Reason for Rejection
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejecting this leave request..."
              rows={3}
              className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-800
                placeholder:text-surface-400 transition-all duration-200
                hover:border-surface-300
                focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejectTarget(null)} disabled={isRejecting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={isRejecting}>
              Reject Leave
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
