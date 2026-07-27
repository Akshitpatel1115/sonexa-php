const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex items-center gap-2.5">
      <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/50" style={{ animationDelay: "0s" }}></div>
      <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/50" style={{ animationDelay: "0.2s" }}></div>
      <div className="h-3.5 w-3.5 animate-bounce rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" style={{ animationDelay: "0.4s" }}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-8">
      {loaderContent}
    </div>
  );
};

export default Loader;
