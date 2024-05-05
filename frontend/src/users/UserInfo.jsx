import React, { useEffect, useState } from 'react'
import { Form, Link, useParams, useSearchParams } from 'react-router-dom'
import { useRouteData } from '../App';
import IconButton from '../Components/IconButton';
import { IoCheckmark, IoCamera } from 'react-icons/io5';
import { LuPencil } from 'react-icons/lu';
import { TbQuestionMark } from "react-icons/tb";
import { VscDiscard } from 'react-icons/vsc';
import ToolTip from '../Components/ToolTip';
import LinkButton from '../Components/LinkButton';
import { toast } from 'react-toastify';
import UserAvatar from '../Components/UserAvatar';

function UserInfo() {
    const pathParams = useParams();
    const currentUserData = useRouteData('0-3')['user']
    const userData = useRouteData('0-3')['userInfo']

    return (
        <div style={{
            padding: '20px',
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
                    <span style={{
                        fontSize: '0.9rem',
                        opacity: '0.5',
                        marginLeft: '5px'
                    }}>(id : {userData['user_name']})</span>
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
                        <td>Email</td>
                        <td>:</td>
                        <td>{userData['email']}</td>
                    </tr>
                    <tr>
                        <td>Created By</td>
                        <td>:</td>
                        <td><Link to={`/user/${userData['created_by']}`}>{userData['created_by']}</Link></td>
                    </tr>
                    <tr>
                        <td>Updated By</td>
                        <td>:</td>
                        <td><Link to={`/user/${userData['updated_by']}`}>{userData['updated_by']}</Link></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default UserInfo