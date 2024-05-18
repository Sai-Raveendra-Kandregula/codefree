import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams, useSubmit } from 'react-router-dom'

import { StatusCodes } from 'http-status-codes';

import { SERVER_BASE_URL, SERVER_ROOT_PATH } from './App'
import LinkButton from './Components/LinkButton'
import { ReactComponent as CFLogo } from './assets/CF_Logo.svg'
import { collapseToast, toast } from 'react-toastify'

export const signInAction = async ({ request, params }) => {
  switch (request.method) {
    case "POST": {
      let formData = await request.formData()
      let submitData = Object.fromEntries(formData)
      const resp = await fetch(`${SERVER_BASE_URL}/api/user/sign-in`, {
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
      if (resp.status == StatusCodes.OK) {
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
      if (resp.status == StatusCodes.OK) {
        // toast.success("User updated Successfully.")
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

function SignIn() {
  const navigate = useNavigate()
  const submit = useSubmit();

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (window.localStorage.getItem("app-theme") == "dark") {
      document.querySelector(":root").classList.add("dark")
    }
    else {
      document.querySelector(":root").classList.remove("dark")
    }
  }, [])

  function redirectToTarget() {
    if (searchParams.get('redirect')) {
      window.location.href = searchParams.get('redirect')
    }
    else {
      navigate(`/home`, {
        replace: true
      })
    }
  }

  async function ValidateUser(redirect = true) {
    const resp = await fetch(`${SERVER_BASE_URL}/api/user/validate`, {
      credentials: "include"
    })
    if (resp.status === 200) {
      redirectToTarget()
    }
  }

  useEffect(() => {
    ValidateUser()
  }, [])

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