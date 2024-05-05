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
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { toast } from 'react-toastify';

function UserInfo() {
    const pathParams = useParams();
    const currentUserData = useRouteData('0-3')['user']
    const userData = useRouteData('0-3')['userInfo']

    const [searchParams, setSearchParams] = useSearchParams()
    const [avatarPreview, setAvatarPreview] = useState( userData['avatar_data'] ? userData['avatar_data'] : "")

    useEffect(() => {
        if (searchParams.get('edit')) {
            if ((currentUserData['is_user_admin'] == false) && (userData['user_name'] !== currentUserData['user_name'])) {
                searchParams.delete('edit')
                setSearchParams(searchParams)
            }
        }
    }, [userData, currentUserData])

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if(file.size > 5 * 1024 * 1024){
                // More than 5MB
                reject("File too Large.");
            }
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
      
          fileReader.onload = () => {
            resolve(fileReader.result);
          };
      
          fileReader.onerror = (error) => {
            reject(error.toString());
          };
        });
      };

      const setImageBase64 = async (event) => {
        const file = event.target.files[0];
        try {
            const base64 = await convertBase64(file);
            setAvatarPreview(base64);
        } catch (error) {
            toast.error(error)
        }
      };

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
                </h2>
                {
                    !(searchParams.get('edit')) &&
                    <LinkButton className={'themeButton'} icon={<LuPencil />} title={"Edit"} onClick={(e) => {
                        e.preventDefault()
                        searchParams.set("edit", true)
                        setSearchParams(searchParams)
                    }} />
                }
            </div>
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
                                    <td>
                                        <input type='hidden' value={avatarPreview} name='avatar_data' id='avatar_data_base64' />
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={3} style={{
                                        alignContent: 'center'
                                    }}>
                                        <div id='user_avatar_data_label'>
                                            <label htmlFor="user_avatar_data">
                                                <IoCamera className='hoverIcon' />
                                                {
                                                    avatarPreview ?
                                                    <img id='avatar_preview' src={avatarPreview} style={{
                                                        display: 'block',
                                                        height: '6.5rem',
                                                        width: '6.5rem',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'center',
                                                    }} />:
                                                    <NameInitialsAvatar name={`${userData['display_name']}`} borderStyle='none'
                                                        bgColor={userData['avatar_color']} size='6.5rem' textColor='white' textSize={`${6.5 * (0.65 / 1.65)}rem`} />
                                                }
                                            </label>
                                            <input type="file" name={null} id="user_avatar_data" accept='image/png, image/jpeg' onChange={(e) => {
                                                setImageBase64(e)
}} />
                                        </div>
                                    </td>
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
                                <td style={{
                                    paddingBottom: "20px",
                                }}>
                                    {
                                        userData['avatar_data'] ? 
                                        <img id='avatar_preview' src={`${userData['avatar_data']}`} style={{
                                            display: 'block',
                                            height: '6.5rem',
                                            width: '6.5rem',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            objectPosition: 'center',
                                        }} />
                                        :
                                        <NameInitialsAvatar name={`${userData['display_name']}`} borderStyle='none'
                                            bgColor={userData['avatar_color']} size='6.5rem' textColor='white' textSize={`${6.5 * (0.65 / 1.65)}rem`} />
                                    }
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
            }
        </div>
    )
}

export default UserInfo