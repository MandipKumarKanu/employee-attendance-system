import { create } from 'zustand';
import { getTodayApi, checkInApi, checkOutApi, getMyHistoryApi } from '../api/attendanceApi';

const useAttendanceStore = create((set) => ({
  todayRecord: null,
  isCheckedIn: false,
  history: [],
  isLoading: false,

  fetchToday: async () => {
    try {
      const { data } = await getTodayApi();
      const record = data.data;
      set({
        todayRecord: record,
        isCheckedIn: record?.checkIn?.time && !record?.checkOut?.time,
      });
    } catch {
      set({ todayRecord: null, isCheckedIn: false });
    }
  },

  checkIn: async (method, location) => {
    set({ isLoading: true });
    const { data } = await checkInApi({ method, location });
    set({
      todayRecord: data.data,
      isCheckedIn: true,
      isLoading: false,
    });
    return data;
  },

  checkOut: async (method, location) => {
    set({ isLoading: true });
    const { data } = await checkOutApi({ method, location });
    set({
      todayRecord: data.data,
      isCheckedIn: false,
      isLoading: false,
    });
    return data;
  },

  fetchHistory: async (params) => {
    const { data } = await getMyHistoryApi(params);
    set({ history: data.data });
    return data;
  },
}));

export default useAttendanceStore;
