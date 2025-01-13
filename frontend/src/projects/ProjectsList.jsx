import React from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router-dom'
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import LinkButton from '../Components/LinkButton.tsx'
import { MdAdd } from 'react-icons/md'
import CFTable from '../Components/CFTable';
import { Project } from '../models/Project.tsx';
import { useRouteData } from '../hooks/useRouteData.tsx';
import CFPage from '../Components/Page/CFPage.tsx';


export async function projectListLoader({ params }) {
  return await Project.all()
}

function ProjectsList() {
  const navigate = useNavigate();
  const projectsList = useRouteData('project-list')


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
              ('last-report' in item && item['last-report'] !== undefined) ?
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
                    (item['last-report']['style_issues'])
                    + item['last-report']['critical_issues']
                    + item['last-report']['major_issues']
                    + item['last-report']['minor_issues']
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
    <CFPage title='Projects List'
      pageToolBar={
        <React.Fragment>
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
        </React.Fragment>
      }>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxSizing: 'border-box',
        height: '100%',
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
    </CFPage>
  )
}

export default ProjectsList