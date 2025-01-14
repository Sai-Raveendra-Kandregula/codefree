import React, { useEffect, useState, useMemo, useContext } from 'react'
import { Form, useNavigate } from 'react-router-dom'
import { useRouteData, CodeFreeContext } from '../App';
import { IoCheckmark, IoCamera } from 'react-icons/io5';
import { VscDiscard } from 'react-icons/vsc';
import { toast } from 'react-toastify';
import UserAvatar from '../Components/UserAvatar';
import { StatusCodes } from 'http-status-codes';
import { SERVER_ROOT_PATH } from '../App'
import { getAPIURL } from '../hooks/useAPI.tsx';
import { User } from '../models/User.tsx';
import CFPage from '../Components/Page/CFPage.tsx';


export const ModifyUserAction = async ({ request, params }) => {
    switch (request.method) {
        case "POST": {
            let formData = await request.formData()
            let submitData = Object.fromEntries(formData)

            try {
                const data = await User.updateUser(params.userid, submitData)
                toast.success("User updated Successfully.")
                setTimeout(() => {
                    window.location.href = `${SERVER_ROOT_PATH}/user/${params.userid}`
                }, 1000)
                return data
            } catch (resp) {
                toast.error(`User update failed (Code:${resp.status})`)
                return await resp.json()
            }
        }
        default: {
            throw new Response("", { status: 405 });
        }
    }
}

function UserModify() {
    const cfContext = useContext(CodeFreeContext)
    const currentUserData = useMemo(() => cfContext.userInfo, [cfContext])
    const userData = useRouteData('user-info')

    const navigate = useNavigate();

    const [avatarPreview, setAvatarPreview] = useState(userData['avatar_data'] ? userData['avatar_data'] : "")

    useEffect(() => {
        if ((currentUserData['is_user_admin'] === false) && (userData['user_name'] !== currentUserData['user_name'])) {
            navigate(`/user/${userData['user_name']}`)
        }

    }, [userData, currentUserData, navigate])

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
        <CFPage title={`Edit User : ${userData['user_name']}`}>
            <Form method='POST'
                action={`/user/${userData['user_name']}/edit`}
                style={{
                    width: '100%',
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
        </CFPage>
    )
}

export default UserModify