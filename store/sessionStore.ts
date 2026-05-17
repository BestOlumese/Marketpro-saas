import { create } from 'zustand'

interface SessionStore {
  isShiftOpen: boolean
  shiftId: string | null
  staffId: string | null
  openShift: (shiftId: string) => void
  closeShift: () => void
  setStaffId: (staffId: string) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  isShiftOpen: false,
  shiftId: null,
  staffId: null,

  openShift: (shiftId) => set({ isShiftOpen: true, shiftId }),
  closeShift: () => set({ isShiftOpen: false, shiftId: null }),
  setStaffId: (staffId) => set({ staffId }),
}))
