import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLoaderData, useNavigate, useParams } from 'react-router-dom'
import useBreadcrumbs from "use-react-router-breadcrumbs";

import { CiLight, CiDark } from "react-icons/ci";
import { GoHome, GoProject,  GoGear, GoCodeSquare  } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";

import { BiUserCircle, BiLogIn } from "react-icons/bi";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'
import SideBarLink from './Components/SideBarLink';
import { SERVER_BASE_URL } from './App';
import HeaderButton, { HEADER_BUTTON_TYPES } from './Components/HeaderButton';
import LinkButton from './Components/LinkButton';
import { AppContext } from './NotFoundContext';
import ErrorPage from './ErrorPage';
import { projectInfoLoader } from './projects/ProjectWrapper';
import { reportDataLoader } from './projects/reports/ReportViewer';
import { reportListLoader } from './projects/reports/Reports';

function toTitleCase(str) {
  return str.replace(
  /\w\S*/g,
  function(txt) {
  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  }
  );
  }

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();
  return (
    <React.Fragment>
      {breadcrumbs.map(({ breadcrumb, key }, ind) => {
        console.log(breadcrumb.props.children, typeof breadcrumb.props.children)
        const crumb = <Link className={`${GlobalRootStyles.breadCrumbLink}`} to={key}>{toTitleCase(breadcrumb.props.children)}</Link>
        if (ind == 0) {
          return
        }
        if (ind == 1) {
          return crumb
        }
        else {
          return <React.Fragment>
            {/* <RxSlash /> */}
            <span>
              {"/"}
            </span>
            {crumb}
          </React.Fragment>
        }
      })}
    </React.Fragment>
  );
};

export async function globalRootLoader({ params }) {
  const out = {}
  if (params.projectid) {
    out['projectInfo'] = await projectInfoLoader({ params })
  }
  if (params.reportid) {
    out['reportList'] = await reportListLoader({ params })
  }
  else{
    out['reportList'] = undefined
  }
  return out
}

function GlobalRoot() {

  const navigate = useNavigate();
  const pathParams = useParams();

  const { notFound, lastReport } = useContext(AppContext);


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
          <HeaderButton type={HEADER_BUTTON_TYPES.DROPDOWN} icon={<BiUserCircle />} showDropdownIcon={false} title={userName} >
            <SideBarLink to={`/sign-out`} title={"Sign Out"} replace={false} icon={<BiLogIn />} />
          </HeaderButton>
          :
          <HeaderButton replace={false} type={HEADER_BUTTON_TYPES.LINK} icon={<BiLogIn />} title={"Sign In"} to={"/sign-in"} />
      }
    </React.Fragment>
  }

  const [rootLoaderData, setRootLoaderData] = useState(useLoaderData())

  async function parseRootLoaderData(){
    const loaderData =  await globalRootLoader({params:pathParams})
    setRootLoaderData(loaderData)
  }

  useEffect(() => {
    parseRootLoaderData()
  }, [pathParams])


  const sideBarItems = () => {
    if (pathParams.projectid) {
      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
          {
            rootLoaderData['reportList'] ? `${rootLoaderData['projectInfo'] && rootLoaderData['projectInfo']['name']} - Reports`
            : (rootLoaderData['projectInfo'] && "Project")
          }
          </b>
        </div>
        {
          rootLoaderData['reportList'] ? <React.Fragment>
              {
                rootLoaderData['reportList'].map((report) => {
                  return <SideBarLink to={`/projects/${pathParams.projectid}/reports/${report['id']}`} 
                    className={pathParams.reportid && pathParams.reportid.toLowerCase() == 'last-report' && report['id'] == lastReport && "active"} 
                    title={`Report #${report['id']}`} icon={<HiOutlineDocumentReport />} />
                })
              }
            </React.Fragment>
          : <React.Fragment>
              <SideBarLink to={`/projects/${pathParams.projectid}`} title={rootLoaderData['projectInfo'] && rootLoaderData['projectInfo']['name']} icon={<GoProject />} />
              <SideBarLink to={`/projects/${pathParams.projectid}/reports`} title={'Reports'} icon={<GoCodeSquare />} />
              <SideBarLink to={`/projects/${pathParams.projectid}/configure`} title={'Settings'} icon={<GoGear  />} />
            </React.Fragment>
        }
      </React.Fragment>
    }
    else {
      return <React.Fragment>
        <SideBarLink to={'/home'} title={'Home'} icon={<GoHome />} />
        <SideBarLink to={'/projects'} title={'Projects'} icon={<GoProject />} />
      </React.Fragment>
    }
  }

  if (notFound) return <ErrorPage />

  return (
    <React.Fragment>
      <div className={`${GlobalRootStyles.appContent}`}>
        <nav className={`${GlobalRootStyles.appSidebar}`}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: 'var(--header-height)',
            padding: '0 10px',
          }}>
            <div style={{
              flex: 1,
              paddingLeft: '10px',
            }}>
              <a href='/'>
                CodeFree
              </a>
            </div>
            <IconButton title="Toggle Theme" icon={activeTheme == "dark" ? <CiLight /> : <CiDark />} onClick={(e) => {
              if (activeTheme == "light") {
                setActiveTheme("dark")
              }
              else {
                setActiveTheme("light")
              }
            }} />

            <AuthHeader />
          </div>
          <div className={`${GlobalRootStyles.appSidebarNavItems}`} style={{
            padding: '10px'
          }}>
            {
              sideBarItems()
            }
          </div>
        </nav>
        <div className={`${GlobalRootStyles.outletWrapper}`}>
          <div style={{
            height: 'var(--header-height)',
            background: 'var(--background)',
            borderBottom: '1px solid var(--border-color)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 20px',
            gap: '5px',
            position: 'sticky',
            top: '0',
            zIndex: '999',
          }}>
            <Breadcrumbs />
          </div>
          <div style={{
            minHeight: 'calc(100vh - var(--header-height) )'
          }}>
            <Outlet />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default GlobalRoot