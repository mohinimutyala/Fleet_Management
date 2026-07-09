const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin" />
    </div>
    <p className="text-white/40 text-sm">{text}</p>
  </div>
);

export default Loader;
