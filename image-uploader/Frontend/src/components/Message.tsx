type MessageProps = {
  message: string;
  setMessage: (value: string) => void;
};

export default function Message({ message, setMessage }: MessageProps) {
  return (
    <div
      className="alert alert-warning alert-dismissible fade show"
      role="alert"
    >
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setMessage("")}
      ></button>
    </div>
  );
}
