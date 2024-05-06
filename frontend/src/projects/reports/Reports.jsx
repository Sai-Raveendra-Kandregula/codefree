import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import LinkButton from '../../Components/LinkButton';
import IconButton from '../../Components/IconButton';
import PopupModal from '../../Components/Popup'

import { SERVER_BASE_URL, useRouteData } from '../../App'

import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdAdd, MdCheck, MdClose, MdOutlineFileUpload } from 'react-icons/md'

export async function reportListLoader({ params }) {
  const resp = await fetch(`${SERVER_BASE_URL}/api/reports/all-reports?project=${params.projectid}`)
  if (resp.status == 200) {
    return resp.json()
  }
  else {
    throw resp
  }
}

function Reports() {
  const navigate = useNavigate()
  const pathParams = useParams()

  const reportsList = useRouteData('0-3')['reportList'];

  useEffect(() => {
    if (reportsList.length == 0) {
      navigate(`/projects/${pathParams.projectid}`)
    }
  }, [])

  return (
    <div style={{
      padding: '20px 20px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      height: '100%',
      gap: '20px'
    }}>
      {
        reportsList.length > 0 &&
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <input type='text' placeholder='Search Reports' disabled={reportsList.length <= 0} />
          <LinkButton
            className={'themeButton'}
            title={"Upload"}
            icon={<MdOutlineFileUpload style={{
              fontSize: '1.1rem'
            }} />}
            to={`/projects/${pathParams.projectid}/reports/upload`}
            style={{
              fontSize: '0.9rem'
            }}
            replace={false}
          />
        </div>
      }
      <div style={{
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        gap: '10px'
      }}>
        {
          reportsList.length > 0 ?
            reportsList.map(({ id }) => {
              return <Link key={`report_${pathParams.projectid}_${id}`} className='listItem' to={`/projects/${pathParams.projectid}/reports/${id}`} replace={false}>
                <HiOutlineDocumentReport style={{
                  fontSize: '1.25rem'
                }} />
                <span>Report #{id}</span>
              </Link>
            })
            :
            <div className="appPanel" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              height: '100%'
            }}>
              <p>
                There are no reports found for this project. Run a CodeFree test <b>from the CLI</b>,<br />or
              </p>
              <LinkButton className={'themeButton'} to={`/projects/${pathParams.projectid}/reports/upload`} title={'Upload a Report'} />
            </div>
        }
      </div>
    </div>
  )
}

export default Reports