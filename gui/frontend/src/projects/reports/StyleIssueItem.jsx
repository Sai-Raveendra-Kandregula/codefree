import React from 'react'

function StyleIssueItem({
    issue = {},
    groupedBy = "",
}) {

  /*
    {
      "Module Type": "style",
      "File Name": "src/core/chm_cli_callbacks.c",
      "Module Name": "AStyle",
      "Check Passed": "Passed"
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
                groupedBy != "Module Name" &&
                issue["Module Name"] &&
                <h4>
                    Style Checker :&nbsp;
                    <span style={{
                        fontWeight: 400
                    }}>{issue["Module Name"]}</span>
                </h4>
            }
          {
            groupedBy != "Check Passed" &&
              issue["Check Passed"] &&
              <h4>
                  Style Check Result :&nbsp;
                  <span style={{
                      fontWeight: 400
                  }}>{issue["Check Passed"]}</span>
              </h4>
          }
      </div>
  )
}

export default StyleIssueItem