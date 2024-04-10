import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'


function ProjectHome() {
    const routeParams = useParams()
    const navigate = useNavigate();

  return (
    <div style={{
      padding: '0 20px'
  }}>
      Home for Project ID : {routeParams.projectid}

      <div>
        <a href={`/projects/${routeParams.projectid}/reports`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/projects/${routeParams.projectid}/reports`)
          }}
        >
          Reports
        </a>
      </div>
    </div>
  )
}

export default ProjectHome