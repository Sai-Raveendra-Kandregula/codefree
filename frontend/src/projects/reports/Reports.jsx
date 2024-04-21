import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SERVER_BASE_URL } from '../../App'

import { HiOutlineDocumentReport } from "react-icons/hi";

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
      padding: '20px 20px 20px 20px',
      display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        gap: '10px'
    }}>
      {/* <h2>
        Reports
      </h2> */}
      {/* Reports for Project ID : {pathParams.projectid} */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <input type='text' placeholder='Search Reports' />
      </div>
      <div style={{
        padding: '0 0 20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto'
      }}>
        {
          reportsList.map(({ report_id }) => {
            return <Link className='listItem' to={`/projects/${pathParams.projectid}/reports/${report_id}`} replace={false}>
              <HiOutlineDocumentReport style={{
                fontSize: '1.25rem'
              }} />
              <span>Report #{report_id}</span>
            </Link>
          })
        }
      </div>
    </div>
  )
}

export default Reports