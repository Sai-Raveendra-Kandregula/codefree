import React, { useCallback, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useSubmit } from 'react-router-dom'

import { StatusCodes } from 'http-status-codes';

import { SERVER_ROOT_PATH } from './App'
import LinkButton from './Components/LinkButton'
import { ReactComponent as CFLogo } from './assets/CF_Logo.svg'
import { toast } from 'react-toastify'
import { getAPIURL } from './hooks/useAPI.tsx';
import { User } from './models/User.tsx';

export const signUpAction = async ({ request }) => {
  switch (request.method) {
    case "POST": {
      const resp = await fetch(getAPIURL(`/user/sign-in`), {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': document.getElementById('username').value,
          'password': document.getElementById('password').value,
          'keepSignedIn': document.getElementById('keepSignedIn').checked
        }),
        credentials: "include",
        mode: 'cors'
      })
      if (resp.status === StatusCodes.OK) {
        const searchParams = new URL(request.url).searchParams
        if (searchParams.get('redirect')) {
          window.location.href = searchParams.get('redirect')
        }
        else {
          window.location.href = SERVER_ROOT_PATH + `/home`
        }
      }
      else {
        toast.error('Invalid Username or Password.')
      }
      if (resp.status === StatusCodes.OK) {
        // toast.success("User updated Successfully.")
      }
      else if (resp.status === StatusCodes.NOT_FOUND) {
        toast.error("User not found.")
      }
      return await resp.json()
    }
    default: {
      throw new Response("", { status: 405 });
    }
  }
}

function SignUp() {
  const navigate = useNavigate()
  const submit = useSubmit();

  const [searchParams, ] = useSearchParams()

  const redirectToTarget = useCallback(() => {
    if (searchParams.get('redirect')) {
      window.location.href = searchParams.get('redirect')
    }
    else {
      navigate(`/home`, {
        replace: true
      })
    }
  }, [searchParams, navigate])

  const ValidateUser = useCallback(async (redirect = true) => {
    try {
      await User.getCurrentUser()
      redirectToTarget()
    } catch (resp) {
      
    }
  }, [redirectToTarget])

  useEffect(() => {
    ValidateUser()
  }, [ValidateUser])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      maxHeight: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '25px',
        width: 'min(450px, 100%)',
      }}>
        <h3 style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '25px'
        }}>
          <CFLogo style={{
            color: 'currentcolor',
            width: '150px',
            height: 'auto'
          }} />
          Register to CodeFree
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '10px',
        }}>
          <input id='username' type="text" placeholder='Username' />
          <input id='password' type="password" placeholder='Password' />
        </div>
        <div style={{
          display: 'flex',
          width: '100%',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          <LinkButton
            to={"/sign-up"}
            className={'themeButton'}
            style={{
              flex: 0.25
            }}
            onClick={(e) => {
              e.preventDefault()

              const formdata = new FormData()
              formdata.append('username', document.getElementById('username').value)
              formdata.append('password', document.getElementById('password').value)
              formdata.append('keepSignedIn', document.getElementById('keepSignedIn').checked)

              submit(formdata, { 'method': 'POST' })
            }} title={"Sign Up"} />
        </div>
        <div style={{
          display: 'flex',
          width: '100%',
          gap: '5px',
          justifyContent: 'flex-end'
        }}>
          Already registered?
          <Link
            to={"/sign-in"}
            title={"Sign In"} >Sign in instead.</Link>
        </div>
      </div>
    </div>
  )
}

export default SignUp