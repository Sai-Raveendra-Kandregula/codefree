import React from 'react'
import {ReactMultiEmail} from 'react-multi-email'

function SystemSettingsUserCreate() {
  return (
    <div className='appPanel'>
      <h3 style={{
        margin: 0
      }}>
        Invite Users
      </h3>
      <div>
        <ReactMultiEmail getLabel={(email, index, removeEmail) => {
          return email
        }} />
      </div>
    </div>
  )
}

export default SystemSettingsUserCreate