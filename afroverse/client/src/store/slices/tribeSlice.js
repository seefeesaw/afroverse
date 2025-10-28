import { createSlice } from '@reduxjs/toolkit';

const tribeSlice = createSlice({
  name: 'tribe',
  initialState: {
    tribes: [],
    userTribe: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setTribes: (state, action) => {
      state.tribes = action.payload;
    },
    setUserTribe: (state, action) => {
      state.userTribe = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setTribes, setUserTribe, setLoading, setError } = tribeSlice.actions;
export default tribeSlice.reducer;
