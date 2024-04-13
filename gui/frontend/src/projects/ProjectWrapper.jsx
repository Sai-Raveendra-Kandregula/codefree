import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'

function ProjectWrapper() {
    const navigate = useNavigate()

    const pathParams = useParams()

    const SERVER = `http://${window.location.hostname}:9000`
    // const SERVER = ``

    const subPages = {
        "Overview" : {
            "to" : `/projects/${pathParams.projectid}/overview`
        },
        "Reports" : {
            "to" : `/projects/${pathParams.projectid}/reports`
        },
        "Configure" : {
            "to" : `/projects/${pathParams.projectid}/configure`
        }
    }

    const [projectInfo, setProjectInfo] = useState(null)

    function getProjectInfo() {
        fetch(`${SERVER}/api/projects/get-project?project=${pathParams.projectid}`).then(
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
            <h2 className='projectTitle' style={{
                padding: '0 20px'
            }}>
                {
                    projectInfo && projectInfo['project_name']
                }
                <a className='projectID' href={`/projects/${pathParams.projectid}`} onClick={
                    (e) => {
                        e.preventDefault()
                        navigate(`/projects/${pathParams.projectid}`, {
                          replace: false  
                        })
                    }
                }>
                    {
                        "#" + pathParams.projectid
                    }
                </a>
            </h2>
            <div className={`viewTypeCarousel`}>
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
            <Outlet />
        </div>
    )
}

export default ProjectWrapper