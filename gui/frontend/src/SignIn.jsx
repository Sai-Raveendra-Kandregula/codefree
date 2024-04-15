import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { SERVER_BASE_URL } from './App'

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
    <div>
      <div>
        <input id='username' type="text" placeholder='Username' />
        <input id='password' type="password" placeholder='Password' />
        <button onClick={(e) => {
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
        }}>
          Submit
        </button>
        {errorMessage}
      </div>
    </div>
  )
}

export default SignIn