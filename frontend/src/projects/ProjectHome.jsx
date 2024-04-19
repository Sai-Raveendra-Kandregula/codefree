import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ActivityRings from "react-activity-rings"

import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { vmin } from '../Helpers'

function ProjectHome() {
  const pathParams = useParams()
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(null)
  const [issueData, setIssueData] = useState({})
  const [issueDataAgg, setIssueDataAgg] = useState({})

  function getLatestReportData() {
    fetch(`${SERVER_BASE_URL}/api/reports/get-report?project=${pathParams.projectid}&report=lastReport`).then(
      (resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
        else {
          return null
        }
      }).then((data) => {
        setReportData(data)
      })
  }

  useEffect(() => {
    getLatestReportData()
  }, [])

  useEffect(() => {
    if (reportData == null) {
      return
    }

    var total_issues = reportData["report"]["data"].length

    var tempdata = {}

    reportData["report"]["data"].forEach(element => {
      var moduleType = "Style Issues"
      if (element['Module Type'].toUpperCase() == "CODE") {
        moduleType = element['Severity'] + " Code Issues"
      }
      if (!(moduleType in tempdata)) {
        tempdata[moduleType] = 0
      }
      tempdata[moduleType] += 1
    });

    var issueDataTmp = {}


    const keys_ordered = [
      "Critical Code Issues",
      "Major Code Issues",
      "Minor Code Issues",
      "Style Issues",
    ]

    keys_ordered.forEach((key) => {
      if (key in tempdata) {
        issueDataTmp[key] = tempdata[key] / total_issues
      }
    })

    console.log(tempdata)
    console.log(issueDataTmp)

    setIssueData(tempdata)
    setIssueDataAgg(issueDataTmp)
  }, [reportData]);

  // const activityData = [
  //   { value: 0.8 },
  //   { value: 0.6 },
  //   { value: 0.2 }
  // ]

  const activityConfig = {
    width: vmin(30),
    height: vmin(30),
    ringSize: vmin(1.5)
  }

  return (
    <div style={{
      padding: '20px'
    }}>

      <div className='appPanel' style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}>
        {/* Home for Project ID : {routeParams.projectid} */}
        <div>
          <LinkButton to={`/projects/${pathParams.projectid}/reports/lastReport`} title={"View Last Report"} />
        </div>
        <div className=''>
            {
              Object.keys(issueDataAgg).length > 0 ?
                <ActivityRings data={
                  Object.keys(issueDataAgg).map((key) => {
                    var color = '#1c59ca'
                    if (key == 'Critical Code Issues') {
                      color = '#ff0029'
                    }
                    else if (key == 'Major Code Issues') {
                      color = '#e2a24a'
                    }
                    else if (key == 'Minor Code Issues') {
                      color = '#9acc00'
                    }

                    return {
                      label: key,
                      value: issueDataAgg[key],
                      color: color,
                      backgroundColor: color
                    }
                  })
                } config={activityConfig} />
                :
                "No Issues Found. Well Done!"
            }
        </div>
      </div>
    </div>
  )
}

export default ProjectHome