import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const extractError = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const fetchBidsForTask = createAsyncThunk(
  'bids/fetchForTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/bids`);
      return data.bids;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const placeBid = createAsyncThunk(
  'bids/place',
  async ({ taskId, amount, message }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/bids`, { amount, message });
      return data.bid;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const acceptBid = createAsyncThunk(
  'bids/accept',
  async (bidId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bids/${bidId}/accept`);
      return data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const rejectBid = createAsyncThunk(
  'bids/reject',
  async (bidId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bids/${bidId}/reject`);
      return data.bid;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const withdrawBid = createAsyncThunk(
  'bids/withdraw',
  async (bidId, { rejectWithValue }) => {
    try {
      await api.delete(`/bids/${bidId}`);
      return bidId;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bids/mine');
      return data.bids;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const initialState = {
  forTask: [],
  forTaskStatus: 'idle',
  placeStatus: 'idle',
  placeError: null,
  mine: [],
  mineStatus: 'idle',
};

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearPlaceStatus: (state) => {
      state.placeStatus = 'idle';
      state.placeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsForTask.pending, (state) => {
        state.forTaskStatus = 'loading';
      })
      .addCase(fetchBidsForTask.fulfilled, (state, action) => {
        state.forTaskStatus = 'succeeded';
        state.forTask = action.payload;
      })
      .addCase(placeBid.pending, (state) => {
        state.placeStatus = 'loading';
        state.placeError = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.placeStatus = 'succeeded';
        state.forTask.unshift(action.payload);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.placeStatus = 'failed';
        state.placeError = action.payload;
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.forTask = state.forTask.map((b) =>
          b._id === action.payload.bid._id
            ? { ...b, status: 'accepted' }
            : { ...b, status: b.status === 'pending' ? 'rejected' : b.status }
        );
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.forTask = state.forTask.map((b) =>
          b._id === action.payload._id ? action.payload : b
        );
      })
      .addCase(withdrawBid.fulfilled, (state, action) => {
        state.mine = state.mine.filter((b) => b._id !== action.payload);
      })
      .addCase(fetchMyBids.pending, (state) => {
        state.mineStatus = 'loading';
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded';
        state.mine = action.payload;
      });
  },
});

export const { clearPlaceStatus } = bidSlice.actions;
export default bidSlice.reducer;
