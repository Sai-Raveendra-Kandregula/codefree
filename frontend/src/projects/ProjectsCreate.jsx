import React, { useState, useEffect } from 'react'
import { Form, Link, useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router-dom'
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { SERVER_BASE_URL, SERVER_ROOT_PATH } from '../App'
import LinkButton from '../Components/LinkButton'
import { MdAdd, MdCheck, MdClose } from 'react-icons/md'
import PopupModal from '../Components/Popup'
import IconButton from '../Components/IconButton'
import { toast } from 'react-toastify';
import { StatusCodes } from 'http-status-codes';

export const projectCreateAction = async ({ request, params }) => {
  let formData = await request.formData()

  if (formData.get('name').length < 4) {
    toast.warning("Project Name has to be at least of length 3")
    return {}
  }
  if (formData.get('slug').length < 4) {
    toast.warning("Project Slug has to be at least of length 3")
    return {}
  }

  switch (request.method) {
    case "POST": {
      let submitData = Object.fromEntries(formData)
      const resp = await fetch(`${SERVER_BASE_URL}/api/projects/create-project`, {
        method: 'post',
        body: JSON.stringify(submitData),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      if (resp.status == StatusCodes.CREATED) {
        toast.success(`Project creation successful.`)
        window.location.href = `${SERVER_ROOT_PATH}/projects/${submitData['slug']}`
      }
      else if (resp.status == StatusCodes.CONFLICT) {
        toast.error(`Error Creating Project : Project Already Exists`)
      }
      else {
        toast.error(`Error Creating Project : ${resp.statusText}`)
      }
      return await resp.json()
    }
    default: {
      throw new Response("", { status: 405 });
    }
  }
}

function ProjectsCreate() {
  const navigate = useNavigate();
  const submit = useSubmit();

  const [remoteRepoConfig, setRemoteRepoConfig] = useState(false)

  const remote_repo_mappings = {
    "gitlab": {
      "commit_suffix": "/-/commit/"
    },
    "github" : {
      "commit_suffix": "/commit/"
    }
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
        Create a New Project
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
            Project Settings
          </h3>
          <label htmlFor="project_name" style={{
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Project Name :
          </label>
          <input tabIndex={1} type="text" name="name" id="project_name"
            onChange={(e) => {
              const slug_element = document.getElementById('project_slug')

              slug_element.value = e.target.value.trim().replaceAll(" ", "-").toLowerCase()
            }} />
          <label htmlFor="project_slug" style={{
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Project Slug (You cannot change this later) :
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span>{window.location.protocol}//{window.location.host}/projects/</span>
            <input tabIndex={2} type="text" name="slug" id="project_slug" />
          </div>

          <hr />

          <h3 style={{
            margin: 0
          }}>
            Remote Git Repository Settings
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '5px'
          }}>
            <input tabIndex={2} type="checkbox" id="project_has_remote" onChange={(e) => {
              setRemoteRepoConfig(e.target.checked)
            }} />
            <label htmlFor="project_has_remote" style={{
              fontSize: '0.9rem',
              fontWeight: '400'
            }}>
              Link to Remote Repository
            </label>
          </div>

          {
            remoteRepoConfig && <React.Fragment>

              <label htmlFor="remote_type" style={{
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Remote Repository Type :
              </label>
              <select name="" id="remote_type">
                <option value="gitlab">Gitlab</option>
                <option value="github">Github</option>
              </select>

              <label htmlFor="git_remote_url" style={{
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Project Remote Repository URL :
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}>
                <input tabIndex={2} type="text" name="git_remote_url" id="git_remote_url"

                  onChange={(e) => {
                    const remote_type = document.getElementById('remote_type').value
                    const commit_url_elem = document.getElementById('git_remote_commit_url')
                    try {
                      const baseURL = e.target.value.replace(/\/+$/, '')
                      commit_url_elem.value = baseURL + remote_repo_mappings[remote_type].commit_suffix
                    } catch (error) {

                    }
                  }} />
              </div>

              <label htmlFor="git_remote_commit_url" style={{
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Project Remote Repository Commit URL :
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}>
                <input tabIndex={2} type="text" readOnly name="git_remote_commit_url" id="git_remote_commit_url" />
              </div>
            </React.Fragment>
          }
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
          to={`/projects`}
        />
        <button
          className={`themeButton`}
          tabIndex={3}
          title="Create Project"
          type="submit"
        >
          <MdCheck style={{
            fontSize: '1.25rem'
          }} />
          Create Project
        </button>
      </div>
    </Form>
  )
}

export default ProjectsCreate