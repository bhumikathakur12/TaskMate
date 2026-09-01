import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

const extractError = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const fetchWallet = createAsyncThunk('wallet/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wallet');
    return data.wallet;
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const topUpWallet = createAsyncThunk(
  'wallet/topup',
  async (amount, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/wallet/topup', { amount });
      return data.wallet;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/transactions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/wallet/transactions');
      return data.transactions;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  }
);

const initialState = {
  balance: 0,
  escrowHeld: 0,
  status: 'idle',
  topupStatus: 'idle',
  topupError: null,
  transactions: [],
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearTopupStatus: (state) => {
      state.topupStatus = 'idle';
      state.topupError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.balance = action.payload.balance;
        state.escrowHeld = action.payload.escrowHeld;
      })
      .addCase(topUpWallet.pending, (state) => {
        state.topupStatus = 'loading';
        state.topupError = null;
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.topupStatus = 'succeeded';
        state.balance = action.payload.balance;
        state.escrowHeld = action.payload.escrowHeld;
      })
      .addCase(topUpWallet.rejected, (state, action) => {
        state.topupStatus = 'failed';
        state.topupError = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      });
  },
});

export const { clearTopupStatus } = walletSlice.actions;
export default walletSlice.reducer;
