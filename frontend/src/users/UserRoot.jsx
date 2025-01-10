import React from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { SERVER_BASE_URL, useRouteData } from '../App'
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

    const userData = useRouteData('0-0')['user']

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