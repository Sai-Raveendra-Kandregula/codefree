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
            overflowX: 'hidden',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100%',
            minHeight: '100%',
            padding: 'var(--page-padding-y) var(--page-padding-x)',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: `${showTitleOnPage ? 'auto ' : ''}1fr`,
            gap: 'var(--page-title-content-gap)',
            alignItems: 'center',
            justifyContent: 'flex-start'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {
                    (showTitleOnPage || pageToolBar) &&
                    <div className={`${centered && CFPageStyles.centeredContent || ''}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        justifySelf: 'center',
                        boxSizing: 'border-box',
                        zIndex: 999
                    }}>
                        <h2 style={{
                            margin: 0
                        }}>{showTitleOnPage && (titleContentOverride || title)}</h2>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}>
                            {pageToolBar}
                        </div>
                    </div>
                }
                <div className={`${centered && CFPageStyles.centeredContent || ''}`} style={{
                    boxSizing: 'border-box',
                    // justifySelf: 'center',
                    height: '100%',
                }}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default CFPage