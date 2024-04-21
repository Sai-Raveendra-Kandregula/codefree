import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LinkButton from '../../Components/LinkButton';
import { SERVER_BASE_URL } from '../../App'

import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdOutlineFileUpload } from 'react-icons/md';

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
        gap: '20px'
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
        <LinkButton 
          className={'themeButton'}
          title={"Upload Report"}
          icon={<MdOutlineFileUpload style={{
            fontSize: '1.1rem'
          }} />}
          to={`/projects/${pathParams.projectid}/reports?create`}
          style={{
            fontSize: '0.9rem'
          }}
          replace={false}
        />
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