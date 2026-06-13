import React from "react";
import PropTypes from "prop-types";

const Loading = ({ size = "medium", fullScreen = false, text = "Loading..." }) => {
  const sizeClasses = {
    small: "w-8 h-8 border-2",
    medium: "w-12 h-12 border-3",
    large: "w-16 h-16 border-4",
  };

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-primary rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
};

Loading.defaultProps = {
  size: "medium",
  fullScreen: false,
  text: "Loading...",
};

export default Loading;
