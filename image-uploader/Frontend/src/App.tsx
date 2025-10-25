import "./App.css";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import ImageUpload from "./components/imageUpload";

export default function App() {
  return (
    <div className="contianer mt-4">
      <h4 className="display-4 text-center md-4">image uplodad</h4>
      <ImageUpload />
    </div>
  );
}
