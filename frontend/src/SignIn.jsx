import React, { useCallback, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useSubmit } from 'react-router-dom'

import { SERVER_ROOT_PATH } from './App'
import LinkButton from './Components/LinkButton'
import { ReactComponent as CFLogo } from './assets/CF_Logo.svg'
import { toast } from 'react-toastify'
import { User } from './models/User.tsx';

export const signInAction = async ({ request }) => {
  switch (request.method) {
    case "POST": {
      try {
        const data = await User.SignInUser(
          document.getElementById('username').value,
          document.getElementById('password').value,
          document.getElementById('keepSignedIn').checked
        )
        const searchParams = new URL(request.url).searchParams
        if (searchParams.get('redirect')) {
          window.location.href = searchParams.get('redirect')
        }
        else {
          window.location.href = SERVER_ROOT_PATH + `/home`
        }
        return data
      } catch (resp) {
        toast.error('Invalid Username or Password.')
        return null
      }
    }
    default: {
      throw new Response("", { status: 405 });
    }
  }
}

function SignIn() {
  const navigate = useNavigate()
  const submit = useSubmit();

  const [searchParams,] = useSearchParams()

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
          Sign in to CodeFree
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
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            // width: '100%',
            flex: 1.5,
            gap: '5px',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            <input type="checkbox" name="Keep Signed In" id="keepSignedIn" />
            <label htmlFor="keepSignedIn">Keep Me Signed In</label>
          </div>
          <LinkButton
            to={"/sign-in"}
            className={'themeButton'}
            style={{
              flex: 0.5
            }}
            onClick={(e) => {
              e.preventDefault()

              const formdata = new FormData()
              formdata.append('username', document.getElementById('username').value)
              formdata.append('password', document.getElementById('password').value)
              formdata.append('keepSignedIn', document.getElementById('keepSignedIn').checked)

              submit(formdata, { 'method': 'POST' })
            }} title={"Sign In"} />
        </div>
        <div style={{
          display: 'flex',
          width: '100%',
          gap: '5px',
          justifyContent: 'flex-end'
        }}>
          Not registered?
          <Link
            to={"/sign-up"}
            title={"Sign Up"} >Create an Account.</Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn