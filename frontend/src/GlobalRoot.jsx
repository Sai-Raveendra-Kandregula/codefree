import React, { useContext, useState, useMemo, useCallback } from 'react'
import { Outlet, useNavigation, useParams } from 'react-router-dom'

import { GoHome, GoProject, GoCodeSquare } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";

import * as TbIcons from 'react-icons/tb'

import { BiLogIn } from "react-icons/bi";
import { LuUser2, LuUsers2, LuLogOut, LuSettings, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'
import SideBarLink from './Components/SideBarLink';
import { CodeFreeContext, SERVER_ROOT_PATH } from './App';
import HeaderButton, { HEADER_BUTTON_TYPES } from './Components/HeaderButton';
import { AppContext } from './NotFoundContext';
import 'react-toastify/dist/ReactToastify.css';
import { userDataLoader } from './users/UserRoot';
import UserAvatar from './Components/UserAvatar';
import { ReactComponent as AppLogo } from './assets/CF_Logo.svg';
import { getAPIURL } from './hooks/useAPI.tsx';
import { Breadcrumbs } from './BreadCrumbs.tsx'
import { LoadingOverlay } from './Loading.jsx';
import { useRouteData } from './hooks/useRouteData.tsx'

function isAlphanumeric(str) {
  return /^[a-z0-9]+$/i.test(str)
}

function isAlphabet(str) {
  return /^[a-z]+$/i.test(str)
}

function isNumeric(str) {
  return /^[0-9]+$/i.test(str)
}

export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export async function getUserName() {
  const resp = await fetch(getAPIURL(`/user/validate`), {
    credentials: "include"
  })
  if (resp.status !== 200) {
    window.location.href = `${SERVER_ROOT_PATH}/sign-in?redirect=${window.location.href}`
  }
  else {
    return resp.json()
  }
}

export async function globalRootLoader({ params }) {
  const out = {}
  if (params.userid) {
    out['userInfo'] = await userDataLoader({ params })
  }
  return out
}

function GlobalRoot() {

  const pathParams = useParams();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const cfContext = useContext(CodeFreeContext)
  const { lastReport } = useContext(AppContext);

  const projectInfo = useRouteData('project-root')
  const reportList = useRouteData('report-list')

  const currentUserData = useMemo(() => cfContext.userInfo, [cfContext.userInfo])

  const [sidebarHidden, setSidebarHidden] = useState(false)

  const AuthHeader = useCallback(() => {
    return <React.Fragment>
      {
        currentUserData ?
          <HeaderButton type={HEADER_BUTTON_TYPES.DROPDOWN} icon={<UserAvatar userData={currentUserData} />} showDropdownIcon={false} title={currentUserData['user_name']} >
            <SideBarLink to={`/user/${currentUserData['user_name']}`} title={"Profile"} replace={false} icon={<LuUser2 />} />
            <SideBarLink to={`/user/${currentUserData['user_name']}/preferences`} title={"Preferences"} replace={false} icon={<LuSettings />} />
            <SideBarLink to={`/sign-out`} title={"Sign Out"} replace={false} icon={<LuLogOut />} />
          </HeaderButton>
          :
          <HeaderButton replace={false} type={HEADER_BUTTON_TYPES.LINK} icon={<BiLogIn />} title={"Sign In"} to={"/sign-in"} />
      }
    </React.Fragment>
  }, [currentUserData])

  const sideBarItems = () => {
    if ((window.location.pathname).startsWith(SERVER_ROOT_PATH + "/admin-area")) {
      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
            Admin Area
          </b>
        </div>
        {
          <React.Fragment>
            {/* <SideBarLink to={`/system-preferences`} title={currentUserData['display_name']} icon={<LuUser2 />} /> */}
            <SideBarLink to={`/admin-area/users`} title={'Users'} icon={<LuUsers2 />} exact={false} />
          </React.Fragment>
        }
      </React.Fragment>
    }

    if (pathParams.userid && pathParams.userid === currentUserData['user_name']) {
      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
            {
              (currentUserData['display_name'] != null ? currentUserData['display_name'] : currentUserData['user_name'])
            }
          </b>
        </div>
        {
          <React.Fragment>
            <SideBarLink to={`/user/${currentUserData['user_name']}/profile`} title={currentUserData['display_name']} icon={<LuUser2 />} />
            <SideBarLink to={`/user/${currentUserData['user_name']}/preferences`} title={'Preferences'} icon={<LuSettings />} />
          </React.Fragment>
        }
      </React.Fragment>

    }

    if (projectInfo) {
      var ProjectIcon = GoProject
      if (isAlphabet(projectInfo['name'][0].toLowerCase())) {
        ProjectIcon = TbIcons[`TbSquareLetter${projectInfo['name'][0].toUpperCase()}`]
      }
      else if (isNumeric(projectInfo['name'][0])) {
        ProjectIcon = TbIcons[`TbSquareNumber${projectInfo['name'][0].toUpperCase()}`]
      }

      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
            {
              pathParams.reportid ? `${projectInfo && projectInfo['name']} - Reports`
                : (projectInfo && "Project")
            }
          </b>
        </div>
        {
          reportList && pathParams.reportid ? <React.Fragment>
            {
              reportList.map((report) => {
                return <SideBarLink key={report['id']} to={`/projects/${pathParams.projectid}/reports/${report['id']}`}
                  className={pathParams.reportid && pathParams.reportid.toLowerCase() === 'last-report' && report['id'] === lastReport && "active"}
                  title={`Report #${report['id']}`} icon={<HiOutlineDocumentReport />} />
              })
            }
          </React.Fragment>
            : <React.Fragment>
              <SideBarLink to={`/projects/${pathParams.projectid}`} title={projectInfo && projectInfo['name']}
                icon={<ProjectIcon />} />
              {
                reportList && reportList.length > 0 &&
                <SideBarLink to={`/projects/${pathParams.projectid}/reports`} exact={false} title={'Reports'} icon={<GoCodeSquare />} />
              }
              <SideBarLink to={`/projects/${pathParams.projectid}/configure`} title={'Settings'} icon={<LuSettings />} />
            </React.Fragment>
        }
      </React.Fragment>
    }
    else {
      return <React.Fragment>
        <SideBarLink to={'/home'} title={'Home'} icon={<GoHome />} />
        <SideBarLink to={'/projects'} title={'Projects'} exact={false} icon={<GoProject />} />
        {
          currentUserData && currentUserData['is_user_admin'] &&
          <SideBarLink to={'/admin-area'} title={"Manage CodeFree"} icon={<LuSettings />} />
        }
      </React.Fragment>
    }
  }

  return (
    <div className={`${GlobalRootStyles.appContent}`}>
      <nav className={`${GlobalRootStyles.appSidebar} ${sidebarHidden && GlobalRootStyles.hidden}`}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: 'var(--header-height)',
          padding: '0 10px',
          gap: '5px'
        }}>
          <div style={{
            flex: 1,
            paddingLeft: '0px',
          }}>
            <IconButton title="CodeFree" icon={<AppLogo style={{
              fontSize: '1.5rem',
              filter: 'var(--icon-shadow)'
            }} />} to={'/'} />
          </div>
          <IconButton title="Collapse Nav Pane" icon={<LuPanelLeftClose opacity={0.75} />} onClick={(e) => {
            setSidebarHidden(true)
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
          padding: '0 20px 0 15px',
          gap: '7.5px',
          position: 'sticky',
          top: '0',
          zIndex: '999',
        }}>
          {
            sidebarHidden && <IconButton title="Expand Nav Pane" icon={<LuPanelLeftOpen opacity={0.75} />}
              onClick={(e) => {
                setSidebarHidden(false)
              }} />
          }
          <Breadcrumbs />
        </div>
        <div style={{
          minHeight: 'calc(100vh - var(--header-height) )',
          height: 'calc(100vh - var(--header-height) )',
          width: '100%',
          overflowX: 'auto',
          position: 'relative'
        }}>
          {isNavigating && <LoadingOverlay />}
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default GlobalRoot