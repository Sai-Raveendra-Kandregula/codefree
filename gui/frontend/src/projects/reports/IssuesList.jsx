import React from 'react'

function IssuesList({
    issuesData = {},
    issueType = ""
}) {
  return (
    <div>
        {
            (issueType in issuesData) &&
            JSON.stringify(issuesData[issueType])
        }
    </div>
  )
}

export default IssuesList