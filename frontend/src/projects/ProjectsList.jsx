import React, { useState, useEffect } from 'react'
import { Link, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom'
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { MdAdd, MdCheck, MdClose } from 'react-icons/md'
import PopupModal from '../Components/Popup'
import IconButton from '../Components/IconButton'
import { toast } from 'react-toastify';
import CFTable from '../Components/CFTable';


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


  const theme = {
    table: {
      borderCollapse: 'separate',
      borderSpacing: '0 5px',
    },
    td: {
      padding: '10px 20px',
      backgroundColor: 'var(--button-overlay)',
      marginBotton: '10px',
    },
    th: {
      padding: '10px 20px',
      borderBottom: '1px solid var(--border-color)'
    },
    rowRadius: 'var(--border-radius)'
  };

  const COLUMNS = [
    {
      label: 'Project Name', renderCell: (item) =>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
          }}>
            <NameInitialsAvatar name={item['name']} textColor={'white'} borderStyle='none' bgColor={item['avatar_color']} />
            {item['name']}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px',
          }}>
            {
              (item['report_id']) ?
                <span style={{
                  borderRadius: '10px', 
                  color: 'white', 
                  backgroundColor: 'var(--theme-color)',
                  boxSizing: 'border-box', 
                  height: '24px',
                  lineHeight: '24px',
                  padding: '5px 10px',
                  fontSize: '0.85em',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} title='Issues'>
                  {
                    item['style_issues']
                    + item['critical_issues']
                    + item['major_issues']
                    + item['minor_issues']
                  }
                </span>
                :
                <span>No Reports</span>
            }
          </div>
        </div>
    },
  ];

  const ROW_PROPS = {
    key: (item) => item['slug'],
    title: (item) => item['name'],
    onClick: (item) => {
      navigate(`/projects/${item['slug']}`)
    }
  }

  return (
    <div style={{
      boxSizing: 'border-box',
      height: '100%',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    }}>
      <h2 style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0',
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
        boxSizing: 'border-box',
        flex: '1',
        overflowY: 'auto',
        gap: '5px'
      }}>
        {
          projectsList.length > 0 ?
            <CFTable
              theme={theme}
              data={projectsList}
              ROW_PROPS={ROW_PROPS}
              COLUMNS={COLUMNS}
              showHeader={false}
            />
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