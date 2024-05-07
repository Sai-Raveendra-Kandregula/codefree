import React from 'react'
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { IoAddOutline, IoPencil } from 'react-icons/io5'
import UserAvatar from '../Components/UserAvatar'

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { CompactTable } from '@table-library/react-table-library/compact';
import IconButton from '../Components/IconButton'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { StatusCodes } from 'http-status-codes'
import { toast } from 'react-toastify'
import UserLink from '../Components/UserLink'
import CFTable from '../Components/CFTable'

export async function userListLoader({ params }) {
    const resp = await fetch(`${SERVER_BASE_URL}/api/user/all`, {
        credentials: "include"
    })
    if (resp.status != 200) {
        // window.location.href = `${SERVER_ROOT_PATH}/sign-in?redirect=${window.location.href}`
        throw resp
    }
    else {
        return resp.json()
    }
}

function SystemSettingsUsers() {
    const navigate = useNavigate()

    const revalidator = useRevalidator()

    var userList = useLoaderData()

    const theme = useTheme({
        Table: `
            background: transparent;
            height: auto;
            overflow-y : visible;
        `,
        Body: `
            overflow-y : visible;
        `,
        HeaderRow: `
            background: var(--background);
            font-size: 0.9rem;
            position : sticky;
            top : 0;

            .th {
                padding: 10px 20px;
                border-bottom: 1px solid var(--border-color);
            }

            .th:first-of-type{
                text-align: left;
            }

            .th:not(:first-of-type){
                text-align: center;
            }
        `,
        Row: `
            cursor: pointer;
            background: transparent;
            font-size: 0.9rem;
            overflow : visible;
            
            .td {
                padding: 10px 20px;
                overflow : visible;
                // border-bottom: 1px solid var(--border-color);
            }

            .td > div{
                overflow : visible;
            }

            .td:first-of-type{
                text-align: left;
            }
            
            .td:not(:first-of-type){
                text-align: center;
            }
            
            &:last-child .td {
                border-bottom: none;
            }
    
            &:hover .td {
                background: var(--button-overlay);
            }
          `,
    });

    const COLUMNS = [
        {
            label: 'User', renderCell: (item) => <span style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflowX: 'hidden'
            }} title={item['display_name']}>
                <UserAvatar userData={item} size={1.25} />
                <span style={{
                    overflowX: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {item['display_name']}
                </span>
            </span>
        },
        { label: 'Email', renderCell: (item) => <span title={item['email']}>{item['email']}</span> },
        {
            label: 'Status', renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem',
                overflow: 'visible'
            }}>
                Created by <UserLink admin_url={true} user_id={item['created_by']} /><br />
                Modified by <UserLink admin_url={true} user_id={item['updated_by']} />
            </div>
        },
        {
            label: 'Activity Status', renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem'
            }}>Modified on {new Date(item['updated_on']).toLocaleDateString()}</div>
        },
        {
            label: 'Actions',
            renderCell: (item) => <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                flexGrow: 0,
                flexShrink: 0,
            }}>
                <IconButton icon={<LuPencil />} title={`Edit ${item['display_name']}`} onClick={(e) => {
                    e.preventDefault();
                    navigate(`/user/${item['user_name']}/edit`)
                }} />
                <IconButton icon={<LuTrash2 />} title={`Delete ${item['display_name']}`} onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm(`Do you want to delete : "${item["display_name"]}" (${item["user_name"]}) ?`)) {
                        fetch(`${SERVER_BASE_URL}/api/user/delete`, {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(item)
                        }).then((resp) => {
                            if (resp.status == StatusCodes.OK) {
                                toast.success(`User Deletion Successfully`)
                                revalidator.revalidate()
                            }
                            else {
                                toast.error(`User Deletion Failed : ${resp.statusText}`)
                            }
                        })
                    }
                }} />
            </div>,
            width: '50px'
        }
    ];

    const ROW_PROPS = {
        key: (item) => item['user_name'],
        title: (item) => item['display_name'],
        onClick: (item) => {
            navigate(`/admin-area/users/${item['user_name']}`)
        }
    }

    return (
        <div style={{
            boxSizing: 'border-box',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '100%'
        }}>
            <h2 style={{
                width: 'var(--centered-wide-content-width)',
                margin: 'var(--centered-content-margin)',
            }}>
                Users
            </h2>
            <div style={{
                width: 'var(--centered-wide-content-width)',
                margin: 'var(--centered-content-margin)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
            }}>
                <input type='text' placeholder='Search Users' />
                <LinkButton
                    className={'themeButton'}
                    title={"Add User"}
                    icon={<IoAddOutline style={{
                        fontSize: '1.1rem'
                    }} />}
                    // to={`/projects/${pathParams.projectid}/reports?upload`}
                    style={{
                        fontSize: '0.9rem'
                    }}
                    replace={false}
                />
            </div>
            {
                userList && userList.length > 0 &&
                <div style={{
                    width: 'var(--centered-wide-content-width)',
                    margin: 'var(--centered-content-margin)',
                    height: '100%',
                    maxHeight: '100%',
                    overflowY: 'auto',
                    position: 'relative',
                }}>
                    {/* <CompactTable data={{ nodes: userList }} theme={theme} columns={COLUMNS} rowProps={ROW_PROPS} layout={{ fixedHeader: true }} /> */}
                    <CFTable data={userList} ROW_PROPS={ROW_PROPS} COLUMNS={COLUMNS} />
                </div>
            }
        </div>
    )
}

export default SystemSettingsUsers