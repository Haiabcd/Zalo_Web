const NavItem = ({ href, icon, label }) => {
  return (
    <a
      href={href}
      className="p-2 rounded-lg hover:bg-blue-700 transition-colors group relative"
      aria-label={label}
    >
      <div className="w-6 h-6">{icon}</div>

      {/* Tooltip */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
        {label}
      </div>
    </a>
  );
};

export default NavItem;
