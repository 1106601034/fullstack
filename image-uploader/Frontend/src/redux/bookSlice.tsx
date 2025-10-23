import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import fakeAPI from "../fakeAPI";
import type { Book, BookState } from "../interface/interface";

//Async thunk action for fetching books
export const fetchBooks = createAsyncThunk("books/fetchBooks", async () => {
  try {
    const data = await fakeAPI.fetchBooks();
    return data;
  } catch (error) {
    console.error("Failed to fetch: ", error);
    throw error;
  }
});

const initialState: BookState = {
  books: [],
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    addBook: (state, action: PayloadAction<Omit<Book, "id">>) => {
      state.books.push({ id: Date.now(), ...action.payload });
    },
    deleteBook: (state, action: PayloadAction<{ id: number }>) => {
      state.books = state.books.filter((book) => book.id !== action.payload.id);
    },
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex(
        (book) => book.id === action.payload.id
      );
      if (index !== -1) {
        state.books[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.books = action.payload as Book[];
      })
      .addCase(fetchBooks.rejected, (_, action) => {
        console.error("failed to fetch:", action.error);
      });
  },
});

export const { addBook, deleteBook, updateBook } = bookSlice.actions;
export default bookSlice.reducer;
