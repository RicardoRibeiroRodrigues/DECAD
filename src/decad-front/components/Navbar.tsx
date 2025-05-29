// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-gray-700 hover:text-indigo-600 transition">
            Register Music
          </Link>
          <Link href="/pay" className="text-gray-700 hover:text-indigo-600 transition">
            Pay Artists
          </Link>
      </div>
    </nav>
  );
}
