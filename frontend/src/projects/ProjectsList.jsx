import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SERVER_BASE_URL } from '../App'
 
function ProjectsList() {
  const [projectsList, setProjectsLists] = useState([])


  function getProjects() {
    fetch(`${SERVER_BASE_URL}/api/projects/all-projects`).then(
      (resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
        else {
          return null
        }
      }).then((data) => {
        setProjectsLists(data)
      }).catch((reason) => {
        console.log(`Error Fetching Report List : ${reason}`)
        setProjectsLists([])
      })
  }


  useEffect(() => {
    getProjects();
  }, [])

  return (
    <div>
        <h2 style={{
          'padding': '0px 20px'
        }}>
          Projects List
        </h2>
        <hr />
        <ul>
          {
            projectsList.map(({ project_id, project_name }) => {
              return <li>
                <Link to={`/projects/${project_id}`}>{project_name}</Link>
              </li>
            })
          }
        </ul>
    </div>
  )
}

export default ProjectsList