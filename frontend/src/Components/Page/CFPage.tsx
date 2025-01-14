import React, { ReactNode, useEffect } from 'react'

import CFPageStyles from './CFPage.module.css'

export type CFPageProps = React.PropsWithChildren<{
    title: string
    titleContentOverride ?: ReactNode
    showTitleOnPage?: boolean
    pageToolBar?: ReactNode
    centered?: boolean
}>

function CFPage({
    title,
    titleContentOverride,
    showTitleOnPage = true,
    pageToolBar,
    centered = true,
    children
}: CFPageProps) {

    useEffect(() => {
        window.document.title = `${title} - Codefree`

        return () => {
            window.document.title = `Codefree`
        }
    }, [title])

    return (
        <div style={{
            boxSizing: 'border-box',
            overflowY: 'auto',
            width: '100%',
            minHeight: '100%',
            padding: 'var(--page-padding-y) var(--page-padding-x)',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: `${showTitleOnPage ? 'auto ' : ''}1fr`,
            gap: '20px',
            alignItems: 'stretch',
            justifyContent: 'flex-start'
        }}>
            {
                (showTitleOnPage || pageToolBar) &&
                <div className={`${centered && CFPageStyles.centeredContent || ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    alignSelf: 'stretch',
                    boxSizing: 'border-box',
                    zIndex: 999
                }}>
                    <h2 style={{
                        margin: 0
                    }}>{showTitleOnPage && (titleContentOverride || title)}</h2>
                    <div style={{
                        display: 'flex',
                        gap: '5px',
                        alignItems: 'center'
                    }}>
                        {pageToolBar}
                    </div>
                </div>
            }
            <div className={`${centered && CFPageStyles.centeredContent || ''}`} style={{
                boxSizing: 'border-box',
                justifySelf: 'stretch',
                height: '100%',
            }}>
                {children}
            </div>
        </div>
    )
}

export default CFPage