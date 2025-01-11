import React from 'react'

import { ReactComponent as AppLogo } from './assets/CF_Logo.svg';

export function LoadingOverlay() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: '10000'
    }}>
      <AppLogo style={{
        fontSize: '10vmin',
        animation: 'spin 2s ease-in-out infinite'
      }}
      />
    </div>
  )
}

function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <AppLogo style={{
        fontSize: '10vmin',
        animation: 'spin 2s ease-in-out infinite'
      }}
      />
    </div>
  )
}

export default Loading