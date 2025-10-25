import "./App.css";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import ImageUpload from "./components/imageUpload";

export default function App() {
  return (
    <div className="container mt-4">
      <h4 className="display-4 text-center mb-4">Image Upload</h4>
      <ImageUpload />
    </div>
  );
}
