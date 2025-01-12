import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { User } from './models/User.tsx'

function SignOut() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")

  const redirectToSignIn = useCallback(() => {
      navigate(`/sign-in`, {
        replace: true
      })
  }, [navigate])

  const signOutUser = useCallback(async () => {
    setErrorMessage("Signing out...")
    try {
      await User.SignOut()
      redirectToSignIn();
    } catch (resp) {
      if (resp.status === 401) {
        setErrorMessage('Error Signing out. Refresh page to try again.')
      }
      else{
        setErrorMessage(`Error Signing out (Code:${resp.status})`)
      }
    }
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