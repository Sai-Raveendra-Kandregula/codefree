import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { userDataLoader } from '../users/UserRoot'
import UserAvatar from './UserAvatar'

function UserInfoHover({
    children,
    userData,
    style = {}
}) {

    const [showInfo, setShowInfo] = useState(null) // null | "top" | "bottom"

    const containerRef = useRef()

    return (
        <span ref={containerRef} style={{
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'row',
            'justifyContent': 'flex-start',
            ...style
        }} onMouseEnter={(e) => {
            var viewportOffset = containerRef.current.getBoundingClientRect();
            // these are relative to the viewport, i.e. the window
            var top = viewportOffset.top;
            var left = viewportOffset.left;

            const isLinkInTopHalfOfViewport = viewportOffset.bottom < ((window.innerHeight || document.documentElement.clientHeight) / 2)

            if (isLinkInTopHalfOfViewport) {
                setShowInfo("top")
            }
            else {
                setShowInfo("bottom")
            }
        }}
            onMouseLeave={() => {
                setShowInfo(null)
            }}
        >
            {
                showInfo && <div style={{
                    paddingTop: showInfo == "top" ? '5px' : '0',
                    paddingBottom: showInfo == "bottom" ? '5px' : '0',
                    position: 'absolute',
                    top: showInfo == "top" ? '100%' : 'auto',
                    bottom: showInfo == "bottom" ? '100%' : 'auto',
                    zIndex: '1500',
                }}>
                    <div style={{
                        background: 'var(--background)',
                        borderRadius: 'var(--border-radius)',
                        padding: '15px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '15px'
                        }}>
                            <UserAvatar userData={userData} size={1.25} showInfoOnHover={false} />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                gap: '5px'
                            }}>
                                <span>
                                    {userData['display_name']}
                                </span>
                                <span>
                                    {userData['email']}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            }
            {children}
        </span>
    )
}

function UserLink({
    user_id = null,
    admin_url = false,
    user_data = null,
    load_user_data=true,
    use_link=true,
    showAvatar = false,
    avatarSize = 1.25,
    style = {}
}) {

    const [userData, setUserData] = useState(user_data || {
        'display_name': user_id,
        'user_name' : user_id
    })

    async function getUserData() {
        try {
            const data = await userDataLoader({
                params: {
                    userid: user_id
                }
            })
            setUserData(data)
        }
        catch {
            // setUserData()
        }
    }

    useEffect(() => {
        if (!user_data && user_id && load_user_data) {
            getUserData()
        }
    }, [user_data, user_id, load_user_data])


    if (user_id == null && user_data == null) {
        return <></>
    }

    return (
        <UserInfoHover userData={userData} style={style}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {
                    showAvatar &&
                    <UserAvatar userData={userData} size={avatarSize} />
                }
                {
                    use_link ?
                    <Link to={admin_url ? `/admin-area/users/${userData['user_name']}` : `/user/${userData['user_name']}`}>
                        {userData['display_name']}
                    </Link>
                    :
                    <span>
                        {'display_name' in userData ? userData['display_name'] : userData['user_name']}
                    </span>
                }
            </div>
        </UserInfoHover>
    )
}

export default UserLink