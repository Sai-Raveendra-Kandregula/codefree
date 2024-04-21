import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'

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

    const [projectInfo, setProjectInfo] = useState(null)

    function getProjectInfo() {
        fetch(`${SERVER}/api/projects/get-project?project_id=${pathParams.projectid}`).then(
            (resp) => {
                if (resp.status == 200) {
                    return resp.json()
                }
                else {
                    return null
                }
            }).then((data) => {
                setProjectInfo(data)
            })
    }

    useEffect(() => {
        getProjectInfo();
    }, [])

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