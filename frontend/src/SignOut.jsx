import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { SERVER_BASE_URL } from './App'

function SignOut() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [errorMessage, setErrorMessage] = useState("")

  function redirectToSignIn() {
      navigate(`/sign-in`, {
        replace: true
      })
  }

  function signOutUser(){
    setErrorMessage("Signing out...")
    fetch(`${SERVER_BASE_URL}/api/user/sign-out`, {
      method: "post",
      credentials: "include",
      mode: 'cors'
    }).then((resp) => {
      if (resp.status == 200) {
        redirectToSignIn();
      }
      else {
        if (resp.status == 401) {
          setErrorMessage('Error Signing out. Refresh page to try again.')
        }
      }
    })
  }

  useEffect(() => {
    if (window.localStorage.getItem("app-theme") == "dark") {
      document.querySelector(":root").classList.add("dark")
    }
    else {
      document.querySelector(":root").classList.remove("dark")
    }

    signOutUser();

  }, [])

  return (
    <div>
      {errorMessage}
    </div>
  )
}

export default SignOut