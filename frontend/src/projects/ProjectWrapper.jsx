import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, Link, useSearchParams, useLoaderData } from 'react-router-dom'

export async function projectInfoLoader( {params} ) {
    const resp = await fetch(`/api/projects/get-project?slug=${params.projectid}`)
    if (resp.status != 200) {
        throw resp
    }
    else {
        return resp.json()
    }
}

function ProjectWrapper() {
    const navigate = useNavigate()

    const pathParams = useParams()

    const SERVER = process.env.REACT_APP_SERVER_BASE_URL || ''

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

    const projectInfo = useLoaderData();

    // const [projectInfo, setProjectInfo] = useState(null)

    // useEffect(() => {
    //     getProjectInfo();
    // }, [])

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