import React, { useRef } from 'react'
import { Link } from 'react-router-dom'

import { IoChevronDownOutline } from "react-icons/io5";

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
  anchorDropDown = "right",
  ...props
}) {

  const dropdownRef = useRef();

  return (<React.Fragment>
    {
      type == HEADER_BUTTON_TYPES.LINK &&
      <Link
        className={`headerButton ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`}
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
      type == HEADER_BUTTON_TYPES.DROPDOWN &&
      <div
        className={`headerButton ${window.location.pathname.startsWith(to) ? "active" : ""} ${className ? className : ""}`}
        title={title}
        {...props}>
        <div className="headerButtonDropdownSummary"
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
            content && <span style={{
              flex: '1',
              overflowX: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{content}</span>
          }
          {
            showDropdownIcon &&
            <IoChevronDownOutline />
          }
        </div>
        <div ref={dropdownRef} className='headerButtonDropDown' style={{
          left: anchorDropDown == "left" ? "0" : "unset",
          right: anchorDropDown == "right" ? "0" : "unset",
        }}>
          {children}
        </div>
      </div>
    }
  </React.Fragment>
  )
}

export default HeaderButton

export {
  HEADER_BUTTON_TYPES
}