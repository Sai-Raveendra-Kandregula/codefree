import React, {useCallback, useEffect, useState} from 'react'

const _display_themes = {
    "light" : {},
    "dark" : {},
} as const

const _themes = {
    ..._display_themes,
    "system" : {}
} as const

const themeList = Object.keys(_themes)

export type CFTheme = keyof typeof _themes
export type CFDisplayTheme = keyof typeof _display_themes

function useTheme() {
    const [themePreference, setThemePreference] = useState<CFTheme>(window.localStorage.getItem("app-theme") as CFTheme || "system");
    const [displayedTheme, setDisplayedTheme] = useState<CFDisplayTheme>("light");

    const listenThemeChanges = useCallback((event) => {
        setThemePreference("light")
        setTimeout(() => {
            setThemePreference("system")
        })
    }, [setThemePreference])

    useEffect(() => {
        const rootElem = document.querySelector(":root")
        if(rootElem){
            if(displayedTheme === "dark") {
                rootElem.classList.remove("light")
                rootElem.classList.add("dark")
            }
            else{
                rootElem.classList.remove("dark")
                rootElem.classList.add("light")
            }
            window.dispatchEvent(new Event("theme-update"));   
        }
    }, [displayedTheme])

    useEffect(() => {
        if (themePreference) {
            window.localStorage.setItem("app-theme", themePreference)
            
            var out : CFDisplayTheme = "light"
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
        themeChoices : themeList,
    }
}

export default useTheme