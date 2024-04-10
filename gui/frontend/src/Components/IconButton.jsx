import React from 'react'

import IconButtonStyles from './IconButton.module.css'

function IconButton({children, className, Icon, ...props}) {
  return (
    <button className={`${IconButtonStyles.buttonBase} ${className ? className : ''}`} {...props}>
        <Icon />
    </button>
  )
}

export default IconButton