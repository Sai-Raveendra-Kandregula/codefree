import React, { useState, useEffect } from 'react'
import { Form, useSubmit, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import LinkButton from '../../Components/LinkButton';
import IconButton from '../../Components/IconButton';
import PopupModal from '../../Components/Popup'

import { SERVER_BASE_URL, useRouteData } from '../../App'

import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdAdd, MdCheck, MdClose, MdOutlineFileUpload } from 'react-icons/md'
import { toast } from 'react-toastify';

function CreateReport() {
  const navigate = useNavigate()
  const pathParams = useParams()
  const [searchParams, setSearchParams] = useSearchParams();

  const reportsList = useRouteData('0-0')['reportList'];

  const [dragOverHasFiles, setDragOverHasFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
        toast.error('Invalid JSON File!')
        return
      }

      fetch(`${SERVER_BASE_URL}/api/reports/upload-report?uploadedVia=CodeFree%20GUI`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(out)
      }).then(async (resp) => {
        if (resp.status == 201) {
          const out_obj = await resp.json()
          navigate(`/projects/${pathParams.projectid}/reports/${out_obj['report_id']}`)
        }
        else if (resp.status == 404) {
          toast.error("Project Not Found.")
        }
        else if (resp.status == 406) {
          toast.error("Invalid Report Data.")
        }
        else if (resp.status == 409) {
          var error_obj = await resp.json()
          toast.error(() => (<span>
            {`Error Uploading Report - Already exists : `}
            <a href={error_obj['report_url']}>Report {error_obj['report_id']}</a>
          </span>))
        }
        else {
          toast.error(`Error Uploading Report (Code : ${resp.statusText})`)
        }
      })

    }
    fileReader.readAsText(report)
  }

  return (
    <Form style={{
      height: '100%',
      padding: '30px',
      width: 'var(--centered-content-width)',
      margin: 'var(--centered-content-margin)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }} method='post' action='/projects/create'>
      <h2 style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0',
      }}>
        Upload a New Report
      </h2>
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <h3>
            Choose Report File
          </h3>
          <label htmlFor="upload_report" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            border: dragOverHasFiles ? '2px dashed var(--theme-color)' : '2px dashed var(--border-color)'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if(e.dataTransfer.files.length > 0){
              setDragOverHasFiles(true)
            }
            else{
              setDragOverHasFiles(false)
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            if(e.dataTransfer.files.length > 0){
              setDragOverHasFiles(true)
            }
            else{
              setDragOverHasFiles(false)
            }
          }}
          onDragLeave={(e)=>{
            e.preventDefault()
            setDragOverHasFiles(false)
          }}
          onDragExit={(e)=>{
            e.preventDefault()
            setDragOverHasFiles(false)
          }}
          onDrop={(e) =>{
            e.preventDefault()
            document.getElementById('upload_report').files = e.dataTransfer.files
            setSelectedFile(e.dataTransfer.files.length > 0 ? e.dataTransfer.files[0] : null)
          }}
          >
            {
              selectedFile ? <span>
                {selectedFile.name} ({Math.round(selectedFile.size/1024)} KB)
              </span>:
              <span>
                Click to pick a file, or drag and drop it here.
              </span>
            }
          </label>
          <input
            style={{
              display: 'none'
            }}
            onChange={(e) => {
              if(e.target.files.length > 0){
                setSelectedFile(e.target.files[0])
              }
              else{
                setSelectedFile(null)
              }
            }}
          type="file" name="upload_report" id="upload_report" placeholder='Choose Report File' accept='application/json' />
          
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
      }}>
        <LinkButton
          tabIndex={4}
          title="Cancel"
          icon={<MdClose style={{
            fontSize: '1.25rem'
          }} />}
          to={(reportsList.length == 0) ? `/projects/${pathParams.projectid}`
          : `/projects/${pathParams.projectid}/reports`}
        />
        <button
          className={`themeButton`}
          tabIndex={3}
          title="Upload Report"
          type="submit"
          onClick={(e) => {
            e.preventDefault()
            uploadReport()
          }}
        >
          <MdCheck style={{
            fontSize: '1.25rem'
          }} />
          Upload Report
        </button>
      </div>
    </Form>
  )
}

export default CreateReport