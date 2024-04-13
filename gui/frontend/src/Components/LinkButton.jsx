import React from 'react'
import { Link } from 'react-router-dom'

function LinkButton({
  children,
  className,
  to,
  icon,
  title,
  ...props
}) {
  return (<React.Fragment>
    <Link 
      className={`linkButton${className ? " " + className : ""}`} 
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

export default LinkButton