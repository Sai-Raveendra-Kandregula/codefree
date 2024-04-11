import React from 'react'
import { Link } from 'react-router-dom'


function SideBarLink({
    children,
    className, 
    to,
    icon,
    title,
    ...props
}) {
  return (
    <Link className={`sideBarLink ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`} to={to} title={title} {...props}>
        {icon}
        <span style={{
            flex: '1',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }}>{title}</span>
    </Link>
  )
}

export default SideBarLink