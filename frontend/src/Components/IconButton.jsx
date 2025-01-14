import React, { useMemo } from 'react';

import { Link } from 'react-router-dom';

function IconButton({ children, className, to = null, icon, overlay = false, onClick = undefined, ...props }) {
  const clickHandler = useMemo(() => {
    return (e) => {
      e.stopPropagation();
                if(onClick){
                  onClick(e);
                }
    }
  }, [onClick])
    return to ? (
        <Link
            to={to}
            className={`buttonBase iconButton ${overlay && 'overlayButton'} ${className ? className : ''}`}
            onClick={clickHandler}
            {...props}
        >
            {icon}
        </Link>
    ) : (
        <button className={`buttonBase iconButton ${className ? className : ''}`} onClick={clickHandler} {...props}>
            {icon}
        </button>
    );
}

export default IconButton;
