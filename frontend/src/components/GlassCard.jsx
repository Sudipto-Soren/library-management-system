const GlassCard = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`glass ${hover ? 'glass-hover' : ''} animate-fade-in p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
