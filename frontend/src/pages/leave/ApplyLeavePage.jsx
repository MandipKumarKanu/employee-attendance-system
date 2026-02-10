import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import useAuthStore from '../../stores/authStore';
import { applyLeaveApi } from '../../api/leaveApi';

export default function ApplyLeavePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    halfDayPeriod: 'morning',
    reason: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave', balance: user?.leaveBalances?.casual || 0 },
    { value: 'sick', label: 'Sick Leave', balance: user?.leaveBalances?.sick || 0 },
    { value: 'earned', label: 'Earned Leave', balance: user?.leaveBalances?.earned || 0 },
    { value: 'unpaid', label: 'Unpaid Leave', balance: user?.leaveBalances?.unpaid || 0 },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const calculateDays = () => {
    if (form.isHalfDay) return 0.5;
    if (!form.startDate || !form.endDate) return 0;
    const start = dayjs(form.startDate);
    const end = dayjs(form.endDate);
    if (end.isBefore(start)) return 0;
    return end.diff(start, 'day') + 1;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.isHalfDay && !form.endDate) newErrors.endDate = 'End date is required';
    if (!form.isHalfDay && form.startDate && form.endDate && dayjs(form.endDate).isBefore(dayjs(form.startDate))) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!form.reason.trim()) newErrors.reason = 'Reason is required';
    if (form.reason.length > 500) newErrors.reason = 'Reason must be under 500 characters';

    const days = calculateDays();
    const selected = leaveTypes.find((t) => t.value === form.leaveType);
    if (selected && form.leaveType !== 'unpaid' && days > selected.balance) {
      newErrors.leaveType = `Insufficient balance. You have ${selected.balance} day(s) remaining`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
        isHalfDay: form.isHalfDay,
        halfDayPeriod: form.isHalfDay ? form.halfDayPeriod : undefined,
        reason: form.reason.trim(),
      };
      await applyLeaveApi(payload);
      toast.success('Leave application submitted successfully');
      navigate('/leaves/my');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit leave application';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDays = calculateDays();

  return (
    <div>
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Leave Type"
                value={form.leaveType}
                onChange={(e) => handleChange('leaveType', e.target.value)}
                error={errors.leaveType}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.balance} days available)
                  </option>
                ))}
              </Select>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isHalfDay}
                    onChange={(e) => handleChange('isHalfDay', e.target.checked)}
                    className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-surface-600">Half Day</span>
                </label>

                {form.isHalfDay && (
                  <Select
                    value={form.halfDayPeriod}
                    onChange={(e) => handleChange('halfDayPeriod', e.target.value)}
                    className="w-40"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={form.isHalfDay ? 'Date' : 'Start Date'}
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  error={errors.startDate}
                  min={dayjs().format('YYYY-MM-DD')}
                />

                {!form.isHalfDay && (
                  <Input
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    error={errors.endDate}
                    min={form.startDate || dayjs().format('YYYY-MM-DD')}
                  />
                )}
              </div>

              <div className="w-full">
                <label className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1.5">
                  Reason
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  placeholder="Provide a reason for your leave request..."
                  rows={4}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-surface-800
                    placeholder:text-surface-400 transition-all duration-200
                    hover:border-surface-300
                    focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                    ${errors.reason ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20' : 'border-surface-200'}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.reason && <p className="text-xs text-danger-500">{errors.reason}</p>}
                  <p className="text-xs text-surface-400 ml-auto">{form.reason.length}/500</p>
                </div>
              </div>

              {totalDays > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-brand-700">
                    Total Days: {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </p>
                  {form.startDate && (
                    <p className="text-xs text-brand-500 mt-0.5">
                      {dayjs(form.startDate).format('MMM DD, YYYY')}
                      {!form.isHalfDay && form.endDate && ` - ${dayjs(form.endDate).format('MMM DD, YYYY')}`}
                      {form.isHalfDay && ` (${form.halfDayPeriod === 'morning' ? 'Morning' : 'Afternoon'})`}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate('/leaves/my')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Leave Balance Sidebar */}
        <div className="space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>Leave Balances</Card.Title>
              <Card.Description>Your available leave days</Card.Description>
            </Card.Header>
            <div className="space-y-3">
              {leaveTypes.map((type) => (
                <div
                  key={type.value}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-50"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-surface-400" />
                    <span className="text-sm text-surface-600">{type.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-surface-800">
                    {type.balance}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Guidelines</Card.Title>
            </Card.Header>
            <ul className="space-y-2 text-xs text-surface-500">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-surface-400 mt-1.5 flex-shrink-0" />
                Apply at least 1 day in advance for casual leave
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-surface-400 mt-1.5 flex-shrink-0" />
                Sick leave requires a medical certificate for 3+ days
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-surface-400 mt-1.5 flex-shrink-0" />
                Earned leave must be applied 7 days in advance
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-surface-400 mt-1.5 flex-shrink-0" />
                Unpaid leave is deducted from your salary
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
