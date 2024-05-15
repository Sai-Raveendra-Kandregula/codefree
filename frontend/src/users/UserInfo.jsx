import React, { useEffect, useState } from 'react'
import { Form, Link, useParams, useSearchParams } from 'react-router-dom'
import { useRouteData } from '../App';
import IconButton from '../Components/IconButton';
import { IoCheckmark, IoCamera } from 'react-icons/io5';
import { LuPencil, LuUsers2 } from 'react-icons/lu';
import { TbQuestionMark } from "react-icons/tb";
import { VscDiscard } from 'react-icons/vsc';
import ToolTip from '../Components/ToolTip';
import LinkButton from '../Components/LinkButton';
import { toast } from 'react-toastify';
import UserAvatar from '../Components/UserAvatar';
import UserLink from '../Components/UserLink';

function UserInfo({
    currentUserInfo = false,
    adminMode=false
}) {
    const pathParams = useParams();
    const currentUserData = useRouteData('0-3')['user']
    const externalUserData = useRouteData('0-3')['userInfo']
    const userData = currentUserInfo ? currentUserData : externalUserData

    return (
        <div style={{
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: 'var(--centered-content-width)',
            margin: 'var(--centered-content-margin)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}>
                <h2 style={{
                    flex: '1',
                    margin: '0',
                }}>
                    {userData['display_name']}
                    {
                        adminMode ? <span style={{
                            color: 'red',
                        }}>
                            {
                                userData['is_user_admin'] && " (Admin)"
                            }
                        </span>
                        :
                        <span style={{
                            fontSize: '0.9rem',
                            opacity: '0.5',
                            marginLeft: '5px'
                        }}>(id : {userData['user_name']})</span>
                    }
                </h2>
                {
                    userData['is_user_admin'] && !adminMode &&
                    <IconButton 
                        overlay={true}
                        icon={<LuUsers2 />}
                        to={`/admin-area/users/${userData['user_name']}`} 
                        title={`Open User in Admin Area`} />
                }
                <LinkButton className={'themeButton'} icon={<LuPencil />} 
                    to={`/user/${userData['user_name']}/edit`} 
                    title={`Edit`} />
            </div>
            <div style={{
                display: 'flex',
                width: '100%',
                gap: '50px',
                paddingTop: '20px'
            }}>
                <UserAvatar userData={userData} size={5} />
                <table style={{
                    width: 'min-content',
                    whiteSpace: 'nowrap',
                    flex: '1'
                }}>
                    <tbody>
                        <tr>
                            <td>Profile Page</td>
                            <td>:</td>
                            <td><UserLink user_data={userData} /></td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>:</td>
                            <td>{userData['email']}</td>
                        </tr>
                        <tr>
                            <td>Created By</td>
                            <td>:</td>
                            <td><UserLink user_id={userData['created_by']} /></td>
                        </tr>
                        <tr>
                            <td>Updated By</td>
                            <td>:</td>
                            <td><UserLink user_id={userData['updated_by']} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UserInfo