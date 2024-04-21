import React from 'react'
import Popup from 'reactjs-popup';

function PopupModal({
    children,
    onOpen,
    onClose,
    ...props
}) {
    return (
        <Popup position="center center" {...props} onOpen={onOpen} onClose={onClose}>
            {children}
        </Popup>
    )
}

export default PopupModal