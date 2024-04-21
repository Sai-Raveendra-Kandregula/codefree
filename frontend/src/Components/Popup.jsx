import React from 'react'
import Popup from 'reactjs-popup';

function PopupModal({
    children,
    onClose,
    ...props
}) {
    return (
        <Popup position="center center" {...props} onClose={onClose}>
            {children}
        </Popup>
    )
}

export default PopupModal