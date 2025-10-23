// Book interface
export interface Book {
    id: number;
    title: string;
    description: string;
    author: string;
}

// Book state interface for Redux
export interface BookState {
    books: Book[];
}
