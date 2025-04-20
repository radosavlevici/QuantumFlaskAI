import { useState, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Once the component mounts, we can safely access `window` and check for localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    if (theme === "dark" || resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  // When rendering on the server, `mounted` will be false
  // The actual theme value can only be determined after the component is mounted on the client
  return {
    theme: mounted ? theme : undefined,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    setTheme,
    toggleTheme,
    mounted,
  };
}
