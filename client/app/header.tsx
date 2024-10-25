"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Strikethrough } from "lucide-react";

const navigation = [
  {
    name: "Deposit",
    href: "/deposit",
  },
  {
    name: "Withdraw",
    href: "/withdraw",
  },

  {
    name: "Info",
    href: "/info",
  },
  {
    name: "GitHub",
    href: "https://github.com/matzapata/gasless",
    external: true,
  },
] satisfies { name: string; href: string; external?: boolean }[];

export const Header: React.FC = () => {
  const pathname = usePathname();
  return (
    <header className="top-0 z-30 w-full px-4 sm:fixed backdrop-blur bh-zinc-900/50">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between gap-2 pt-6 sm:h-16 sm:flex-row sm:pt-0">
          <Link
            href="/"
            className="text-lg font-semibold duration-150 text-zinc-100 hover:text-white flex space-x-2 items-center"
          >
            <Strikethrough />
            <span>Gasless</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="flex items-center grow">
            <ul className="flex flex-wrap items-center justify-end gap-4 grow">
              {navigation.map((item) => (
                <li className="" key={item.href}>
                  <Link
                    className={`flex items-center px-3 py-2 duration-150 text-sm hover:text-zinc-50
                    ${
                      pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/80"
                    }`}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Fancy fading bottom border */}
    </header>
  );
};
