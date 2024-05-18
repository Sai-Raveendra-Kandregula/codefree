import React, { useState, useEffect } from 'react'
import { useRouteData } from '../App'
import { toTitleCase } from '../GlobalRoot'

function UserPreferences() {
    const currentUserData = useRouteData('0-0')['user']
    const userData = useRouteData('0-0')['userInfo']

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
            width: 'var(--centered-wide-content-width)',
            margin: 'var(--centered-content-margin)',
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
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                {
                    ["light", "dark", "system"].map((themeVal) => {
                        return <div key={themeVal} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            cursor: 'pointer',
                            width: 'auto',
                            maxWidth: '100%'
                        }} onClick={() => {
                            setThemePreference(themeVal)
                        }}>
                            <div className={themeVal == "system" ? (window.matchMedia('(prefers-color-scheme: dark)') ? "dark" : "light") : themeVal} style={{
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: themePreference == themeVal ? `2px solid var(--theme-color)` : `2px solid var(--border-color)`,
                                borderRadius: `calc(var(--border-radius))`,
                                padding: '1.25rem',
                                boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.35)',
                                height: '10rem',
                                width: '15rem',
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                // pointerEvents: 'none',
                                userSelect: 'none',
                            }}>
                                This is how text looks.
                                <a href='#' onClick={(e)=>{
                                    e.preventDefault()
                                }}>This is how links look.</a>
                                <button className='themeButton' onClick={(e)=>{
                                    e.preventDefault()
                                }}>Theme Button</button>
                                <button onClick={(e)=>{
                                    e.preventDefault()
                                }}>Standard Button</button>
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