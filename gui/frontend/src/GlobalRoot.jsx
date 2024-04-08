import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import GlobalRootStyles from './styles/globalroot.module.css'

function GlobalRoot() {
  const navigate = useNavigate();
  return (
    <div>
        <header className={`${GlobalRootStyles.appHeader}`}>
            <div className={`${GlobalRootStyles.appHeaderLeft}`}>

            </div>
            <div className={`${GlobalRootStyles.appHeaderCenter}`}>
                CodeFree
            </div>
            <div className={`${GlobalRootStyles.appHeaderRight}`}>

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