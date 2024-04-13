import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { CiLight, CiDark } from "react-icons/ci";
import { GoProject, GoHome } from "react-icons/go";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'
import SideBarLink from './Components/SideBarLink';

function GlobalRoot() {
  const navigate = useNavigate();

  const [activeTheme, setActiveTheme] = useState((window.localStorage.getItem("app-theme") == "dark") ? "dark" : "light")

  useEffect(() => {
    if (activeTheme){
      window.localStorage.setItem("app-theme", activeTheme)
      if (activeTheme == "dark"){
        document.querySelector(":root").classList.add("dark")
      }
      else{
        document.querySelector(":root").classList.remove("dark")
      }
    }
  }, [activeTheme])
  

  return (
    <React.Fragment>
        <header className={`${GlobalRootStyles.appHeader}`}>
            <div className={`${GlobalRootStyles.appHeaderLeft}`}>

            </div>
            <div className={`${GlobalRootStyles.appHeaderCenter}`}>
                CodeFree
            </div>
            <div className={`${GlobalRootStyles.appHeaderRight}`}>
              <IconButton title="Toggle Theme" Icon={activeTheme == "dark" ? CiLight : CiDark} onClick={(e) => {
                if (activeTheme == "light"){
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
            <SideBarLink to={'/home'} title={'Home'} icon={<GoHome />} />
            <SideBarLink to={'/projects'} title={'Projects'} icon={<GoProject />} />
          </nav>
        <div className={`${GlobalRootStyles.outletWrapper}`}>
            <Outlet />
          </div>
        </div>
    </React.Fragment>
  )
}

export default GlobalRoot