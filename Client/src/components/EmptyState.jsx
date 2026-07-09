import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
        <Icon className="w-8 h-8 text-white/20" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-white/70 mb-2">{title}</h3>
    {description && <p className="text-sm text-white/30 max-w-sm mb-6">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary text-sm">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
