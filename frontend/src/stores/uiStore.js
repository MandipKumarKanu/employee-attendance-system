import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
}));

export default useUIStore;
