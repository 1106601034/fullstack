type ProgressProps = {
  percentage: number;
};

const Progress = ({ percentage }: ProgressProps) => {
  return (
    <div className="progress">
      <div
        className="progress-bar progress-bar-striped bg-success"
        role="progressbar"
        style={{ width: `${percentage}%` }}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};

export default Progress;
