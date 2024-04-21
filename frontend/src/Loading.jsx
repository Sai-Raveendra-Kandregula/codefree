import React, { useState, useEffect } from 'react'

function Loading() {

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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      Loading...
    </div>
  )
}

export default Loading