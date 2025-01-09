import React, {useCallback, useEffect, useState} from 'react'

export const themes = [ "light", "dark", "system" ]

function useTheme() {
    const [themePreference, setThemePreference] = useState(window.localStorage.getItem("app-theme") || "system");
    const [displayedTheme, setDisplayedTheme] = useState(window.localStorage.getItem("app-theme") || "system");

    const listenThemeChanges = useCallback((event) => {
        setThemePreference("")
        setTimeout(() => {
            setThemePreference("system")
        })
    }, [setThemePreference])

    useEffect(() => {
        if(displayedTheme === "dark") {
            document.querySelector(":root").classList.remove("light")
            document.querySelector(":root").classList.add("dark")
        }
        else{
            document.querySelector(":root").classList.remove("dark")
            document.querySelector(":root").classList.add("light")
        }
        
        window.dispatchEvent(new Event("theme-update"));
    }, [displayedTheme])

    useEffect(() => {
        if (themePreference) {
            window.localStorage.setItem("app-theme", themePreference)
            
            var out = "light"
            if (themePreference.trim() === "system") {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listenThemeChanges)
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    out = "dark"
                }
            }
            else {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listenThemeChanges)
                out = (window.localStorage.getItem("app-theme") == "dark") ? "dark" : "light"
            }

            setDisplayedTheme(out)
        }
    }, [themePreference]);

    return {
        theme : themePreference,
        actualTheme : displayedTheme,
        setTheme : setThemePreference,
        themeChoices : themes,
    }
}

export default useTheme