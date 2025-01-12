import React, { useContext, useMemo } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { CodeFreeContext } from '../App'
import { User } from '../models/User.tsx'

export async function userDataLoader({ params }) {
    return await User.getUser(params.userid)
}

export async function currentUserDataLoader() {
    return await User.getCurrentUser()
}

function UserRoot() {
    const pathParams = useParams()

    const cfContext = useContext(CodeFreeContext)
    const userData = useMemo(() => cfContext.userInfo, [cfContext])

    if(pathParams.userid == null){
        return <Navigate to={`/user/${userData['user_name']}`} />
    }

    return (
        <div style={{
            height: '100%',
            minHeight: 'calc(100vh - var(--header-height))',
            maxHeight: '100%'
        }}>
            <Outlet />
        </div>
    )
}

export default UserRoot