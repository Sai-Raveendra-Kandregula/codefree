import React from 'react'
import { Outlet } from 'react-router-dom'
import { Project } from '../models/Project.tsx'

export async function projectInfoLoader( {params} ) {
    return await Project.get(params.projectid)
}

function ProjectWrapper() {
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