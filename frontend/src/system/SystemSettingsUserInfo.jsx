import React from 'react'
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { SERVER_BASE_URL, useRouteData } from '../App'
import LinkButton from '../Components/LinkButton'
import { IoAddOutline, IoPencil } from 'react-icons/io5'
import UserAvatar from '../Components/UserAvatar'

import IconButton from '../Components/IconButton'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

function SystemSettingsUserInfo() {
    const userData = useRouteData('0-3')['userInfo']

    return (
        <div style={{
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <h2 style={{
                    flex: '1',
                    margin: '0',
                }}>
                    {userData['display_name']}
                    <Link to={`/user/${userData['user_name']}`} style={{
                        fontSize: '0.75em',
                        marginLeft: '0.3em',
                    }}>@{userData['user_name']}</Link>
                </h2>
                <LinkButton className={'themeButton'} icon={<LuPencil />}
                    to={`/user/${userData['user_name']}/edit`}
                    title={`Edit`} />
            </div>
            <table style={{
                width: 'min-content',
                whiteSpace: 'nowrap'
            }}>
                <tbody>
                    <tr>
                        <td style={{
                            paddingBottom: "20px",
                        }}>
                            <UserAvatar userData={userData} size={5} />
                        </td>
                    </tr>
                    <tr>
                        <td>Profile Page</td>
                        <td>:</td>
                        <td><Link to={`/user/${userData['user_name']}`}>{userData['user_name']}</Link></td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>:</td>
                        <td>{userData['email']}</td>
                    </tr>
                    <tr>
                        <td>Created By</td>
                        <td>:</td>
                        <td><Link to={`/admin-area/users/${userData['created_by']}`}>{userData['created_by']}</Link></td>
                    </tr>
                    <tr>
                        <td>Updated By</td>
                        <td>:</td>
                        <td><Link to={`/admin-area/users/${userData['updated_by']}`}>{userData['updated_by']}</Link></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default SystemSettingsUserInfo