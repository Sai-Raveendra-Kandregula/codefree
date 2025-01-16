import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { IoChevronDownOutline } from "react-icons/io5";
import DropdownButton from './Dropdown';

const HEADER_BUTTON_TYPES = {
  "LINK": 0,
  "DROPDOWN": 1
}

function HeaderButton({
  children,
  className,
  type = HEADER_BUTTON_TYPES.LINK,
  showDropdownIcon = true,
  to,
  icon,
  title,
  content,
  showOnlyIcon = false,
  anchorDropDown = "right",
  ...props
}) {

  const dropdownRef = useRef();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (<React.Fragment>
    {
      type === HEADER_BUTTON_TYPES.LINK &&
      <Link
        className={`buttonBase headerButton ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`}
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
        }}>{content ? content : title}</span>
      </Link>
    }
    {
      type === HEADER_BUTTON_TYPES.DROPDOWN &&
      <DropdownButton
        title={title}
        icon={icon}
        showOnlyIcon={showOnlyIcon}
        showDropdownIcon={showDropdownIcon}
        anchorDropDown={anchorDropDown}
        {...props}>
        {children}
      </DropdownButton>
    }
  </React.Fragment>
  )
}

export default HeaderButton

export {
  HEADER_BUTTON_TYPES
}