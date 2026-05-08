import { Link } from 'wouter';
import logo from '../assets/logo.svg';

export function Navbar() {
  return (
    <nav className="border-zinc-800 border-b bg-zinc-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center px-8 py-3">
        <Link to="/">
          <img src={logo} alt="OpenBorys" className="h-5" />
        </Link>
      </div>
    </nav>
  );
}
