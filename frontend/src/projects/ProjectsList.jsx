import React, { useState, useEffect } from 'react'
import { Link, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom'
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { MdAdd, MdCheck, MdClose } from 'react-icons/md'
import PopupModal from '../Components/Popup'
import IconButton from '../Components/IconButton'
import { toast } from 'react-toastify';


export async function projectListLoader({ params }) {
  const resp = await fetch(`${SERVER_BASE_URL}/api/projects/all-projects`)
  if (resp.status == 200) {
    return resp.json()
  }
  else {
    throw resp
  }
}

function ProjectsList() {
  const navigate = useNavigate();
  const projectsList = useLoaderData()

  return (
    <div style={{
      height: '100%',
      padding: '0 20px 0 20px'
    }}>
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
            to={`/projects/create`}
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
              Looks fresh in here. <Link to={`/projects/create`}>Create a Project</Link> to get started.
            </span>
        }
      </div>
    </div>
  )
}

export default ProjectsList