import React from 'react'

import { Link } from 'react-router-dom'

function IconButton({
  children, 
  className, 
  to=null, 
  icon, 
  overlay=false, 
  ...props
}) {
  return ( to ?
    <Link to={to} className={`buttonBase ${overlay && 'overlayButton'} ${className ? className : ''}`} {...props}>
        {icon}
    </Link>
    :
    <button className={`buttonBase ${className ? className : ''}`} {...props}>
        {icon}
    </button>
  )
}

export default IconButton