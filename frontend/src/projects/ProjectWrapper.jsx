import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { SERVER_BASE_URL } from '../App'

export async function projectInfoLoader( {params} ) {
    const resp = await fetch(`${SERVER_BASE_URL}/api/projects/get-project?slug=${params.projectid}`)
    if (resp.status != 200) {
        throw resp.status
    }
    else {
        return resp.json()
    }
}

function ProjectWrapper() {
    const navigate = useNavigate()

    const pathParams = useParams()

    const subPages = {
        "Overview": {
            "to": `/projects/${pathParams.projectid}/overview`
        },
        "Reports": {
            "to": `/projects/${pathParams.projectid}/reports`
        },
        "Configure": {
            "to": `/projects/${pathParams.projectid}/configure`
        }
    }

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