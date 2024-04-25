import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import LinkButton from '../../Components/LinkButton';
import IconButton from '../../Components/IconButton';
import PopupModal from '../../Components/Popup'

import { SERVER_BASE_URL } from '../../App'

import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdAdd, MdCheck, MdClose, MdOutlineFileUpload } from 'react-icons/md'

export async function reportListLoader( {params} ) {
  const resp = await fetch(`/api/reports/all-reports?project=${params.projectid}`)
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
  const [searchParams, setSearchParams] = useSearchParams();


  const [reportsList, setReportsLists] = useState([])

  function getReports() {
    fetch(`/api/reports/all-reports?project=${pathParams.projectid}`).then(
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

  function uploadReport() {
    const report = document.getElementById('upload_report').files[0]
    var fileReader = new FileReader()
    fileReader.onloadend = (e) => {
      // Generate POST Body
      var out = {}
      try {
        out = {
          "project_id": pathParams.projectid,
          "report": JSON.parse(e.target.result)
        }
      } catch (error) {
        alert('Invalid JSON File!')
        return
      }

      // Upload Result
      console.log(out)
      fetch(`/api/reports/upload-report`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(out)
      }).then(async (resp) => {
        if (resp.status == 201) {
          searchParams.delete('upload')
          setSearchParams(searchParams)
          getReports()
        }
        else if(resp.status == 404) {
          alert("Project Not Found.")
        }
        else if(resp.status == 406) {
          alert("Invalid Report Data.")
        }
        else if(resp.status == 409) {
          var error_obj = await resp.json()
          alert( ('message' in error_obj) ? error_obj['message'] : "Report already exists." )
        }
        else {
          alert("Error Uploading Report.")
        }
      })

    }
    fileReader.readAsText(report)
  }

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
      <PopupModal open={searchParams.get('upload') != null} nested
        onOpen={() => {
          document.getElementById('upload_report').focus()
        }}
        onClose={() => {
          searchParams.delete('upload')
          setSearchParams(searchParams)
        }}>
        <div style={{
          background: 'var(--background)',
          borderRadius: 'var(--border-radius)',
          padding: '20px',
          paddingTop: '0px',
          border: '1px solid var(--border-color)',
          minWidth: '500px',
          maxWidth: '500px',
          color: 'var(--foreground)',
          // height: '80vh',
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>
              Create Project
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <IconButton
                tabIndex={4}
                title="Cancel"
                icon={<MdClose style={{
                  fontSize: '1.25rem'
                }} />}
                onClick={() => {
                  searchParams.delete('upload')
                  setSearchParams(searchParams)
                }}
              />
              <IconButton
                tabIndex={3}
                title="Create Project"
                icon={<MdCheck style={{
                  fontSize: '1.25rem'
                }} />}
                onClick={() => {
                  uploadReport()
                }}
              />
            </div>
          </h3>
          <div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: '10px',
            }}>
              <label htmlFor="upload_report" style={{
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Upload Report (JSON file generated by CodeFree) :
              </label>
              <input type="file" name="upload_report" id="upload_report" placeholder='Choose Report File' accept='application/json' />
            </div>
          </div>
        </div>
      </PopupModal>
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
          to={`/projects/${pathParams.projectid}/reports?upload`}
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
        overflowY: 'auto',
        gap: '10px'
      }}>
        {
          reportsList.map(({ id }) => {
            return <Link className='listItem' to={`/projects/${pathParams.projectid}/reports/${id}`} replace={false}>
              <HiOutlineDocumentReport style={{
                fontSize: '1.25rem'
              }} />
              <span>Report #{id}</span>
            </Link>
          })
        }
      </div>
    </div>
  )
}

export default Reports