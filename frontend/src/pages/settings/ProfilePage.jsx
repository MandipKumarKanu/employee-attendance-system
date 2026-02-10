import { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import useAuthStore from '../../stores/authStore';
import { updateUserApi } from '../../api/userApi';
import { changePasswordApi } from '../../api/authApi';
import dayjs from 'dayjs';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!profileForm.lastName.trim()) errors.lastName = 'Last name is required';
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSavingProfile(true);
    try {
      const payload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim() || undefined,
      };
      await updateUserApi(user._id, payload);
      updateProfile(payload);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters';
    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSavingPassword(true);
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your personal information and password"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="xl" />
              <h3 className="mt-3 text-base font-semibold text-surface-800">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-surface-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user?.role}>{user?.role}</Badge>
                <Badge variant={user?.isActive ? 'approved' : 'absent'} dot>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="w-full mt-4 pt-4 border-t border-surface-100 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Employee ID</span>
                  <span className="text-xs font-medium text-surface-600 font-mono">{user?.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Department</span>
                  <span className="text-xs font-medium text-surface-600">{user?.department?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-400">Joined</span>
                  <span className="text-xs font-medium text-surface-600">
                    {user?.joiningDate ? dayjs(user.joiningDate).format('MMM DD, YYYY') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
              <Card.Description>Update your name and contact details</Card.Description>
            </Card.Header>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  error={profileErrors.firstName}
                />
                <Input
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  error={profileErrors.lastName}
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-surface-50"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSavingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <Card.Title>Change Password</Card.Title>
              <Card.Description>Update your password to keep your account secure</Card.Description>
            </Card.Header>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                error={passwordErrors.currentPassword}
                placeholder="Enter current password"
                icon={<Lock className="w-4 h-4" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  error={passwordErrors.newPassword}
                  placeholder="Min 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  error={passwordErrors.confirmPassword}
                  placeholder="Re-enter new password"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSavingPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
