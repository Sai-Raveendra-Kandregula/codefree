import React from 'react'

import issueItemStyles from '../../styles/reportViewer.module.css'

function CodeIssueItem({
    issue = {},
    groupedBy = "",
}) {
    return (
        <div style={{
            boxSizing: 'border-box',
            margin: '0 20px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
        }}>
            {
                groupedBy !== "File Name" &&
                issue["File Name"] &&
                <React.Fragment>
                    <h4>File : <span style={{
                        fontWeight: '400'
                    }}>{issue["File Name"]}</span></h4>
                </React.Fragment>
            }
            {
                groupedBy !== "Compliance Standard" &&
                issue["Compliance Standard"] &&
                <h4>
                    Issue :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{(issue["Compliance Standard"] === 'NONE' ? "Generic" : issue["Compliance Standard"])} Violation</span>
                </h4>
            }
            {
                groupedBy !== "Module Name" &&
                issue["Module Name"] &&
                <h4>
                    Reported By :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["Module Name"]}</span>
                </h4>
            }
            {
                groupedBy !== "Severity" &&
                <h4>
                    Severity :&nbsp;
                    <span className={`${issueItemStyles.severitySpan} ${issueItemStyles[issue["Severity"]]}`}>{issue["Severity"]}</span>
                </h4>
            }
            {
                issue["Compliance Standard"] === "CWE" && issue["CWE List"] &&
                <h4>
                    Violated CWE{issue["CWE List"].toString().includes(",") && "s"} :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["CWE List"]}</span>
                </h4>
            }
            {
                issue["Compliance Standard"] === "MISRA" && issue["MISRA Rule Number"] &&
                <h4>
                    Violated MISRA Rule :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["MISRA Rule Number"]}</span>
                </h4>
            }
             {
                issue["Symbol"] &&
                <React.Fragment>
                    <h4>
                        Symbol : 
                    </h4>
                    <code>
                        {issue["Symbol"]}
                    </code>
                </React.Fragment>
            }
            {
                issue["Context"] &&
                <React.Fragment>
                    <h4>
                        Context : 
                    </h4>
                    <div className='preBlock'>
                        <span className='preBlockLineNumber'>{issue["Line"].toString()}</span>
                        <div>
                            {issue["Context"].trimEnd()}{"\n"}
                            {
                                Number.parseInt(issue["Column"]) > 0 &&
                                (" ").repeat(Number.parseInt(issue["Column"]) - 1) + "^"
                            }
                        </div>
                    </div>
                </React.Fragment>
            }
            {
                issue["Description"] &&
                <React.Fragment>
                    <h4>Issue Description :</h4>
                    {issue["Description"]}
                </React.Fragment>
            }
            {
                issue["Suggestion"] && issue["Suggestion"].length > 0 &&
                <React.Fragment>
                    <h4>Suggested Fix :</h4>
                    {issue["Suggestion"]}
                </React.Fragment>
            }
            {
                issue["Additional Info"] &&
                <React.Fragment>
                    <h4>
                        More Info : 
                    </h4>
                    {
                        issue["CWE List"].toString().includes(",") ?
                        issue["CWE List"].toString().split(",").map((cwe)=>{
                            const url = `https://cwe.mitre.org/data/definitions/${cwe.trim()}.html`
                            return <React.Fragment key={cwe}><a target='_blank' href={url} rel="noreferrer">
                                {url}
                            </a><br/>
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