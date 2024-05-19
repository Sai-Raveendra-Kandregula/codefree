import React from 'react'
import { NameInitialsAvatar } from 'react-name-initials-avatar'

function UserAvatar({
    userData = {},
    size = 1,
    showInfoOnHover = true,
    style = {}
}) {
    return (
        <div style={style}>
            {
                userData['avatar_data'] ?
                    <img id='avatar_preview' src={`${userData['avatar_data']}`} style={{
                        display: 'block',
                        height: `${size * 1.65}rem`,
                        width: `${size * 1.65}rem`,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }} />
                    :
                    <NameInitialsAvatar
                        name={`${'display_name' in userData ? userData['display_name'] : userData['user_name']}}`}
                        borderStyle='none'
                        bgColor={userData['avatar_color']}
                        size={`${size * 1.65}rem`}
                        textColor='white'
                        textSize={`${(size * 1.65) * (0.65 / 1.65)}rem`} />
            }
        </div>
    )
}

export default UserAvatar