import React, { useRef, useState, useEffect } from 'react'

import { IoChevronDownOutline } from "react-icons/io5";

function DropdownButton({
  children,
  className,
  to,
  icon,
  title,
  content = undefined,
  showOnlyIcon = false,
  showDropdownIcon = true,
  anchorDropDown = "right",
  ...props
}) {

  const dropdownRef = useRef();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  function clickedOutsideDropdown(e) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      dropdownRef.current.classList.remove('show')
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('click', clickedOutsideDropdown)
    return () => {
      window.removeEventListener('click', clickedOutsideDropdown)
    }
  }, [])

  const openDropdown = () => {
    dropdownRef.current.classList.add('show')
    setIsDropdownOpen(true)
  }

  const closeDropdown = () => {
    dropdownRef.current.classList.remove('show')
    setIsDropdownOpen(false)
  }

  return (<React.Fragment>

    <div
      className={`dropdownButton ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`}
      title={title}
      {...props}
    >
      <div className={`dropdownButtonDropdownSummary ${
        isDropdownOpen ? 'open' : ''
      } ${
        showOnlyIcon ? "iconOnly" : ""
      } ${
        showDropdownIcon ? 'chevronVisible' : ''  
      }`}
        onClick={(e) => {
          e.stopPropagation()
          if (dropdownRef.current.children.length > 0) {
            if (isDropdownOpen) {
              closeDropdown()
            }
            else {
              openDropdown()
            }
          }
        }}>
        {icon}
        {
          !showOnlyIcon &&
          (content || <span style={{
            flex: '1',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{title}</span>)
        }
        {showDropdownIcon &&
          <IoChevronDownOutline />
        }
      </div>
      <div ref={dropdownRef} className='dropdownButtonDropDown' style={{
        left: anchorDropDown === "left" ? "0" : "unset",
        right: anchorDropDown === "right" ? "0" : "unset",
      }} onClick={(e) => {
        e.stopPropagation()
        closeDropdown()
      }}>
        {typeof children === 'function' ? children({ open: openDropdown, close: closeDropdown, isOpen: isDropdownOpen }) : children}
      </div>
    </div>

  </React.Fragment>
  )
}

export default DropdownButton