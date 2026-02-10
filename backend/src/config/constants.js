const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
  ON_LEAVE: 'on-leave',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
};

const CHECK_IN_METHODS = {
  MANUAL: 'manual',
  QR: 'qr',
  GPS: 'gps',
};

const LEAVE_TYPES = {
  CASUAL: 'casual',
  SICK: 'sick',
  EARNED: 'earned',
  UNPAID: 'unpaid',
};

const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

const DEFAULT_LEAVE_BALANCES = {
  casual: 12,
  sick: 10,
  earned: 15,
  unpaid: 0,
};

const WORK_CONFIG = {
  startHour: parseInt(process.env.WORK_START_HOUR) || 9,
  startMinute: parseInt(process.env.WORK_START_MINUTE) || 0,
  lateThresholdMinute: parseInt(process.env.LATE_THRESHOLD_MINUTE) || 30,
  endHour: parseInt(process.env.WORK_END_HOUR) || 18,
  standardHours: 8,
  halfDayThreshold: 4,
};

const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  CHECK_IN_METHODS,
  LEAVE_TYPES,
  LEAVE_STATUS,
  DEFAULT_LEAVE_BALANCES,
  WORK_CONFIG,
  PAGINATION,
};
