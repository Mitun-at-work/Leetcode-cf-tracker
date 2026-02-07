import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderState = {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  storageKey?: string
}) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem(storageKey) as "light" | "dark" | "system") || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: "light" | "dark" | "system") => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 