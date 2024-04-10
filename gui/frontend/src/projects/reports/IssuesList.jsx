import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { IoChevronForwardSharp  } from "react-icons/io5";

import issueItemStyles from '../../styles/reportViewer.module.css'
import CodeIssueItem from './CodeIssueItem';
import StyleIssueItem from './StyleIssueItem';

function IssuesList({
  groupBy = "",
  issuesData = {},
  issueType = ""
}) {

  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false);

  const ordering = {
    "Severity": {
      "Critical": 0,
      "Major": 1,
      "Minor": 2,
      "Info": 3
    },
    "Compliance Standard": {
      "CWE": 0,
      "MISRA": 1
    }
  }

  const [issueData, sortedIssues] = useMemo(() => {

    if (!groupBy || !issueType || !issuesData){
      return [ {}, [] ]
    }

    setLoading(true)

    var issueDataTmp = {} 

    if (issueType in issuesData) {
      issueDataTmp = issuesData[issueType].reduce((finalObject, object) => {
        (finalObject[object[groupBy]] = finalObject[object[groupBy]] || []).push(object);
        return finalObject;
      }, {})
    }

    const sortedObj = Object.keys(issueDataTmp).sort((a, b) => {
      if (groupBy in ordering) {
        return ordering[groupBy][a] - ordering[groupBy][b]
      }
      const issueCountA = issueType == 'style' ? issueDataTmp[a].filter((item) => {
        return item['Check Passed'] != "Passed"
      }).length : issueDataTmp[a].length;
      const issueCountB = issueType == 'style' ? issueDataTmp[b].filter((item) => {
        return item['Check Passed'] != "Passed"
      }).length : issueDataTmp[b].length;

      if (issueCountA == issueCountB) {
        return a.localeCompare(b)
      }

      return issueCountB - issueCountA
    })
  
    setLoading(false)

    return [issueDataTmp, sortedObj]
  }, [groupBy, issueType, issuesData])

  return (
    <React.Fragment>
      {!loading && issueData &&
        sortedIssues.map((groupName) => {
          const groupIssueCount = issueData[groupName].length

          return <details key={`${issueType}_${groupBy}_${groupName}`} className={`${issueItemStyles.issueItemAccordian}`}>
            <summary>
              <IoChevronForwardSharp />
              <span
                style={{
                  width: '100%'
                }}>
                {groupName}
              </span>
              <div style={{
                borderRadius: '15px',
                color: 'white',
                backgroundColor: 'var(--theme-color)',
                boxSizing: 'border-box',
                height: '24px',
                lineHeight: '24px',
                padding: '0 7.5px',
                fontSize: '0.8em',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {
                  groupIssueCount
                }
              </div>
            </summary>
            {
              issueData[groupName].sort((a, b) => {
                if(groupBy != "Severity"){
                    return ordering["Severity"][a["Severity"]] - ordering["Severity"][b["Severity"]]
                }
                if(groupBy != "File Name"){
                  return a["File Name"].localeCompare(b["File Name"])
                }
                return 0
              }).map((issueItem, index) => {
                if (issueType == "style") {
                  return <StyleIssueItem key={`${issueType}_${groupBy}_${groupName}_${index}`} issue={issueItem} groupedBy={groupBy} />
                }
                if (issueType == "code") {
                  return <CodeIssueItem key={`${issueType}_${groupBy}_${groupName}_${index}`} issue={issueItem} groupedBy={groupBy} />
                }
              })
            }
          </details>
        })
      }
    </React.Fragment>
  )
}

export default IssuesList