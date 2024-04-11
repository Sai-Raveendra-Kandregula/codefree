import React from 'react'
import { Link } from 'react-router-dom'

function ProjectsList() {
  return (
    <div>
        <h2 style={{
          'padding': '0px 20px'
        }}>
          Projects List
        </h2>
        <hr />
        <ul>
            <li>
              <Link to="/projects/01">01</Link>
            </li>
        </ul>
    </div>
  )
}

export default ProjectsList