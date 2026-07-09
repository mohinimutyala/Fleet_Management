import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', value, onChange, className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input pl-9 text-sm"
    />
  </div>
);

export default SearchBar;
