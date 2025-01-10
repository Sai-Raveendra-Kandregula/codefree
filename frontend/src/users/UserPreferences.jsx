import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useRouteData, CodeFreeContext } from '../App'
import { toTitleCase } from '../GlobalRoot'

function UserPreferences() {    
    const cfContext = useContext(CodeFreeContext)
    const currentUserData = useMemo(() => cfContext.userInfo, [cfContext])
    const themeInfo = useMemo(() => cfContext.themeInfo, [cfContext])    

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
                    themeInfo.themeChoices.map((themeVal) => {
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
                            themeInfo.setTheme(themeVal)
                        }}>
                            <div className={themeVal == "system" ? (window.matchMedia('(prefers-color-scheme: dark)') ? "dark" : "light") : themeVal} style={{
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: themeInfo.theme == themeVal ? `2px solid var(--theme-color)` : `2px solid var(--border-color)`,
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