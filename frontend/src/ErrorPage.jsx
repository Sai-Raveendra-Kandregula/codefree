import React, { useState, useEffect } from 'react'
import DottedLine from './assets/dottedline.png'
import { Link } from 'react-router-dom'
import LinkButton from './Components/LinkButton'

import { IoArrowBack } from 'react-icons/io5'

const CFAppErrors = {
  404 : <React.Fragment>
    Oops! Let us know when you find something because we have no idea what you are looking for!
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Back to Home' style={{
      fontSize : '1rem'
    }} />
  </React.Fragment>
}

function ErrorPage({
  error = "404"
}) {


  useEffect(() => {
    
      if (window.localStorage.getItem("app-theme") == "dark"){
        document.querySelector(":root").classList.add("dark")
      }
      else{
        document.querySelector(":root").classList.remove("dark")
      }
  }, [])

  return (
    <div style={{
        width: '100%',
        height: '100%',
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
                  (error in CFAppErrors) ? error : '404'
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
                  (error in CFAppErrors) ? CFAppErrors[error] : CFAppErrors['404']
                }
            </h2>
        </div>
    </div>
  )
}

export default ErrorPage