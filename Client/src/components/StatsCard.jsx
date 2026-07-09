import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, to, icon: Icon, color = 'yellow' }) => {
  const colorMap = {
    yellow: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    blue: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    green: 'bg-green-400/10 text-green-400 border-green-400/20',
    purple: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    orange: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  };

  const card = (
    <div className={`card border ${colorMap[color]} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/60">{title}</p>
        {Icon && <Icon className={`w-5 h-5 ${colorMap[color].split(' ')[1]}`} />}
      </div>
      <p className="text-4xl font-bold text-white">{value ?? '—'}</p>
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
};

export default StatsCard;
