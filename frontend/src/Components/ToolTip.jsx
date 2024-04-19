import React from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'

function ToolTip({
    children,
    popup,
    anchorDropDown = "right",
    ...props
}) {

    const popUpRef = useRef()

    const [isPopupOpen, setIsPopupOpen] = useState(false)

    const clickedOutside = (e) => {
        if (popUpRef.current && !popUpRef.current.contains(e.target)) {
            popUpRef.current.classList.remove('show')
            setIsPopupOpen(false)
        }
    }

    useEffect(() => {
        if (isPopupOpen) {
            window.addEventListener('click', clickedOutside, { once: true })
        }
    }, [isPopupOpen])


    const openPopup = () => {
        popUpRef.current.classList.add('show')
        setIsPopupOpen(true)
    }

    const closePopup = () => {
        popUpRef.current.classList.remove('show')
        window.removeEventListener('click', clickedOutside, { once: true })
        setIsPopupOpen(false)
    }

    return (
        <div className='tooltip'>
            <div className='tooltipPopupSummary' onClick={ children === 'function' ? null : (e) => {
                    e.stopPropagation()
                } }>
                {
                    typeof children === 'function' ? children({ open: openPopup, close: closePopup, isOpen: isPopupOpen }) : children
                }
            </div>
            <div ref={popUpRef} className='tooltipPopup' style={{
                left: anchorDropDown == "left" ? "0" : "unset",
                right: anchorDropDown == "right" ? "0" : "unset",
            }}>
                {popup}
            </div>
        </div>
    )
}

export default ToolTip