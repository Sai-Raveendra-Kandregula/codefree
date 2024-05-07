import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { userDataLoader } from '../users/UserRoot'
import UserAvatar from './UserAvatar'

function UserLink({
    user_id = null,
    admin_url = false
}) {

    const [userData, setUserData] = useState({
        'display_name': user_id
    })

    const [showInfo, setShowInfo] = useState(null) // null | "top" | "bottom"

    const containerRef = useRef()

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
            setUserData()
        }
    }

    useEffect(() => {
        if (user_id) {
            getUserData()
        }
    }, [user_id])


    if (user_id == null) {
        return <></>
    }

    return (
        <span ref={containerRef} style={{
            position: 'relative',
            display: 'inline-block'
        }} onMouseEnter={(e) => {
            var viewportOffset = containerRef.current.getBoundingClientRect();
            // these are relative to the viewport, i.e. the window
            var top = viewportOffset.top;
            var left = viewportOffset.left;

            const isLinkInTopHalfOfViewport = viewportOffset.bottom < ((window.innerHeight || document.documentElement.clientHeight)/2)

            // console.log(isLinkInTopHalfOfViewport)
            if(isLinkInTopHalfOfViewport){
                setShowInfo("top")
            }
            else{
                setShowInfo("bottom")
            }
        }}
            onMouseLeave={() => {
                setShowInfo(null)
            }}
        >
            {
                showInfo && <div style={{
                    background: 'var(--background)',
                    borderRadius: 'var(--border-radius)',
                    position: 'absolute',
                    top : showInfo == "top" ? '100%' : 'auto',
                    bottom : showInfo == "bottom" ? '100%' : 'auto',
                    zIndex: '1500',
                    padding: '15px',
                    border: '1px solid var(--border-color)'
                }}>
                    <UserAvatar userData={userData} size={1} />
                    {userData['display_name']}
                    {userData['email']}
                </div>
            }
            <Link to={admin_url ? `/admin-area/users/${user_id}` : `/user/${user_id}`}>
                {userData['display_name']}
            </Link>
        </span>
    )
}

export default UserLink