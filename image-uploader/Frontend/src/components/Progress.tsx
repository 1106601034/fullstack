const Progress = ({ percentage }) => {
  return (
    <div className="progress">
      <div
        className="progress-bar progress-bar-striped bg-success"
        role="progressbar"
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      ></div>
    </div>
  );
};

export default Progress;
