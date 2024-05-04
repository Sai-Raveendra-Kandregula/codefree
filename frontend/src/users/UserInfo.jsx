import React, { useEffect, useState } from 'react'
import { Form, Link, useParams, useSearchParams } from 'react-router-dom'
import { useRouteData } from '../App';
import IconButton from '../Components/IconButton';
import { IoCheckmark } from 'react-icons/io5';
import { LuPencil } from 'react-icons/lu';
import { TbQuestionMark } from "react-icons/tb";
import { VscDiscard } from 'react-icons/vsc';
import ToolTip from '../Components/ToolTip';

function UserInfo() {
    const pathParams = useParams();
    const currentUserData = useRouteData('0-3')['user']
    const userData = useRouteData('0-3')['userInfo']

    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => {
        if(searchParams.get('edit')){
            if((currentUserData['is_user_admin'] == false) && (userData['user_name'] !== currentUserData['user_name'])){
                searchParams.delete('edit')
                setSearchParams(searchParams)
            }
        }
    }, [userData, currentUserData])

    return (
        <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            <h2 style={{
                margin: '0',
                display: 'flex',
                alignItems: 'center'
            }}>
                <span style={{
                    flex: '1'
                }}>
                    {searchParams.get('edit') ?
                        `Edit \"${userData['user_name']}\" user`
                        :
                        <React.Fragment>
                            {userData['display_name']}
                            <span style={{
                                fontSize: '0.9rem',
                                opacity: '0.5',
                                marginLeft: '5px'
                            }}>(id : {userData['user_name']})</span>
                        </React.Fragment>}
                </span>
                {
                    !(searchParams.get('edit')) &&
                    <IconButton icon={<LuPencil />} title={"Edit Profile"} onClick={(e) => {
                        e.preventDefault()
                        searchParams.set("edit", true)
                        setSearchParams(searchParams)
                    }} />
                }
            </h2>
            {
                searchParams.get('edit') ?
                    <Form method='post' 
                    action={`/user/${userData['user_name']}`}
                        style={{
                        width: '100%',
                        height: '100%',
                        height: 'max-content',
                    }}>
                        <table style={{
                            borderSpacing: '5px 15px'
                        }}>
                            <tbody>
                                <tr style={{
                                    display: 'none'
                                }}>
                                    <td>
                                        <input type='hidden' value={userData['user_name']} name='user_name' />
                                    </td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>
                                        <label htmlFor="user_display_name">Display Name *</label>
                                    </td>
                                    <td>:</td>
                                    <td>
                                        <input type="text" name="display_name" id="user_display_name" required={true} defaultValue={userData['display_name']} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <label htmlFor="user_email">Email *</label>
                                    </td>
                                    <td>:</td>
                                    <td>
                                        <input type="text" name="email" id="user_email" required={true} defaultValue={userData['email']} />
                                    </td>
                                </tr>
                                <tr>
                                    <td></td> 
                                    <td></td>
                                    <td style={{
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        gap: '5px'
                                    }}>
                                        <button className={`themeButton`} type="submit" id="submit_edit_user">
                                            <React.Fragment>
                                                <IoCheckmark />
                                                <span>Submit</span>
                                            </React.Fragment>
                                        </button>
                                        <button type="reset" id="discard_edit_user" onClick={() => {
                                            searchParams.delete('edit')
                                            setSearchParams(searchParams)
                                        }}>
                                            <React.Fragment>
                                                <VscDiscard />
                                                <span>Discard</span>
                                            </React.Fragment>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Form>
                    :
                    <table style={{
                        width: 'min-content',
                        whiteSpace: 'nowrap'
                    }}>
                        <tbody>
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
            }
        </div>
    )
}

export default UserInfo