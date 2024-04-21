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
        <div style={{
          padding: '10px 20px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          maxHeight: '100%',
          overflowY: 'auto'
        }}>
          {
            projectsList.map(({ project_id, project_name }) => {
              return <Link className='listItem' to={`/projects/${project_id}`} replace={false}>
                <div className='initialsCircle'>
                  {project_name.split(" ").map((word) => {
                    return word[0].toUpperCase()
                  })}
                </div> 
                <span>{project_name}</span>
              </Link>
            })
          }
        </div>
    </div>
  )
}

export default ProjectsList