import type { Book } from "./interface/interface";

const books: Book[] = [
  { id: 1, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
  { id: 2, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
  { id: 3, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
  { id: 4, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
  { id: 5, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
  { id: 6, title: "Book 1", description: "Description for Book 1.", author: "author of Book 1" },
];

const FAKE_DELAY = 2000;

const fakeAPI = {
  fetchBooks: (): Promise<Book[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(books);
      }, FAKE_DELAY);
    });
  },

  addBook: (book: Omit<Book, 'id'>): Promise<Book> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBook: Book = {
          id: Math.max(...books.map((b) => b.id)) + 1,
          ...book
        };
        books.push(newBook);
        resolve(newBook);
      }, FAKE_DELAY);
    });
  },
};

export default fakeAPI;
