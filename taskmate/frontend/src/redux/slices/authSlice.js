import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const extractError = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('taskmate_token') || null,
  status: 'idle', // idle | loading | succeeded | failed
  bootstrapped: false, // whether we've tried to restore a session on app load
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.bootstrapped = true;
      localStorage.removeItem('taskmate_token');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.bootstrapped = true;
        localStorage.setItem('taskmate_token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.bootstrapped = true;
        localStorage.setItem('taskmate_token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.bootstrapped = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.bootstrapped = true;
        localStorage.removeItem('taskmate_token');
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
