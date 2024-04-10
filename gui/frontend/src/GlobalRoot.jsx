import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { CiLight, CiDark } from "react-icons/ci";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'

function GlobalRoot() {
  const navigate = useNavigate();

  const [activeTheme, setActiveTheme] = useState((window.localStorage.getItem("app-theme") == "dark") ? "dark" : "light")

  useEffect(() => {
    if (activeTheme){
      window.localStorage.setItem("app-theme", activeTheme)
    }
  }, [activeTheme])
  

  return (
    <div>
        <header className={`${GlobalRootStyles.appHeader}`}>
            <div className={`${GlobalRootStyles.appHeaderLeft}`}>

            </div>
            <div className={`${GlobalRootStyles.appHeaderCenter}`}>
                CodeFree
            </div>
            <div className={`${GlobalRootStyles.appHeaderRight}`}>
              <IconButton title="Toggle Theme" Icon={activeTheme == "dark" ? CiLight : CiDark} onClick={(e) => {
                if (document.querySelector(":root").classList.toggle("dark")){
                  setActiveTheme("dark")
                }
                else{
                  setActiveTheme("light")
                }
              }} />
            </div>
        </header>
        <div className={`${GlobalRootStyles.appContent}`}>
          <nav className={`${GlobalRootStyles.appSidebar}`}>
            <a href="/projects" onClick={(e)=>{
              e.preventDefault()
              navigate(e.target.getAttribute("href"))
            }}>Projects</a>
          </nav>
        <div className={`${GlobalRootStyles.outletWrapper}`}>
            <Outlet />
          </div>
        </div>
    </div>
  )
}

export default GlobalRoot