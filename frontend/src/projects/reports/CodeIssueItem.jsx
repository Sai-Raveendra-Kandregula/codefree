import React, { useMemo } from 'react'

import issueItemStyles from '../../styles/reportViewer.module.css'
import { splitAtIndex } from '../../Helpers'

function CodeIssueItem({
    issue = {},
    groupedBy = "",
}) {

    const codeContext = useMemo(() => {
        if(issue["Symbol"]){
            const [pre, rest] = splitAtIndex(issue["Context"], issue["Column"] - 1)
            const [symbol, post] = splitAtIndex(rest, issue["Symbol"].length)

            return <>{pre}<span className='codeHighlight'>{symbol}</span>{post}</>
        }
        return issue["Context"].trimEnd()
    }, [issue])

    return (
        <div style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            gap: '10px'
        }}>
            {
                groupedBy !== "File Name" &&
                issue["File Name"] &&
                <React.Fragment>
                    <b>File : <span style={{
                        fontWeight: '400'
                    }}>{issue["File Name"]}</span></b>
                </React.Fragment>
            }
            {
                groupedBy !== "Compliance Standard" &&
                issue["Compliance Standard"] &&
                <b>
                    Issue :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{(issue["Compliance Standard"] === 'NONE' ? "Generic" : issue["Compliance Standard"])} Violation{
                            issue["Compliance Standard"] === "MISRA" && issue["MISRA Rule Number"] &&
                            ` (Rule number : ${issue["MISRA Rule Number"]})`
                    }{
                        issue["Compliance Standard"] === "CWE" && issue["CWE List"] &&
                            ` (CWE${issue["CWE List"].toString().includes(",") ? 's' : ''} : ${issue["CWE List"]})`
                    }</span>
                </b>
            }
            {
                groupedBy !== "Module Name" &&
                issue["Module Name"] &&
                <b>
                    Reported By :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["Module Name"]}</span>
                </b>
            }
            {
                groupedBy !== "Severity" &&
                <b>
                    Severity :&nbsp;
                    <span className={`${issueItemStyles.severitySpan} ${issueItemStyles[issue["Severity"]]}`}>{issue["Severity"]}</span>
                </b>
            }
            {
                issue["Context"] &&
                <React.Fragment>
                    <b>
                        Context :
                    </b>
                    <code style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '100%',
                        overflowX: 'auto',
                    }}>
                        <span className='preBlockLineNumber'>{issue["Line"].toString()}</span>&nbsp;
                        {codeContext}
                    </code>
                </React.Fragment>
            }
            {
                issue["Description"] &&
                <React.Fragment>
                    <b>Issue Description :</b>
                    <span>{issue["Description"]}</span>
                </React.Fragment>
            }
            {
                issue["Suggestion"] && issue["Suggestion"].length > 0 &&
                <React.Fragment>
                    <b>Suggested Fix :</b>
                    {issue["Suggestion"]}
                </React.Fragment>
            }
            {
                issue["Additional Info"] &&
                <React.Fragment>
                    <b>
                        More Info :
                    </b>
                    {
                        issue["CWE List"].toString().includes(",") ?
                            issue["CWE List"].toString().split(",").map((cwe) => {
                                const url = `https://cwe.mitre.org/data/definitions/${cwe.trim()}.html`
                                return <React.Fragment key={cwe}><a target='_blank' href={url} rel="noreferrer">
                                    {url}
                                </a><br />
                                </React.Fragment>
                            })
                            :
                            <a target='_blank' href={issue["Additional Info"]} rel="noreferrer">
                                {issue["Additional Info"]}
                            </a>
                    }
                </React.Fragment>
            }
        </div>
    )
}

export default CodeIssueItem