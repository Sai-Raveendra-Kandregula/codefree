import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getAPIURL } from './hooks/useAPI.tsx'

function SignOut() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")

  const redirectToSignIn = useCallback(() => {
      navigate(`/sign-in`, {
        replace: true
      })
  }, [navigate])

  const signOutUser = useCallback(() => {
    setErrorMessage("Signing out...")
    fetch(getAPIURL(`/user/sign-out`), {
      method: "post",
      credentials: "include",
      mode: 'cors'
    }).then((resp) => {
      if (resp.status === 200) {
        redirectToSignIn();
      }
      else {
        if (resp.status === 401) {
          setErrorMessage('Error Signing out. Refresh page to try again.')
        }
      }
    })
  }, [redirectToSignIn, setErrorMessage])

  useEffect(() => {
    signOutUser();
  }, [signOutUser])

  return (
    <div>
      {errorMessage}
    </div>
  )
}

export default SignOut