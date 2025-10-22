import {
    useEffect,
} from 'react';
import {
    useSelector,
    useDispatch,
} from 'react-redux';
import {
    deleteBook,
    fetchBooks,
} from '../redux/bookSlice';
import type { BookState } from '../interface/interface';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { Action } from '@reduxjs/toolkit';
const BookList = () => {
    const books = useSelector((state: { books: BookState }) => state.books);
    const dispatch = useDispatch<ThunkDispatch<{ books: BookState }, unknown, Action>>();
    useEffect(() => {
        dispatch(fetchBooks());
    }, [dispatch]);
    console.log("books", books)
    if (!books.books.length) return <div>Loading...</div>;
    return (
        <div>
            <h2>Books</h2>
            <ul>{books.books.map(book => (
                <li key={book.id}>
                    {book.title} - {book.description}
                    <button onClick={() => dispatch(deleteBook({ id: book.id }))}>
                        Delete
                    </button>
                </li>
            ))}
            </ul>
        </div >
    )
}

export default BookList