const AuthModal = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">

      {/* Background (NO CLICK CLOSE) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-10"
        onClick={(e) => e.stopPropagation()} // prevent background click
      >
        {children}
      </div>

    </div>
  );
};

export default AuthModal;