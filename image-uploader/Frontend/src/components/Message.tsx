type MessageProps = {
  message: string;
  setMessage: (value: string) => void;
};
// Defines the prop contract requiring the message text and setter callback.

export default function Message({ message, setMessage }: MessageProps) {
  // Declares the Message component that shows a dismissible alert.
  return (
    // Returns the rendered alert markup.
    <div
      className="alert alert-warning alert-dismissible fade show"
      /* Applies Bootstrap styling for a dismissible warning alert. */
      role="alert"
      /* Sets ARIA role to expose the alert semantics. */
    >
      {message}
      {/* Displays the current message text. */}
      <button
        type="button"
        /* Renders the control as a button element. */
        className="btn-close"
        /* Applies Bootstrap close button styling. */
        aria-label="Close"
        /* Provides screen readers a label describing the button. */
        onClick={() => setMessage("")}
        /* Clears the message when the user dismisses the alert. */
      ></button>
      {/* Uses an empty button body because the styling supplies the icon. */}
    </div>
  );
  // Ends the component output.
}
