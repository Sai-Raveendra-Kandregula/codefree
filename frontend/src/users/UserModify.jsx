import React, { useEffect, useState } from 'react'
import { Form, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { StatusCodes } from 'http-status-codes';
import { SERVER_BASE_URL, SERVER_ROOT_PATH } from '../App'


export const ModifyUserAction = async ({ request, params }) => {
    switch (request.method) {
        case "POST": {
            let formData = await request.formData()
            let submitData = Object.fromEntries(formData)
            const resp = await fetch(`${SERVER_BASE_URL}/api/user/modify`, {
                method: 'POST',
                body: JSON.stringify(submitData),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (resp.status == StatusCodes.OK) {
                toast.success("User updated Successfully.")
                setTimeout(() => {
                    window.location.href = `${SERVER_ROOT_PATH}/user/${params.userid}`
                }, 1000)
            }
            else if (resp.status == StatusCodes.NOT_FOUND) {
                toast.error("User not found.")
            }
            return await resp.json()
        }
        default: {
            throw new Response("", { status: 405 });
        }
    }
}

function UserModify() {
    const pathParams = useParams();
    const currentUserData = useRouteData('0-3')['user']
    const userData = useRouteData('0-3')['userInfo']

    const navigate = useNavigate();

    const [avatarPreview, setAvatarPreview] = useState(userData['avatar_data'] ? userData['avatar_data'] : "")

    useEffect(() => {
        if ((currentUserData['is_user_admin'] == false) && (userData['user_name'] !== currentUserData['user_name'])) {
            navigate(`/user/${userData['user_name']}`)
        }
        
    }, [userData, currentUserData])

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (file.size > 5 * 1024 * 1024) {
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
            width: 'var(--centered-content-width)',
            margin: 'var(--centered-content-margin)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%'
            }}>
                <h2 style={{
                    flex: '1',
                    margin: '0',
                }}>
                    {`Edit \"${userData['user_name']}\" user`}
                </h2>
            </div>
            <Form method='POST'
                action={`/user/${userData['user_name']}/edit`}
                style={{
                    width: '100%',
                    height: '100%',
                    height: 'max-content',
                }}>
                <table style={{
                    borderSpacing: '5px 15px',
                    width: '100%',
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
                                alignContent: 'left'
                            }}>
                                <div id='user_avatar_data_label'>
                                    <label htmlFor="user_avatar_data">
                                        <IoCamera className='hoverIcon' />
                                        <UserAvatar userData={{
                                            display_name: userData['display_name'],
                                            avatar_color: userData['avatar_color'],
                                            avatar_data: avatarPreview
                                        }} size={5} />
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
                                    navigate(`/user/${userData['user_name']}`)
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
        </div>
    )
}

export default UserModify