import { useEffect, useState } from 'react';
import { Building2, MapPin, Clock, Globe, CalendarDays } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../stores/authStore';

export default function OrganizationSettingsPage() {
  const user = useAuthStore((s) => s.user);

  // In a real application, these settings might come from a dedicated API.
  // For now, we display organization-level settings based on available user/config data.
  const orgSettings = {
    name: 'Employee Attendance System',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingDays: 'Monday - Friday',
    workingHours: '9:00 AM - 6:00 PM',
    officeLocation: user?.officeLocation || null,
    leaveTypes: [
      { name: 'Casual Leave', description: 'For personal matters and short absences' },
      { name: 'Sick Leave', description: 'For illness and medical appointments' },
      { name: 'Earned Leave', description: 'Accrued based on tenure, for planned vacations' },
      { name: 'Unpaid Leave', description: 'Leave without pay, deducted from salary' },
    ],
    policies: [
      { title: 'Check-in Methods', value: 'Manual & QR Code' },
      { title: 'Late Threshold', value: '15 minutes after shift start' },
      { title: 'Half-Day Support', value: 'Morning / Afternoon splits' },
      { title: 'Leave Approval', value: 'Manager approval required' },
      { title: 'Geofencing Radius', value: `${user?.officeLocation?.radiusMeters || 200} meters` },
    ],
  };

  return (
    <div>
      <PageHeader
        title="Organization Settings"
        description="View your organization's configuration and policies"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Info */}
        <Card>
          <Card.Header>
            <Card.Title>General Information</Card.Title>
            <Card.Description>Organization details and configuration</Card.Description>
          </Card.Header>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
              <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Organization</p>
                <p className="text-sm font-medium text-surface-700">{orgSettings.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
              <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-info-600" />
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Timezone</p>
                <p className="text-sm font-medium text-surface-700">{orgSettings.timezone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Working Days</p>
                <p className="text-sm font-medium text-surface-700">{orgSettings.workingDays}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
              <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase tracking-wide">Working Hours</p>
                <p className="text-sm font-medium text-surface-700">{orgSettings.workingHours}</p>
              </div>
            </div>

            {orgSettings.officeLocation?.latitude && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 uppercase tracking-wide">Office Location</p>
                  <p className="text-sm font-medium text-surface-700">
                    {orgSettings.officeLocation.latitude.toFixed(4)}, {orgSettings.officeLocation.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-surface-400">
                    Radius: {orgSettings.officeLocation.radiusMeters || 200}m
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Policies */}
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Attendance Policies</Card.Title>
              <Card.Description>System-wide attendance configuration</Card.Description>
            </Card.Header>
            <div className="space-y-3">
              {orgSettings.policies.map((policy) => (
                <div
                  key={policy.title}
                  className="flex items-center justify-between py-2.5 border-b border-surface-50 last:border-0"
                >
                  <span className="text-sm text-surface-600">{policy.title}</span>
                  <span className="text-sm font-medium text-surface-800">{policy.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Leave Types</Card.Title>
              <Card.Description>Available leave categories</Card.Description>
            </Card.Header>
            <div className="space-y-3">
              {orgSettings.leaveTypes.map((type) => (
                <div
                  key={type.name}
                  className="p-3 rounded-lg bg-surface-50"
                >
                  <p className="text-sm font-medium text-surface-700">{type.name}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{type.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
