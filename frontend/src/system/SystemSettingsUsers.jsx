import React, { useState } from 'react'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import LinkButton from '../Components/LinkButton.tsx'
import { IoAddOutline } from 'react-icons/io5'

import IconButton from '../Components/IconButton'
import { LuCheck, LuPencil, LuTrash2 } from 'react-icons/lu'
import { toast } from 'react-toastify'
import UserLink from '../Components/UserLink'
import CFTable from '../Components/CFTable'
import PopupModal from '../Components/Popup'
import SystemSettingsUserCreate from './SystemSettingsUserCreate'
import { User } from '../models/User.tsx'

export async function userListLoader({ params }) {
    return await User.all()
}

export async function pendingUserListLoader({ params }) {
    return await User.allPending()
}

function SystemSettingsUsers({
    pendingUsers = false
}) {
    const navigate = useNavigate()

    const revalidator = useRevalidator()

    const [openCreatePopup, setOpenCreatePopup] = useState(false)

    var userList = useLoaderData()

    const theme = {
        td: {
            padding: '10px',
        },
        th: {
            padding: '10px',
            borderBottom: '1px solid var(--border-color)'
        }
    };

    const COLUMNS = [
        {
            label: 'User', renderCell: (item) =>
                <UserLink showAvatar={true} avatarSize={1.25} admin_url={true} user_id={item['user_name']} user_data={item} style={{
                    'textAlign': 'left',
                    'width': '100%',
                    paddingLeft: '10px'
                }} />
        },
        { label: 'Email', renderCell: (item) => <span title={item['email']}>{item['email']}</span> },
        {
            label: 'Status', 
            showOnlyIn: ['lg', 'xl'],
            renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem',
                overflow: 'visible'
            }}>
                Created by <UserLink admin_url={true} user_id={item['created_by']} /><br />
                Modified by <UserLink admin_url={true} user_id={item['updated_by']} />
            </div>
        },
        {
            label: 'Activity Status', 
            showOnlyIn: ['lg', 'xl'],
            renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem'
            }}>Modified on {new Date(item['updated_on']).toLocaleDateString()}</div>
        },
        {
            label: <span style={{
                paddingRight: '10px'
            }}>Actions</span>,
            renderCell: (item) => <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                flexGrow: 0,
                flexShrink: 0,
                paddingRight: '10px'
            }}>
                <IconButton to={`/user/${item['user_name']}/edit`} icon={<LuPencil />} title={`Edit ${item['display_name']}`} />
                <IconButton icon={<LuTrash2 />} title={`Delete ${item['display_name']}`} onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm(`Do you want to delete : "${item["display_name"]}" (${item["user_name"]}) ?`)) {
                        User.deleteUser(item["user_name"]).then((out) => {
                            toast.success(`User Deletion Successfully`)
                            revalidator.revalidate()
                        }).catch((resp) => {
                            toast.error(`User Deletion Failed (Code:${resp.status})`)
                        })
                    }
                }} />
            </div>,
            width: '50px'
        }
    ];

    const COLUMNS_PENDING = [
        {
            label: 'User', renderCell: (item) =>
                <UserLink showAvatar={true} avatarSize={1.25} 
                    load_user_data={false} 
                    use_link={false} user_id={item['user_name']} 
                    user_data={item} 
                    style={{
                    'textAlign': 'left',
                    'width': '100%',
                    'paddingLeft': '10px'
                }} />
        },
        { label: 'Email', renderCell: (item) => <span title={item['email']}>{item['email']}</span> },
        {
            label: 'Created By', 
            showOnlyIn: ['lg', 'xl'],
            renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem',
                overflow: 'visible'
            }}>
                {item['user_name'] === item['created_by'] ? 
                    "Signing Up" 
                    : 
                    <UserLink admin_url={true} user_id={item['created_by']} />
                }
            </div>
        },
        {
            label: 'Created On', 
            showOnlyIn: ['lg', 'xl'],
            renderCell: (item) => <div style={{
                textWrap: 'pretty',
                fontSize: '0.8rem'
            }}>{new Date(item['created_on']).toLocaleDateString()}</div>
        },
        {
            label: <span style={{
                paddingRight: '10px'
            }}>Actions</span>,
            renderCell: (item) => <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                flexGrow: 0,
                flexShrink: 0,
                paddingRight: '10px'
            }}>
                <IconButton icon={<LuCheck />} title={`Approve ${item['user_name']}`} onClick={(e) => {
                    e.preventDefault();
                }} />
                <IconButton icon={<LuTrash2 />} title={`Deny ${item['user_name']}`} onClick={(e) => {
                    e.preventDefault();
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
                {pendingUsers ? "Pending Users" : "Users"}
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
                <PopupModal open={openCreatePopup} onClose={() => setOpenCreatePopup(false)}>
                    <SystemSettingsUserCreate />
                </PopupModal>
                <LinkButton
                    className={'themeButton'}
                    title={"Add User"}
                    icon={<IoAddOutline style={{
                        fontSize: '1.1rem'
                    }} />}
                    style={{
                        fontSize: '0.9rem'
                    }}
                    replace={false}
                    onClick={(e) => {
                        e.preventDefault()
                        setOpenCreatePopup(true)
                    }}
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
                    <CFTable
                        theme={theme}
                        data={userList}
                        ROW_PROPS={ROW_PROPS}
                        COLUMNS={pendingUsers ? COLUMNS_PENDING : COLUMNS} />
                </div>
            }
        </div>
    )
}

export default SystemSettingsUsers