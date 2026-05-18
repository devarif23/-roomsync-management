import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true); // Default: dark mode

  useEffect(() => {
    const storedTheme = localStorage.getItem('app_theme');
    // If no preference stored, default to dark
    if (storedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      // dark or no preference → dark
      setIsDark(true);
      document.documentElement.classList.add('dark');
      if (!storedTheme) localStorage.setItem('app_theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('app_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('app_theme', 'light');
      }
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
