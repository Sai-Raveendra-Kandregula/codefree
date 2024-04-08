import React from 'react'
import { useParams } from 'react-router-dom'


function Reports() {
    const routeParams = useParams()
  return (
    <div>Reports for Project ID : {routeParams.projectid}</div>
  )
}

export default Reports