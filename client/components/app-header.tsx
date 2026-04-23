"use client";

import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/ThemeToggle";

export const AppHeader = () => {
  // Sample user data - replace with actual user data from your auth system
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://avatar.vercel.sh/jsmith",
  };

  return (
    <header className="relative w-full px-4 py-4 sm:px-6 sm:py-6">
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NavUser user={user} />
      </div>
    </header>
  );
};
