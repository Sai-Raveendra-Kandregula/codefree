import React from 'react'

import issueItemStyles from '../../styles/reportViewer.module.css'

function CodeIssueItem({
    issue = {},
    groupedBy = "",
}) {

    /* 
    CWE : {
                "Module Type": "code",
                "File Name": "src/peermon/chm_peer_state_actions.c",
                "Module Name": "FlawFinder",
                "Compliance Standard": "CWE",
                "Severity": "Minor",
                "Line": 45,
                "Column": 59,
                "Context": "alarm->alarmcode = CHM_MALLOC(sizeof(char) * (strlen(alarm_code_value) + 1));",
                "Description": "Does not handle strings that are not \\0-terminated; if given one it may perform an over-read (it could cause a crash if unprotected) (CWE-126).",
                "Symbol": "strlen",
                "Type": "buffer",
                "Suggestion": "",
                "Primary CWE": 126,
                "CWE List": "126",
                "Additional Info": "https://cwe.mitre.org/data/definitions/126.html"
            }
    MISRA : {
                "Module Type": "code",
                "File Name": "src/peermon/chm_peermon.c",
                "Module Name": "CPPCheck",
                "Compliance Standard": "MISRA",
                "Severity": "Minor",
                "Line": 69,
                "Column": 5,
                "Context": "int chm_create_listener_socket(chm_global_ctx* global_ctx) {",
                "Description": "Functions and objects should not be defined with external linkage if they are referenced in only one translation unit",
                "Symbol": "chm_create_listener_socket",
                "Type": "MISRA Violation",
                "Suggestion": null,
                "MISRA Rule Number": "8.7",
                "Additional Info": null
            }
    */

    return (
        <div style={{
            boxSizing: 'border-box',
            margin: '0 20px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-color)'
        }}>
            {
                groupedBy != "File Name" &&
                issue["File Name"] &&
                <React.Fragment>
                    <h4>File : <span style={{
                        fontWeight: '400'
                    }}>{issue["File Name"]}</span></h4>
                </React.Fragment>
            }
            {
                groupedBy != "Compliance Standard" &&
                issue["Compliance Standard"] &&
                <h4>
                    Issue :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{(issue["Compliance Standard"] == 'NONE' ? "Generic" : issue["Compliance Standard"])} Violation</span>
                </h4>
            }
            {
                groupedBy != "Severity" &&
                <h4>
                    Severity :&nbsp;
                    <span className={`${issueItemStyles.severitySpan} ${issueItemStyles[issue["Severity"]]}`}>{issue["Severity"]}</span>
                </h4>
            }
            {
                issue["Compliance Standard"] == "CWE" && issue["CWE List"] &&
                <h4>
                    Violated CWE{issue["CWE List"].toString().includes(",") && "s"} :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["CWE List"]}</span>
                </h4>
            }
            {
                issue["Compliance Standard"] == "MISRA" && issue["MISRA Rule Number"] &&
                <h4>
                    <span style={{
                        fontWeight: 400
                    }}>Violated MISRA Rule : </span>{issue["MISRA Rule Number"]}
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
                            return <React.Fragment><a target='_blank' href={url}>
                                {url}
                            </a><br/>
                            </React.Fragment>
                        })
                        :
                        <a target='_blank' href={issue["Additional Info"]}>
                            {issue["Additional Info"]}
                        </a>
                    }
                </React.Fragment>
            }
        </div>
    )
}

export default CodeIssueItem