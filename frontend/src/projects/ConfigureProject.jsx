import React from 'react'
import { useParams } from 'react-router-dom'


function ConfigureProject() {
    const routeParams = useParams()
  return (
    <div style={{
      padding: '20px'
  }}>
    Configure Project ID : {routeParams.projectid}
  </div>
  )
}

export default ConfigureProject