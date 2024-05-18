import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LinkButton from '../Components/LinkButton'
import {useRouteData} from '../App'
import { IoCheckmark } from "react-icons/io5";
import { VscDiscard } from "react-icons/vsc";

function ConfigureProject() {
    const navigate = useNavigate()
    const routeParams = useParams()
    const projectData = useRouteData('0-0')['projectInfo']
  return (
    <div style={{
      padding: '20px',
      width: 'var(--centered-content-width)',
      margin: 'var(--centered-content-margin)',
  }}>
    <h2>
      Configure Project
    </h2>

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginTop: '10px'
    }}>
      <div style={{
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <label htmlFor="project_id"><b>Project ID</b></label>
        <input type="text" name="project_id" id="project_id" defaultValue={projectData['slug']} disabled={true} />
      </div>
      <div style={{
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <label htmlFor="project_name"><b>Project Name</b></label>
        <input type="text" name="project_name" id="project_name" defaultValue={projectData['name']} />
      </div>
      {/* <div style={{
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px'
      }}>
        <input type="checkbox" name="project_webhooks" id="project_webhooks" />
        <label htmlFor="project_webhooks"><b>Enable Webhooks</b></label>
      </div> */}
      <div style={{
        marginTop: '5px',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: '10px',
      }}>
        <LinkButton className={'themeButton'} title={"Save All"} icon={<IoCheckmark />} onClick={(e) => {
          e.preventDefault()
          alert("Submit")
        }} />
        <LinkButton title={"Discard"} icon={<VscDiscard />} to={`/projects/${projectData['slug']}`} onClick={(e) => {
          e.preventDefault()
          if(window.confirm("Discard changes?")){
            navigate(`/projects/${projectData['slug']}`)
          }
        }} />
      </div>
    </div>
  </div>
  )
}

export default ConfigureProject