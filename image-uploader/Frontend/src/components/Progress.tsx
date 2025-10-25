type ProgressProps = {
  percentage: number;
};
// Describes the props shape with the current upload percentage.

const Progress = ({ percentage }: ProgressProps) => {
  // Defines the Progress component displaying a Bootstrap progress bar.
  return (
    // Returns the progress bar markup.
    <div className="progress">
      {/* Wraps the bar with Bootstrap progress container styling. */}
      <div
        className="progress-bar progress-bar-striped bg-success"
        /* Applies striped success styling to the progress indicator. */
        role="progressbar"
        /* Announces the element as a progress bar for assistive technology. */
        style={{ width: `${percentage}%` }}
        /* Dynamically sets the bar width based on the percentage prop. */
        aria-valuenow={percentage}
        /* Reports the current progress value for accessibility. */
        aria-valuemin={0}
        /* Declares the minimum progress value. */
        aria-valuemax={100}
        /* Declares the maximum progress value. */
      ></div>
      {/* Uses an empty div body because width and styles convey progress. */}
    </div>
  );
  // Ends the rendered progress markup.
};

export default Progress;
// Exports the Progress component for reuse.
