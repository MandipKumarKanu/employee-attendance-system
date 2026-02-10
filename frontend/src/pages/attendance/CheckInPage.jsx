import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Clock, QrCode, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import useAttendanceStore from '../../stores/attendanceStore';
import useAuthStore from '../../stores/authStore';
import { generateQRApi } from '../../api/qrApi';
import { qrCheckInApi, qrCheckOutApi } from '../../api/attendanceApi';

const tabs = [
  { id: 'manual', label: 'Manual', icon: Clock },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'gps', label: 'GPS', icon: MapPin },
];

export default function CheckInPage() {
  const [activeTab, setActiveTab] = useState('manual');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { todayRecord, isCheckedIn, fetchToday, checkIn, checkOut, isLoading } = useAttendanceStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchToday();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedOut = todayRecord?.checkOut?.time;

  return (
    <div>
      <PageHeader title="Attendance" description="Mark your attendance for today" />

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Today's Status Banner */}
      {todayRecord && (
        <Card className="mb-6 !p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={todayRecord.status} dot>{todayRecord.status}</Badge>
              <span className="text-sm text-surface-500">
                In: {todayRecord.checkIn?.time ? dayjs(todayRecord.checkIn.time).format('h:mm A') : '-'}
                {todayRecord.checkOut?.time && ` | Out: ${dayjs(todayRecord.checkOut.time).format('h:mm A')}`}
                {todayRecord.totalHours > 0 && ` | ${todayRecord.totalHours}h`}
              </span>
            </div>
            <Badge variant={todayRecord.checkIn?.method || 'default'}>{todayRecord.checkIn?.method || '-'}</Badge>
          </div>
        </Card>
      )}

      {activeTab === 'manual' && (
        <ManualTab
          currentTime={currentTime}
          isCheckedIn={isCheckedIn}
          hasCheckedOut={hasCheckedOut}
          isLoading={isLoading}
          onCheckIn={() => { checkIn('manual').then(() => toast.success('Checked in!')).catch((e) => toast.error(e.response?.data?.message || 'Failed')); }}
          onCheckOut={() => { checkOut('manual').then(() => toast.success('Checked out!')).catch((e) => toast.error(e.response?.data?.message || 'Failed')); }}
        />
      )}
      {activeTab === 'qr' && (
        <QRTab user={user} isCheckedIn={isCheckedIn} hasCheckedOut={hasCheckedOut} onSuccess={fetchToday} />
      )}
      {activeTab === 'gps' && (
        <GPSTab isCheckedIn={isCheckedIn} hasCheckedOut={hasCheckedOut} checkIn={checkIn} checkOut={checkOut} />
      )}
    </div>
  );
}

