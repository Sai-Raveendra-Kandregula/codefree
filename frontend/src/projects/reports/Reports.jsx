import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SERVER_BASE_URL } from '../../App'


function Reports() {
  const pathParams = useParams()
  const navigate = useNavigate()

  const [reportsList, setReportsLists] = useState([])

  function getReports() {
    fetch(`${SERVER_BASE_URL}/api/reports/all-reports?project=${pathParams.projectid}`).then(
      (resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
        else {
          return null
        }
      }).then((data) => {
        setReportsLists(data)
      }).catch((reason) => {
        console.log(`Error Fetching Report List : ${reason}`)
        setReportsLists([])
      })
  }

  useEffect(() => {
    getReports()
  }, []);

  return (
    <div style={{
      padding: '20px'
    }}>
      Reports for Project ID : {pathParams.projectid}
      <div>
        {
          reportsList.map(({ report_id }) => {
            return <a className='projectID' href={`/projects/${pathParams.projectid}/reports/${report_id}`} onClick={
              (e) => {
                e.preventDefault()
                navigate(`/projects/${pathParams.projectid}/reports/${report_id}`, {
                  replace: false
                })
              }
            }>
              Report #{report_id}
            </a>
          })
        }
      </div>
    </div>
  )
}

export default Reports