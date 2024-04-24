import React, { useState, useEffect, useContext } from 'react'
import DottedLine from './assets/dottedline.png'
import { IoArrowBack } from 'react-icons/io5'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { AppContext } from './NotFoundContext'
import LinkButton from './Components/LinkButton'

const CFAppErrors = {
  404 : <React.Fragment>
    Oops! Let us know when you find something because we have no idea what you are looking for!
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
      fontSize : '1rem'
    }} />
  </React.Fragment>,
  500 : <React.Fragment>
    Internal Server Error
    <br />
    <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
      fontSize : '1rem'
    }} />
  </React.Fragment>
}

function ErrorPage({
  errorNumber = 500
}) {

  const { routeError, setRouteError } = useContext(AppContext);
  
  if(isRouteErrorResponse(routeError)){
    // console.error(routeError);
    errorNumber = routeError.status
  }


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
                  (errorNumber.toString() in CFAppErrors) && CFAppErrors[errorNumber.toString()]
                }
            </h2>
        </div>
    </div>
  )
}

export default ErrorPage