function ManualTab({ currentTime, isCheckedIn, hasCheckedOut, isLoading, onCheckIn, onCheckOut }) {
  return (
    <Card>
      <div className="flex flex-col items-center py-8">
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">
          {dayjs().format('dddd, MMMM D, YYYY')}
        </p>
        <p className="text-5xl font-display font-bold text-surface-900 mb-1 tabular-nums">
          {dayjs(currentTime).format('h:mm:ss')}
        </p>
        <p className="text-lg text-surface-400 mb-8">{dayjs(currentTime).format('A')}</p>

        <motion.button
          whileHover={{ scale: hasCheckedOut ? 1 : 1.05 }}
          whileTap={{ scale: hasCheckedOut ? 1 : 0.95 }}
          onClick={isCheckedIn ? onCheckOut : onCheckIn}
          disabled={isLoading || hasCheckedOut}
          className={clsx(
            'w-36 h-36 rounded-full flex items-center justify-center text-white font-display font-bold text-lg',
            'transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
            hasCheckedOut
              ? 'bg-surface-300'
              : isCheckedIn
                ? 'bg-danger-500 hover:shadow-xl'
                : 'bg-brand-500 hover:shadow-xl hover:shadow-brand-500/25'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : hasCheckedOut ? (
            'Done'
          ) : isCheckedIn ? (
            'Check Out'
          ) : (
            'Check In'
          )}
        </motion.button>

        <p className="mt-6 text-sm text-surface-400">
          {hasCheckedOut ? 'You have completed your shift' : isCheckedIn ? 'Tap to check out' : 'Tap to check in'}
        </p>
      </div>
    </Card>
  );
}

function QRTab({ user, isCheckedIn, hasCheckedOut, onSuccess }) {
  const [qrImage, setQrImage] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleGenerate = async (type = 'checkin') => {
    setGenerating(true);
    try {
      const { data } = await generateQRApi({ type, expiryMinutes: 5 });
      setQrImage(data.data.qrImage);
      setQrToken(data.data.session.token);
      setCountdown(300);
      toast.success('QR code generated!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  };

  const handleScanSubmit = async () => {
    if (!tokenInput.trim()) return toast.error('Enter a QR token');
    setScanning(true);
    try {
      if (isCheckedIn) {
        await qrCheckOutApi({ token: tokenInput.trim() });
        toast.success('Checked out via QR!');
      } else {
        await qrCheckInApi({ token: tokenInput.trim() });
        toast.success('Checked in via QR!');
      }
      setTokenInput('');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid QR token');
    } finally {
      setScanning(false);
    }
  };

  if (isAdminOrManager) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>Generate QR Code</Card.Title>
          <Card.Description>Generate a QR for your team to scan</Card.Description>
        </Card.Header>

        <div className="flex flex-col items-center">
          {qrImage ? (
            <>
              <img src={qrImage} alt="QR Code" className="w-64 h-64 rounded-xl border border-surface-100 mb-4" />
              <p className="text-sm text-surface-500 mb-1">
                Expires in <span className="font-mono font-medium text-brand-600">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
              </p>
              <p className="text-xs text-surface-400 font-mono mb-4 break-all max-w-sm text-center">{qrToken}</p>
              {countdown <= 0 && <p className="text-sm text-danger-500 mb-4">QR code expired</p>}
            </>
          ) : (
            <div className="w-64 h-64 rounded-xl border-2 border-dashed border-surface-200 flex items-center justify-center mb-4">
              <QrCode className="w-16 h-16 text-surface-200" />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={() => handleGenerate('checkin')} isLoading={generating} variant="primary">
              Generate Check-In QR
            </Button>
            <Button onClick={() => handleGenerate('checkout')} isLoading={generating} variant="outline">
              Generate Check-Out QR
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Scan QR Code</Card.Title>
        <Card.Description>Enter the QR token provided by your manager</Card.Description>
      </Card.Header>

      {hasCheckedOut ? (
        <p className="text-sm text-surface-400 text-center py-8">You have already checked out today</p>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          <Input
            label="QR Token"
            placeholder="Paste the QR token here"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <Button onClick={handleScanSubmit} isLoading={scanning} fullWidth>
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </div>
      )}
    </Card>
  );
}

function GPSTab({ isCheckedIn, hasCheckedOut, checkIn, checkOut }) {
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setError(err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!location) return;
    setSubmitting(true);
    try {
      if (isCheckedIn) {
        await checkOut('gps', location);
        toast.success('Checked out via GPS!');
      } else {
        await checkIn('gps', location);
        toast.success('Checked in via GPS!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'GPS check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>GPS Check-In</Card.Title>
        <Card.Description>Verify your location to mark attendance</Card.Description>
      </Card.Header>

      {hasCheckedOut ? (
        <p className="text-sm text-surface-400 text-center py-8">You have already checked out today</p>
      ) : (
        <div className="flex flex-col items-center py-4">
          <div className="w-full max-w-sm space-y-4">
            <Button onClick={getLocation} isLoading={locating} variant="outline" fullWidth leftIcon={<MapPin className="w-4 h-4" />}>
              {location ? 'Refresh Location' : 'Get My Location'}
            </Button>

            {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

            {location && (
              <div className="bg-surface-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Latitude</span>
                  <span className="font-mono text-surface-700">{location.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Longitude</span>
                  <span className="font-mono text-surface-700">{location.longitude.toFixed(6)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!location}
              fullWidth
            >
              {isCheckedIn ? 'Check Out with GPS' : 'Check In with GPS'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
