import React from 'react'
import { Link } from 'react-router-dom'

function LinkButton({
  children,
  className,
  to,
  icon,
  title,
  content = null,
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        paddingRight: icon ? '5px' : undefined
      }}>{content ? content : title}</span>
    </Link>
  </React.Fragment>
  )
}

export default LinkButton