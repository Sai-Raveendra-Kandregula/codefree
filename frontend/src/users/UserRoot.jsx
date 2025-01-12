import React, { useContext, useMemo } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { CodeFreeContext } from '../App'
import { getAPIURL } from '../hooks/useAPI.tsx'

export async function userDataLoader({ params }) {
    const resp = await fetch(getAPIURL(`/user/userdata/${params.userid}`), {
        credentials: "include"
    })
    if (resp.status !== 200) {
        throw resp
    }
    else {
        return resp.json()
    }
}

export async function currentUserDataLoader() {
    const resp = await fetch(getAPIURL(`/user/validate`), {
        credentials: "include"
    })
    if (resp.status !== 200) {
        return resp
    }
    else {
        return resp.json()
    }
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