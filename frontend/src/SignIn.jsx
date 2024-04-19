import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { SERVER_BASE_URL } from './App'
import LinkButton from './Components/LinkButton'

function SignIn() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [errorMessage, setErrorMessage] = useState("")

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      maxHeight: '100%',
    }}>
      <div className='appPanel' style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '50px',
        width: 'clamp(300px, 40% ,600px)'
      }}>
        <h3>
          Sign in to CodeFree
        </h3>
        <input id='username' type="text" placeholder='Username' />
        <input id='password' type="password" placeholder='Password' />
        <div>
          <input type="checkbox" name="Keep Signed In" id="keepSignedIn" />
          <label htmlFor="keepSignedIn">Keep Me Signed In</label>
        </div>
        <LinkButton to={"#"} onClick={(e) => {
          e.preventDefault()
          setErrorMessage("")
          fetch(`${SERVER_BASE_URL}/api/user/sign-in`, {
            method: "post",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'username': document.getElementById('username').value,
              'password': document.getElementById('password').value,
              'keepSignedIn' : document.getElementById('keepSignedIn').checked
            }),
            credentials: "include",
            mode: 'cors'
          }).then((resp) => {
            console.log(`${SERVER_BASE_URL}/api/user/sign-in`)
            if (resp.status == 200) {
              console.log("Signed In")
              redirectToTarget();
            }
            else {
              if (resp.status == 401) {
                setErrorMessage('Invalid Username/password')
              }
            }
          })
        }} title={"Submit"} />
        {errorMessage}
      </div>
    </div>
  )
}

export default SignIn