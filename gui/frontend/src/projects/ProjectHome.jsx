import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LinkButton from '../Components/LinkButton'

function ProjectHome() {
    const routeParams = useParams()
    const navigate = useNavigate();

  return (
    <div style={{
      padding: '20px'
  }}>

      <div className='appPanel' style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        Home for Project ID : {routeParams.projectid}
        <LinkButton to={`/projects/${routeParams.projectid}/lastReport`} title={"View Last Report"} />
      </div>
    </div>
  )
}

export default ProjectHome