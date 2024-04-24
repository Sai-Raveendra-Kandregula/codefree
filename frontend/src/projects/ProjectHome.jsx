import React, { useState, useEffect, useMemo } from 'react'
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
  const [reportsList, setReportsLists] = useState([])
  const [theme, setTheme] = useState(window.localStorage.getItem('app-theme') || 'light')

  window.addEventListener('theme-update', () => {
    setTheme((window.localStorage.getItem('app-theme') == "dark") ? "dark" : "light")
  })

  const keys_ordered = {
    "style_issues" : "Style Issues",
    "minor_issues" : "Minor Code Issues",
    "major_issues" : "Major Code Issues",
    "critical_issues" : "Critical Code Issues",
    "issue_files" : "Files with Issues"
  }

  function getLatestReportStats() {
    fetch(`${SERVER_BASE_URL}/api/reports/get-stats?project=${pathParams.projectid}&report=lastReport`).then(
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

  function getAllReports(){
    fetch(`${SERVER_BASE_URL}/api/reports/all-reports?project=${pathParams.projectid}`).then(
      (resp) => {
        if (resp.status == 200) {
          return resp.json()
        }
        else {
          return null
        }
      }).then((data) => {
        if(data){
          setReportsLists(data)
        }
        else{
          setReportsLists([])
        }
      }).catch((reason) => {
        console.log(`Error Fetching Report List : ${reason}`)
        setReportsLists([])
      })
  }

  useEffect(() => {
    getLatestReportStats()
    getAllReports()
  }, [])

  const issueDataDonut = useMemo(() => {
    if (reportData == null) {
      return {}
    }

    var issueDataTmp = {}

    Object.keys(keys_ordered).forEach((key) => {
      if (reportData[key] > 0 && key != "issue_files") {
        issueDataTmp[keys_ordered[key]] = reportData[key]
      }
    })

    return issueDataTmp
  }, [reportData]);

  const issueSeries = useMemo(()=>{
    return Object.keys(keys_ordered).map((key) => {
      return {
        name: keys_ordered[key],
        data: reportsList.map((report) => {
          return report[key]
        })
      }
    })
  }, [reportsList])

  const timeline = useMemo(() => {
    return reportsList.map((report_data) => {
      return new Date(report_data['timestamp'])
    })
  }, [reportsList])

  const chartOptions = {
    theme: {
      mode: theme,
      palette: 'palette1'
    },
    chart: {
      id: "basic-bar"
    },
    xaxis: {
      categories: timeline
    },
    plotOptions: {
      line: {
        background: 'transparent',
      }
    },
  }

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
        <div style={{
          width: '100%',
          paddingLeft: '30px'
        }}>
          <h1>
            Issues found in { reportData ? reportData['issue_files'] : 0 } file{reportData ? (reportData['issue_files'] != 1 ? "s" : "") : "s"}.
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
            series={Object.keys(issueDataDonut).map((key) => {
              return issueDataDonut[key]
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
              labels: Object.keys(issueDataDonut),
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
            series={issueSeries}
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