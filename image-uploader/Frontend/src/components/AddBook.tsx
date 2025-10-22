import {
    useState,
} from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import { addBook } from "../redux/bookSlice";
function AddBook() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");
    const dispatch = useDispatch();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(addBook({ title, description, author }));
        setTitle("");
        setDescription("");
        setAuthor("");
    }

    return (
        <div>
            <h2>Add Book</h2>
            <form onSubmit={handleSubmit}>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Title'
                    required
                />
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Description'
                    required
                />
                <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder='Author'
                    required
                />
                <button type="submit">Add</button>
            </form>
        </div>
    )
}

export default AddBook