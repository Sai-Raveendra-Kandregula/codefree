import React from 'react'
import { Outlet } from 'react-router-dom'
import { getAPIURL } from '../hooks/useAPI.tsx'

export async function projectInfoLoader( {params} ) {
    const resp = await fetch(getAPIURL(`/project/${params.projectid}`))
    if (resp.status !== 200) {
        throw resp.status
    }
    else {
        return resp.json()
    }
}

function ProjectWrapper() {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Outlet />
        </div>
    )
}

export default ProjectWrapper