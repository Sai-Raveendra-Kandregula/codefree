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
            maxHeight: '100%',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: '20px',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <h2 className='projectTitle' style={{
                    boxSizing: 'border-box',
                    padding: '0 0 0 20px'
                }}>
                    {
                        projectInfo && projectInfo['name']
                    }
                </h2>
                <div className={`viewTypeCarousel`} style={{
                    border: 'none',
                    height: '100%'
                }}>
                    {
                        Object.keys(subPages).map((val) => {
                            return <Link
                                className={`viewTypeButton ${window.location.pathname.startsWith(subPages[val]['to']) ? "selected" : ""}`}
                                to={subPages[val]['to']}
                                replace={false}
                            >
                                {val}
                            </Link>
                        })
                    }
                </div>
            </div>
            <Outlet />
        </div>
    )
}

export default ProjectWrapper