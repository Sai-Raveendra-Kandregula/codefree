import React, { CSSProperties, PropsWithChildren } from 'react'
import AppPanelStyles from './AppPanel.module.css'

export type AppPanelVariant = "default" | "flat" | "minimal"

export type AppPanelProps = PropsWithChildren<{
    panelStyle?: CSSProperties
    variant ?: AppPanelVariant
}>

function AppPanel({
    variant = "default",
    ...props
} : AppPanelProps) {
    return (
        <div
            className={`${AppPanelStyles.appPanel} ${AppPanelStyles[variant]}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                ...(props.panelStyle || {})
            }}
        >
            {props.children}
        </div>
    )
}

export default AppPanel