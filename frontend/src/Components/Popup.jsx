import React from 'react'
import Popup from 'reactjs-popup';

function PopupModal({
    children,
    open,
    onOpen,
    onClose,
    ...props
}) {
    return (
        <Popup position="center center" open={open} {...props} onOpen={onOpen} onClose={onClose}>
            {children}
        </Popup>
    )
}

export default PopupModal