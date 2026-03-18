import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
    theme: "colored",
    toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("scivi-theme") || "colored"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("scivi-theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((t) => (t === "colored" ? "mono" : "colored"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}