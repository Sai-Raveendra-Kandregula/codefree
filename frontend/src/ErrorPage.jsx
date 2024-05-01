import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import DottedLine from './assets/dottedline.png'
import { IoArrowBack } from 'react-icons/io5'
import LinkButton from './Components/LinkButton'
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from 'http-status-codes';

const CFAppErrors = {
  403: <React.Fragment>
    You do not have access to this page.
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
      fontSize: '1rem'
    }} />
  </React.Fragment>,
  404: <React.Fragment>
    Oops! Let us know when you find something because we have no idea what you are looking for!
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
      fontSize: '1rem'
    }} />
  </React.Fragment>,
  500: <React.Fragment>
    Internal Server Error. Please contact the Administrator if the issue persists.
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
      fontSize: '1rem'
    }} />
  </React.Fragment>
}

function ErrorPage({
  errorNumber = 500
}) {
  const navigate = useNavigate()

  if (errorNumber == StatusCodes.UNAUTHORIZED) {
    navigate(`/sign-in?redirect=${window.location.href}`)
  }

  useEffect(() => {
    if (window.localStorage.getItem("app-theme") == "dark") {
      document.querySelector(":root").classList.add("dark")
    }
    else {
      document.querySelector(":root").classList.remove("dark")
    }
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `url(${DottedLine})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundBlendMode: 'darken',
      backgroundPositionY: 'bottom'
    }}>
      <div className='appPanel' style={{
        width: 'clamp(150px, 40%, 500px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '20px',
        padding: '30px',
      }}>
        <span style={{
          fontSize: '20vmin',
          padding: '50px 0',
        }}>
          {
            errorNumber.toString()
          }
        </span>
        <h2 style={{
          fontWeight: '300',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '30px'
        }}>
          {
            (errorNumber.toString() in CFAppErrors) ? CFAppErrors[errorNumber.toString()]
            : getReasonPhrase(errorNumber)
          }
        </h2>
      </div>
    </div>
  )
}

export default ErrorPage