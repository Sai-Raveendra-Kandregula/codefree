import React from 'react'
import { useParams } from 'react-router-dom'


function ProjectHome() {
    const routeParams = useParams()
  return (
    <div>Home for Project ID : {routeParams.projectid}</div>
  )
}

export default ProjectHome