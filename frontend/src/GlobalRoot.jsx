import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLoaderData, useNavigate, useParams } from 'react-router-dom'
import useBreadcrumbs from "use-react-router-breadcrumbs";

import { CiLight, CiDark } from "react-icons/ci";
import { GoHome, GoProject, GoGear, GoCodeSquare } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";

import * as TbIcons from 'react-icons/tb'

import { BiUserCircle, BiLogIn } from "react-icons/bi";
import { LuUser2, LuUsers2, LuLogOut, LuSettings, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

import GlobalRootStyles from './styles/globalroot.module.css'
import IconButton from './Components/IconButton'
import SideBarLink from './Components/SideBarLink';
import { SERVER_BASE_URL, SERVER_ROOT_PATH } from './App';
import HeaderButton, { HEADER_BUTTON_TYPES } from './Components/HeaderButton';
import LinkButton from './Components/LinkButton';
import { AppContext } from './NotFoundContext';
import ErrorPage from './ErrorPage';
import { projectInfoLoader } from './projects/ProjectWrapper';
import { reportDataLoader } from './projects/reports/ReportViewer';
import { reportListLoader } from './projects/reports/Reports';
import 'react-toastify/dist/ReactToastify.css';
import { userDataLoader } from './users/UserRoot';
import UserAvatar from './Components/UserAvatar';

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

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();
  return (
    <React.Fragment>
      {breadcrumbs.map(({ breadcrumb, key }, ind) => {
        const crumb = <Link key={key} className={`${GlobalRootStyles.breadCrumbLink}`} to={key}>{toTitleCase(breadcrumb.props.children)}</Link>
        if (ind == 0) {
          return
        }
        if (ind == 1) {
          return crumb
        }
        else {
          return <React.Fragment key={key}>
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

async function getUserName() {
  const resp = await fetch(`${SERVER_BASE_URL}/api/user/validate`, {
    credentials: "include"
  })
  if (resp.status != 200) {
    window.location.href = `${SERVER_ROOT_PATH}/sign-in?redirect=${window.location.href}`
  }
  else {
    return resp.json()
  }
}

export async function globalRootLoader({ params }) {
  const out = {}
  out['user'] = await getUserName()
  if (params.userid) {
    out['userInfo'] = await userDataLoader({ params })
  }
  if (params.projectid) {
    out['projectInfo'] = await projectInfoLoader({ params })
    out['reportList'] = await reportListLoader({ params })
  }
  if (params.reportid) {
    out['reportData'] = await reportDataLoader({ params })
  }
  return out
}

function GlobalRoot() {

  const navigate = useNavigate();
  const pathParams = useParams();

  const { lastReport } = useContext(AppContext);

  const rootLoaderData = useLoaderData()

  const [sidebarHidden, setSidebarHidden] = useState(false)

  function AuthHeader() {
    return <React.Fragment>
      {
        rootLoaderData['user'] ?
          <HeaderButton className={`buttonBase`} type={HEADER_BUTTON_TYPES.DROPDOWN} icon={<UserAvatar userData={rootLoaderData['user']} />} showDropdownIcon={false} title={rootLoaderData['user']['user_name']} >
            <SideBarLink to={`/user/${rootLoaderData['user']['user_name']}`} title={"Profile"} replace={false} icon={<LuUser2 />} />
            <SideBarLink to={`/user/${rootLoaderData['user']['user_name']}/preferences`} title={"Preferences"} replace={false} icon={<LuSettings />} />
            <SideBarLink to={`/sign-out`} title={"Sign Out"} replace={false} icon={<LuLogOut />} />
          </HeaderButton>
          :
          <HeaderButton replace={false} type={HEADER_BUTTON_TYPES.LINK} icon={<BiLogIn />} title={"Sign In"} to={"/sign-in"} />
      }
    </React.Fragment>
  }

  const sideBarItems = () => {
    if((window.location.pathname).startsWith(SERVER_ROOT_PATH + "/admin-area")){
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
            {/* <SideBarLink to={`/system-preferences`} title={rootLoaderData['user']['display_name']} icon={<LuUser2 />} /> */}
            <SideBarLink to={`/admin-area/users`} title={'Users'} icon={<LuUsers2 />} exact={false} />
          </React.Fragment>
        }
      </React.Fragment>
    }

    if (pathParams.userid && pathParams.userid == rootLoaderData['user']['user_name']) {
      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
            {
              (rootLoaderData['user']['display_name'] != null ? rootLoaderData['user']['display_name'] : rootLoaderData['user']['user_name'])
            }
          </b>
        </div>
        {
          <React.Fragment>
            <SideBarLink to={`/user/profile`} title={rootLoaderData['user']['display_name']} icon={<LuUser2 />} />
            <SideBarLink to={`/user/${rootLoaderData['user']['user_name']}/preferences`} title={'Preferences'} icon={<LuSettings />} />
          </React.Fragment>
        }
      </React.Fragment>

    }

    if (pathParams.projectid) {
      var ProjectIcon = GoProject
      if (rootLoaderData['projectInfo'] && isAlphabet(rootLoaderData['projectInfo']['name'][0].toLowerCase())) {
        ProjectIcon = TbIcons[`TbSquareLetter${rootLoaderData['projectInfo']['name'][0].toUpperCase()}`]
      }
      else if (rootLoaderData['projectInfo'] && isNumeric(rootLoaderData['projectInfo']['name'][0])) {
        ProjectIcon = TbIcons[`TbSquareNumber${rootLoaderData['projectInfo']['name'][0].toUpperCase()}`]
      }

      return <React.Fragment>
        <div style={{
          padding: '10px'
        }}>
          <b>
            {
              pathParams.reportid ? `${rootLoaderData['projectInfo'] && rootLoaderData['projectInfo']['name']} - Reports`
                : (rootLoaderData['projectInfo'] && "Project")
            }
          </b>
        </div>
        {
          pathParams.reportid ? <React.Fragment>
            {
              rootLoaderData['reportList'].map((report) => {
                return <SideBarLink key={report['id']} to={`/projects/${pathParams.projectid}/reports/${report['id']}`}
                  className={pathParams.reportid && pathParams.reportid.toLowerCase() == 'last-report' && report['id'] == lastReport && "active"}
                  title={`Report #${report['id']}`} icon={<HiOutlineDocumentReport />} />
              })
            }
          </React.Fragment>
            : <React.Fragment>
              <SideBarLink to={`/projects/${pathParams.projectid}`} title={rootLoaderData['projectInfo'] && rootLoaderData['projectInfo']['name']}
                icon={<ProjectIcon />} />
                {
                  rootLoaderData['reportList'] && rootLoaderData['reportList'].length > 0 &&
                  <SideBarLink to={`/projects/${pathParams.projectid}/reports`} title={'Reports'} icon={<GoCodeSquare />} />
                }
              <SideBarLink to={`/projects/${pathParams.projectid}/configure`} title={'Settings'} icon={<LuSettings />} />
            </React.Fragment>
        }
      </React.Fragment>
    }
    else {
      return <React.Fragment>
        <SideBarLink to={'/home'} title={'Home'} icon={<GoHome />} />
        <SideBarLink to={'/projects'} title={'Projects'} icon={<GoProject />} />
        {
          rootLoaderData['user'] && rootLoaderData['user']['is_user_admin'] &&
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
            paddingLeft: '10px',
          }}>
            <Link to='/'>
              CodeFree
            </Link>
          </div>
          <IconButton title="Collapse Nav Pane" icon={<LuPanelLeftClose />} onClick={(e) => {
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
          padding: '0 20px',
          gap: '7.5px',
          position: 'sticky',
          top: '0',
          zIndex: '999',
        }}>
          {
            sidebarHidden && <IconButton title="Expand Nav Pane" icon={<LuPanelLeftOpen />}
              style={{
                marginRight: '10px'
              }}
              onClick={(e) => {
                setSidebarHidden(false)
              }} />
          }
          <Breadcrumbs />
        </div>
        <div style={{
          minHeight: 'calc(100vh - var(--header-height) )',
          height: 'calc(100vh - var(--header-height) )',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default GlobalRoot