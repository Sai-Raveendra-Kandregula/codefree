import React from 'react'
import { useParams } from 'react-router-dom'


function Settings() {
    const routeParams = useParams()
  return (
    <div>Settings for Project ID : {routeParams.projectid}</div>
  )
}

export default Settings