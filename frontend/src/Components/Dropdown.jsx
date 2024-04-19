import React, { useRef } from 'react'
import { Link } from 'react-router-dom'

import { IoChevronDownOutline } from "react-icons/io5";

function DropdownButton({
  children,
  className,
  to,
  icon,
  title,
  showOnlyIcon = false,
  anchorDropDown = "right",
  ...props
}) {

  const dropdownRef = useRef();

  const closeDropdown = () => {
    dropdownRef.current.classList.remove('show')
  }

  return (<React.Fragment>

    <div
      className={`dropdownButton ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`}
      title={title}
      {...props}>
      <div className="dropdownButtonDropdownSummary"
        onClick={() => {
          if (dropdownRef.current.children.length > 0) {
            dropdownRef.current.classList.add('show')

            setTimeout(() => {
              window.addEventListener('click', function (e) {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                  dropdownRef.current.classList.remove('show')
                }
              }, { once: true })
            }, 10)
          }
        }}>
        {icon}
        {
          !showOnlyIcon && 
          <span style={{
            flex: '1',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{title}</span>
        }
        <IoChevronDownOutline />
      </div>
      <div ref={dropdownRef} className='dropdownButtonDropDown' style={{
        left : anchorDropDown == "left" ? "0" : "unset",
        right : anchorDropDown == "right" ? "0" : "unset",
      }}>
        {typeof children === 'function' ? children({closeDropdown: closeDropdown}) : children}
      </div>
    </div>

  </React.Fragment>
  )
}

export default DropdownButton