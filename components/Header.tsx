import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-vla-beige py-2 px-6 md:px-8 lg:px-12 sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo_vla.png"
            alt="VL Automobiles Logo"
            width={240}
            height={60}
            priority
            className="h-60 w-auto object-contain"
            style={{ filter: "none" }}
          />
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          <Link
            href="/acheter"
            className="text-vla-black font-bold text-base hover:text-vla-orange transition-colors"
          >
            Acheter
          </Link>
          <Link
            href="/vendre"
            className="text-vla-black font-bold text-base hover:text-vla-orange transition-colors"
          >
            Vendre
          </Link>
          <Link
            href="/qui-sommes-nous"
            className="text-vla-black font-bold text-base hover:text-vla-orange transition-colors whitespace-nowrap"
          >
            Qui sommes-nous ?
          </Link>
          <Link
            href="/franchise"
            className="text-vla-black font-bold text-base hover:text-vla-orange transition-colors whitespace-nowrap"
          >
            Devenir franchisé
          </Link>
          <Link
            href="/contact"
            className="bg-vla-orange text-white px-7 py-2.5 rounded-full font-bold text-base hover:bg-opacity-90 transition-all"
          >
            Contact
          </Link>
        </div>

        {/* Menu Mobile - TODO: Ajouter burger menu pour mobile */}
        <div className="lg:hidden">
          <button className="text-vla-black">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}