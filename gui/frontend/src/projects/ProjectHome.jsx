import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'


function ProjectHome() {
    const routeParams = useParams()
    const navigate = useNavigate();

  return (
    <div style={{
      padding: '0 20px'
  }}>
      Home for Project ID : {routeParams.projectid}

      <div>
        <Link to={`/projects/${routeParams.projectid}/reports`}>
          Reports
        </Link>
      </div>
    </div>
  )
}

export default ProjectHome