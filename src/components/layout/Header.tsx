
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="sticky top-0 w-full bg-gradient-to-br from-primary to-primary-strong text-white px-6 md:px-12 py-4 flex items-center justify-between gap-4 z-50 shadow-lg">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold tracking-tighter">
          FOODAPP
        </Link>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all hover:-translate-y-0.5">LOGIN</Link>
        <Link to="/register" className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all hover:-translate-y-0.5 border border-white/30">REGISTER</Link>
      </div>
    </header>
  );
}

export default Header;