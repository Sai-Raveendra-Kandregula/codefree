import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ActivityRings from "react-activity-rings"
import Chart from "react-apexcharts";

import { SERVER_BASE_URL } from '../App'
import LinkButton from '../Components/LinkButton'
import { vmin } from '../Helpers'
import { BiArrowFromLeft } from 'react-icons/bi';
import { GoArrowRight } from 'react-icons/go';

function ProjectHome() {
  const pathParams = useParams()
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(null)
  const [issueData, setIssueData] = useState({})
  const [issueDataAgg, setIssueDataAgg] = useState({})
  const [issueDataFileGrouped, setIssueDataFileGrouped] = useState({})
  const [theme, setTheme] = useState(window.localStorage.getItem('app-theme') || 'light')

  window.addEventListener('theme-update', () => {
    setTheme((window.localStorage.getItem('app-theme') == "dark") ? "dark" : "light")
  })

  const keys_ordered = [
    "Style Issues",
    "Minor Code Issues",
    "Major Code Issues",
    "Critical Code Issues",
  ]

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

    keys_ordered.forEach((key) => {
      if (key in tempdata) {
        issueDataTmp[key] = tempdata[key] / total_issues
      }
    })

    // console.log(tempdata)
    // console.log(issueDataTmp)

    setIssueDataFileGrouped(reportData["report"]["data"].reduce((finalObject, object) => {
      (finalObject[object['File Name']] = finalObject[object['File Name']] || []).push(object);
      return finalObject;
    }, {}))

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

  const chartOptions = {
    theme: {
      mode: theme,
      palette: 'palette1'
    },
    chart: {
      id: "basic-bar"
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    },
    plotOptions: {
      line: {
        background: 'transparent',
      }
    },
  }
  const chartSeries = [
    {
      name: "test-series",
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }
  ]

  return (
    <div style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxHeight: '100%',
      overflowY: 'auto'
    }}>
      <div className='appPanel' style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '50px',
      }}>
        {/* Home for Project ID : {routeParams.projectid} */}

        <div style={{
          width: '100%',
          paddingLeft: '30px'
        }}>
          <h1>
            Issues found in {Object.keys(issueDataFileGrouped).length} file{Object.keys(issueDataFileGrouped).length > 1 && "s"}.
          </h1>
          <LinkButton 
            to={`/projects/${pathParams.projectid}/reports/lastReport`} 
            title={"View the Latest Report"}
            content={<React.Fragment>
              <span style={{
                paddingLeft: '5px'
              }}>View the Latest Report</span>
              <GoArrowRight style={{
                fontSize: '1.25rem',
              }} />
            </React.Fragment>} />
        </div>
        <div>
          <Chart
            width="500px"
            type='donut'
            series={Object.keys(issueData).sort((a, b) => {
              return keys_ordered.indexOf(a) - keys_ordered.indexOf(b)
            }).map((key) => {
              return issueData[key]
            })
            }
            options={{
              theme: {
                mode: theme,
                palette: 'palette1'
              },
              chart: {
                id: "issues-count"
              },
              labels: Object.keys(issueData).sort((a, b) => {
                return keys_ordered.indexOf(a) - keys_ordered.indexOf(b)
              }),
              dataLabels: {
                enabled: true,
              },
              plotOptions: {
                pie: {
                  background: 'transparent',
                  donut: {
                    background: 'transparent',
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        showAlways: true,
                        label: 'Issues Found'
                      }
                    }
                  }
                }
              },
            }}
          />
        </div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px'
      }}>
        <div className='appPanel' style={{
          flex: '1'
        }}>
          <h2 style={{
            marginTop: '0'
          }}>
            Progression of Issues over Time
          </h2>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            width="100%"
            height="400px"
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectHome