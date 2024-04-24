import React from 'react'
import { useParams } from 'react-router-dom'


function ConfigureProject() {
    const routeParams = useParams()
  return (
    <div style={{
      padding: '20px'
  }}>
    <h2 style={{
      marginTop : '0px'
    }}>
      Configure Project
    </h2>
    ID : {routeParams.projectid}
  </div>
  )
}

export default ConfigureProject