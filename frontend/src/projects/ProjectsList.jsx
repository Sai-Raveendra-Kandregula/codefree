import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {NameInitialsAvatar} from 'react-name-initials-avatar';
import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { MdAdd, MdCheck, MdClose } from 'react-icons/md'
import PopupModal from '../Components/Popup'
import IconButton from '../Components/IconButton'

function ProjectsList() {
  const navigate = useNavigate();
  const [projectsList, setProjectsLists] = useState([])

  const [searchParams, setSearchParams] = useSearchParams();

  function getProjects() {

    fetch(`${SERVER_BASE_URL}/api/projects/all-projects`).then(
      (resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
        else {
          return null
        }
      }).then((data) => {
        setProjectsLists(data)
      }).catch((reason) => {
        setProjectsLists([])
      })
  }


  useEffect(() => {
    getProjects();
  }, [])

  function createProject() {
    const project_name = document.getElementById('project_name').value.trim()
    const project_slug = document.getElementById('project_slug').value.trim()
    if (project_name.length < 4) {
      alert("Project Name has to be at least of length 3")
      return
    }
    if (project_slug.length < 4) {
      alert("Project Slug has to be at least of length 3")
      return
    }
    fetch(`${SERVER_BASE_URL}/api/projects/create-project`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: project_name,
        slug: project_slug
      })
    }).then((resp) => {
      if (resp.status == 201) {
        searchParams.delete('create')
        setSearchParams(searchParams)
        getProjects()
      }
    })
  }

  return (
    <div style={{
      height: '100%',
      padding: '0 20px 0 20px'
    }}>
      <PopupModal open={searchParams.get('create') != null} nested
        onOpen={() => {
          document.getElementById('project_name').focus()
        }}
        onClose={() => {
          searchParams.delete('create')
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
                  navigate(`/projects`)
                }}
              />
              <IconButton
                tabIndex={3}
                title="Create Project"
                icon={<MdCheck style={{
                  fontSize: '1.25rem'
                }} />}
                onClick={() => {
                  createProject()
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
        </div>
      </PopupModal>
      <h2 style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          Projects List
        </span>
        {
          projectsList.length &&
          <LinkButton
            className={'themeButton'}
            title={"Create"}
            icon={<MdAdd style={{
              fontSize: '1.1rem'
            }} />}
            to={`/projects?create`}
            style={{
              fontSize: '0.9rem'
            }}
            replace={false}
          />
        }
      </h2>
      <div style={{
        padding: '10px 0 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'auto',
        gap: '5px'
      }}>
        {
          projectsList.length > 0 ?
            projectsList.map(({ slug, name, avatar_color }) => {
              return <Link key={`/projects/${slug}`} className='listItem' to={`/projects/${slug}`} replace={false}>
                <NameInitialsAvatar name={name} textColor={'white'} borderStyle='none' bgColor={avatar_color} />
                <span>{name}</span>
              </Link>
            })
            :
            <span>
              Looks fresh in here. <Link to={`/projects?create`}>Create a Project</Link> to get started.
            </span>
        }
      </div>
    </div>
  )
}

export default ProjectsList