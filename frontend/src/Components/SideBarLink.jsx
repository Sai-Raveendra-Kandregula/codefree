import React from 'react'
import { Link } from 'react-router-dom'
import { SERVER_ROOT_PATH } from '../App'


function SideBarLink({
  children,
  className,
  to,
  icon,
  title,
  exact=true,
  ...props
}) {

  const locationMatches = [SERVER_ROOT_PATH + to, SERVER_ROOT_PATH + to + "/"]

  const locationMatched = () => {
    if(exact){
      return locationMatches.includes(window.location.pathname)
    }
    
    return window.location.pathname.startsWith(SERVER_ROOT_PATH + to)
  };

  return (<React.Fragment>
    <Link 
      className={`sideBarLink ${locationMatched() ? "active" : ""} ${className ? className : ""}`} 
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
        fontWeight: 500,
      }}>{title}</span>
    </Link>
  </React.Fragment>
  )
}

export default SideBarLink