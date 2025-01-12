import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { useRouteData } from "./hooks/useRouteData.tsx";
import { Link } from "react-router-dom";

import GlobalRootStyles from './styles/globalroot.module.css'

export const Breadcrumbs = () => {

    const userData = useRouteData('user-info')
    const projectInfo = useRouteData('project-root')

    const routes = [
        { path: "/user/:userid", breadcrumb: userData && userData['display_name'] },
        { path: "/admin-area", breadcrumb: "Admin Area" },
        { path: "/admin-area/users/create-user", breadcrumb: "Create User" },
        { path: "/admin-area/users/:userid", breadcrumb: userData && userData['display_name'] },
        { path: "/projects/:projectid", breadcrumb: projectInfo && projectInfo['name'] },
    ]

    const breadcrumbs = useBreadcrumbs(routes);
    return (
        <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 5px',
            gap: '7.5px',
        }}>
            {breadcrumbs.map(({ breadcrumb, key }, ind) => {
                const crumb = <Link key={key} className={`${GlobalRootStyles.breadCrumbLink}`} to={key}>{breadcrumb}</Link>
                if (ind === 0) {
                    return null
                }
                if (ind === 1) {
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
        </div>
    );
};