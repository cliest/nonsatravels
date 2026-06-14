import React from "react";

const PageLoadingBar = () => (
  <div className="fixed top-0 left-0 w-full h-1 z-[100] overflow-hidden bg-transparent" role="status" aria-label="Loading">
    <div className="h-full bg-accent animate-page-loading-bar" />
  </div>
);

export default PageLoadingBar;
