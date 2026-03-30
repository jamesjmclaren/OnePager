import { getTheme } from "@/lib/themes";

interface ThemeProviderProps {
  themeId: string;
  children: React.ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  const theme = getTheme(themeId);
  const bgGradient = theme.variables["--bg-gradient"];
  const hasBgGradient = bgGradient && bgGradient !== "none";

  return (
    <div
      style={{
        ...theme.variables,
        backgroundColor: theme.variables["--bg"],
        backgroundImage: hasBgGradient ? bgGradient : undefined,
        color: theme.variables["--text-primary"],
        fontFamily: theme.variables["--font"],
      } as React.CSSProperties}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
