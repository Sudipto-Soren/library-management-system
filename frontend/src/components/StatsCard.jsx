const colorMap = {
  violet: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    shadow: 'shadow-violet-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    shadow: 'shadow-emerald-500/10',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    shadow: 'shadow-blue-500/10',
  },
  rose: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    shadow: 'shadow-rose-500/10',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    shadow: 'shadow-amber-500/10',
  },
};

const StatsCard = ({ title, value, icon: Icon, color = 'violet' }) => {
  const colors = colorMap[color] || colorMap.violet;

  return (
    <div className={`glass glass-hover animate-fade-in p-6 flex items-center gap-5 ${colors.shadow}`}>
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-2xl ${colors.bg} shrink-0`}
      >
        <Icon size={26} className={colors.text} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-white/50 mt-0.5 truncate">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;
