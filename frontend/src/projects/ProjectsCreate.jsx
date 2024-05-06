import React, { useState, useEffect } from 'react'
import { Link, useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router-dom'
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { SERVER_BASE_URL, SERVER_ROOT_PATH } from '../App'
import LinkButton from '../Components/LinkButton'
import { MdAdd, MdCheck, MdClose } from 'react-icons/md'
import PopupModal from '../Components/Popup'
import IconButton from '../Components/IconButton'
import { toast } from 'react-toastify';
import { StatusCodes } from 'http-status-codes';

export const projectCreateAction = async ({ request, params }) => {
  switch (request.method) {
    case "POST": {
      let formData = await request.formData()
            let submitData = Object.fromEntries(formData)
            console.log(submitData)
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
            else if(resp.status == StatusCodes.CONFLICT){
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

  function createProject() {
    const project_name = document.getElementById('project_name').value.trim()
    const project_slug = document.getElementById('project_slug').value.trim()
    if (project_name.length < 4) {
      toast.warning("Project Name has to be at least of length 3")
      return
    }
    if (project_slug.length < 4) {
      toast.warning("Project Slug has to be at least of length 3")
      return
    }

    const formdata = new FormData()
    formdata.append("name", project_name)
    formdata.append("slug", project_slug)

    submit(formdata, {'method' : 'POST'})
  }

  return (
    <div style={{
      height: '100%',
      padding: '30px',
      width: '500px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <h3 style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0'
      }}>
        Create Project
      </h3>
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <label htmlFor="project_name" style={{
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Project Name :
          </label>
          <input tabIndex={1} type="text" name="project_name" id="project_name"
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                createProject()
              }
            }}
            onChange={(e) => {
              const slug_element = document.getElementById('project_slug')

              slug_element.value = e.target.value.trim().replaceAll(" ", "-").toLowerCase()
            }} />
          <hr />
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
            <input tabIndex={2} type="text" name="project_slug" id="project_slug" onKeyDown={(e) => {
              if (e.key == "Enter") {
                createProject()
              }
            }} />
          </div>
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
        <LinkButton
          className={`themeButton`}
          tabIndex={3}
          title="Create Project"
          icon={<MdCheck style={{
            fontSize: '1.25rem'
          }} />}
          onClick={(e) => {
            e.preventDefault()
            createProject()
          }}
        />
      </div>
    </div>
  )
}

export default ProjectsCreate