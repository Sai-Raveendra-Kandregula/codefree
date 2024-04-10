import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'


function Reports() {
  const pathParams = useParams()
  const navigate = useNavigate()
  return (
    <div style={{
      padding: '0 20px'
    }}>
      Reports for Project ID : {pathParams.projectid}
      <div>
        <a className='projectID' href={`/projects/${pathParams.projectid}/reports/1`} onClick={
          (e) => {
            e.preventDefault()
            navigate(`/projects/${pathParams.projectid}/reports/1`)
          }
        }>
          01
        </a>
      </div>
    </div>
  )
}

export default Reports