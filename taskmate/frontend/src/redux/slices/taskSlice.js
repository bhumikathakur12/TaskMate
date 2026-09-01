import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const extractError = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/tasks', { params });
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      return data.task;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/tasks/mine');
      return data.tasks;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

// payload: FormData (title, description, category, budget, budgetType, deadline, location JSON, photos[])
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.task;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const cancelTask = createAsyncThunk(
  'tasks/cancelTask',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/tasks/${id}`);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const initialState = {
  list: [],
  pagination: null,
  listStatus: 'idle',
  listError: null,

  current: null,
  currentStatus: 'idle',
  currentError: null,

  mine: [],
  mineStatus: 'idle',

  createStatus: 'idle',
  createError: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
    clearCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.list = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload;
      })

      .addCase(fetchTaskById.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = action.payload;
      })

      .addCase(fetchMyTasks.pending, (state) => {
        state.mineStatus = 'loading';
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded';
        state.mine = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state) => {
        state.mineStatus = 'failed';
      })

      .addCase(createTask.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.mine.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload;
      })

      .addCase(cancelTask.fulfilled, (state, action) => {
        state.mine = state.mine.map((t) =>
          t._id === action.payload.id ? { ...t, status: 'cancelled' } : t
        );
      });
  },
});

export const { clearCurrentTask, clearCreateStatus } = taskSlice.actions;
export default taskSlice.reducer;
