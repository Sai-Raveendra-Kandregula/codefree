import React from 'react'
import { Link } from 'react-router-dom'
import { SERVER_ROOT_PATH } from '../App'


function SideBarLink({
  children,
  className,
  to,
  icon,
  title,
  ...props
}) {
  return (<React.Fragment>
    <Link 
      className={`sideBarLink ${[SERVER_ROOT_PATH + to, SERVER_ROOT_PATH + to + "/"].includes(window.location.pathname) ? "active" : ""} ${className ? className : ""}`} 
      to={to} 
      title={title} 
      replace={false}
      {...props}>
      {icon}
      <span style={{
        flex: '1',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{title}</span>
    </Link>
  </React.Fragment>
  )
}

export default SideBarLink