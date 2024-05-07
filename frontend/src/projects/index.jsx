import React from 'react'
import { Outlet } from 'react-router-dom'

function ProjectsRoot() {
  return (
    <div style={{
      height: '100%',
      maxHeight: '100%'
  }}>
        <Outlet />
    </div>
  )
}

export default ProjectsRoot