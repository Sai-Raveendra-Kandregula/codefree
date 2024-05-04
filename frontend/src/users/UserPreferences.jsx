import React, { useState, useEffect } from 'react'
import { useRouteData } from '../App'
import { toTitleCase } from '../GlobalRoot'

function UserPreferences() {
    const currentUserData = useRouteData('0-3')['user']
    const userData = useRouteData('0-3')['userInfo']

    const [themePreference, setThemePreference] = useState(window.localStorage.getItem("app-theme") || "system");


    const listenThemeChanges = (event) => {
        setThemePreference("")
        setThemePreference("system")
    }

    useEffect(() => {
        if (themePreference) {
            window.localStorage.setItem("app-theme", themePreference)

            var out = "light"
            if (themePreference == "system") {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listenThemeChanges)
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    out = "dark"
                }
            }
            else {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listenThemeChanges)
                out = (window.localStorage.getItem("app-theme") == "dark") ? "dark" : "light"
            }

            if (out == "dark") {
                document.querySelector(":root").classList.add("dark")
            }
            else {
                document.querySelector(":root").classList.remove("dark")
            }

            window.dispatchEvent(new Event("theme-update"));
        }
    }, [themePreference]);

    return (
        <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            <h2 style={{
                margin: '0'
            }}>
                Preferences for : {currentUserData['display_name']}
            </h2>
            <h3>
                Theme
            </h3>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '15px'
            }}>
                {
                    ["light", "dark", "system"].map((themeVal) => {
                        return <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            cursor: 'pointer',
                        }} onClick={() => {
                            setThemePreference(themeVal)
                        }}>
                            <div className={themeVal == "system" ? (window.matchMedia('(prefers-color-scheme: dark)') ? "dark" : "light") : themeVal} style={{
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: themePreference == themeVal ? `2px solid var(--theme-color)` : `2px solid var(--border-color)`,
                                borderRadius: `calc(var(--border-radius) + 0.5rem)`,
                                padding: '0.5rem',
                                boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.35)',
                                minHeight: '5rem',
                                width: '12.5rem',
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}>
                                This is how it looks.
                                <button className='themeButton'>Theme</button>
                                <button>Standard</button>
                            </div>
                            {toTitleCase(themeVal)}
                        </div>
                    })
                }
            </div>
        </div>
    )
}

export default UserPreferences