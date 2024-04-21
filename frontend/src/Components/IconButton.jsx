import React from 'react'

import IconButtonStyles from './IconButton.module.css'

function IconButton({children, className, icon, ...props}) {
  return (
    <button className={`${IconButtonStyles.buttonBase} ${className ? className : ''}`} {...props}>
        {icon}
    </button>
  )
}

export default IconButton