import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { CiLight, CiDark } from "react-icons/ci";
import { GoProject, GoHome } from "react-icons/go";
import { BiUserCircle, BiLogIn } from "react-icons/bi";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'
import SideBarLink from './Components/SideBarLink';
import { SERVER_BASE_URL } from './App';
import HeaderButton, { HEADER_BUTTON_TYPES } from './Components/HeaderButton';
import LinkButton from './Components/LinkButton';

function GlobalRoot() {

  const navigate = useNavigate();

  const [activeTheme, setActiveTheme] = useState((window.localStorage.getItem("app-theme") == "dark") ? "dark" : "light")
  const [userName, setUserName] = useState("")

  function getUserName() {
    fetch(`${SERVER_BASE_URL}/api/user/validate`, {
      credentials: "include"
    })
      .then((resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
      })
      .then((data) => {
        setUserName(data['username'])
      })
      .catch(() => {
        navigate(`/sign-in?redirect=${window.location.href}`,
          {
            replace: false
          })
      })
  }

  useEffect(() => {
    getUserName()
  }, [])

  useEffect(() => {
    if (activeTheme) {
      window.localStorage.setItem("app-theme", activeTheme)
      window.dispatchEvent(new Event("theme-update"));
      if (activeTheme == "dark") {
        document.querySelector(":root").classList.add("dark")
      }
      else {
        document.querySelector(":root").classList.remove("dark")
      }
    }
  }, [activeTheme])

  function AuthHeader() {
    return <React.Fragment>
      {
        userName.length > 0 ? 
        <HeaderButton type={HEADER_BUTTON_TYPES.DROPDOWN} icon={<BiUserCircle />} title={userName}>
          <SideBarLink to={`/sign-out`} title={"Sign Out"} replace={false} icon={<BiLogIn />} />
        </HeaderButton>
        :
        <HeaderButton replace={false} type={HEADER_BUTTON_TYPES.LINK} icon={<BiLogIn /> } title={"Sign In"} to={"/sign-in"} />
      }
    </React.Fragment>
  }

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
            if (activeTheme == "light") {
              setActiveTheme("dark")
            }
            else {
              setActiveTheme("light")
            }
          }} />

          <AuthHeader />
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