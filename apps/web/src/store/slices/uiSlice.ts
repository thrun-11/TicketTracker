import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  modal: string | null
  modalData: unknown
  theme: 'light' | 'dark' | 'system'
  selectedWorkspace: string | null
}

const initialState: UIState = {
  sidebarOpen: true,
  modal: null,
  modalData: null,
  theme: 'system',
  selectedWorkspace: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    openModal: (state, action: PayloadAction<{ modal: string; data?: unknown }>) => {
      state.modal = action.payload.modal
      state.modalData = action.payload.data || null
    },
    closeModal: (state) => {
      state.modal = null
      state.modalData = null
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setSelectedWorkspace: (state, action: PayloadAction<string | null>) => {
      state.selectedWorkspace = action.payload
    },
  },
})

export const { toggleSidebar, openModal, closeModal, setTheme, setSelectedWorkspace } = uiSlice.actions
export default uiSlice.reducer
