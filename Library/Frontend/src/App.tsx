import { Provider } from "react-redux";
import store from "./redux/store";

import "./App.css";
import AddBook from "./components/AddBook";
import BookList from "./components/BookList";

export default function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>The Library</h1>
        <AddBook />
        <BookList />
      </div>
    </Provider>);
};
