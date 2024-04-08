import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom'

function ProjectWrapper() {
    const navigate = useNavigate()

    const pathParams = useParams()

    const SERVER = "http://localhost:8080"

    const [projectInfo, setProjectInfo] = useState(null)

    function getProjectInfo(){
        fetch(`${SERVER}/api/projects/get-project?project=${pathParams.projectid}`).then(
            (resp)=>{
                if (resp.status == 200){
                    return resp.json()
                }
                else{
                    return null
                }
            }).then((data) => {
                setProjectInfo(data)
            })
    }

    useEffect(() => {
        getProjectInfo();

      return () => {
        
      }
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
                    navigate(`/projects/${pathParams.projectid}`)
                }
            }>
                {
                    "#" + pathParams.projectid
                }
            </a>
        </h2>
        <Outlet />
    </div>
  )
}

export default ProjectWrapper