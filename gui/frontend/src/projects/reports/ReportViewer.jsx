import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import IssuesList from './IssuesList';
import reportViewerStyles from '../../styles/reportViewer.module.css'


function ReportViewer() {
    const pathParams = useParams()
    const [searchParams, setSearchParams] = useSearchParams();

    const SERVER = `http://${window.location.hostname}:8080`
    
    const groupingMapping = {
        "code": ["Severity", "Compliance Standard", "File Name", "Module Name"],
        "style": ["Check Passed", "File Name", "Module Name"]
    }
    
    const [viewType, setViewType] = useState(searchParams.get("viewType") || Object.keys(groupingMapping)[0])
    const [groupBy, setGroupBy] = useState(() => { 
        return searchParams.get("groupBy") || groupingMapping[viewType][0]
    });
    const [reportData, setReportData] = useState(null)
    const [transformedReportData, setTransformedReportData] = useState({})

    function getReportData() {
        fetch(`${SERVER}/api/projects/get-report?project=${pathParams.projectid}&report=${pathParams.reportid}`).then(
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
        getReportData()
    }, [])

    useEffect(() => {
        searchParams.set("viewType", (viewType || Object.keys(groupingMapping)[0]))
        setSearchParams(searchParams)

        if (!(groupingMapping[viewType].includes(groupBy))){
            setGroupBy(groupingMapping[viewType][0])
        }
    }, [viewType])

    useEffect(() => {
        searchParams.set("groupBy", (groupBy || groupingMapping[viewType][0]))
        setSearchParams(searchParams)
    }, [viewType, groupBy])

    useEffect(() => {
        if (reportData == null) {
            return
        }

        var tempdata = {}

        reportData["report"]["data"].forEach(element => {
            var moduleType = element['Module Type']
            if (!(moduleType in tempdata)) {
                tempdata[moduleType] = []
            }
            tempdata[moduleType].push(element)
        });

        setTransformedReportData(tempdata)

        const dataKeys = Object.keys(tempdata)
        if (searchParams.get('viewType') == null) {
            if (dataKeys.length > 0) {
                searchParams.set('viewType', dataKeys[0])
            }
            else {
                searchParams.set('viewType', null)
            }
            setSearchParams(searchParams)
        }

    }, [reportData])


    return (
        <div style={{
            height: '100%',
            maxHeight: '100%',
            overflowY: 'hidden',
            padding: '20px',
            paddingTop: 0
        }}>
            Report #{pathParams.reportid} {" | "}
            {
                reportData &&
                <span>
                    Timestamp : {
                        new Date(reportData['report']['timestamp'])
                            .toLocaleString(navigator.languages[navigator.languages.length - 1], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })
                            .replace(/T/, ' ') // Replace 'T' with a space
                            .replace(/\..+/, '')
                    }
                </span>
            }
            {
                reportData ?
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        maxHeight: '100%',
                        paddingTop : '20px'
                    }}>
                        <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                            }}>
                            <div className={`${reportViewerStyles.viewTypeCarousel}`}>
                                {
                                    Object.keys(groupingMapping).map((val) => {
                                        return <button className={`${reportViewerStyles.viewTypeButton} ${viewType == val ? reportViewerStyles.selected : ""}`} onClick={() => {
                                            setViewType(val)
                                        }}>
                                            {val.toUpperCase()}
                                        </button>
                                    })
                                }
                            </div>
                            <div style={{
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                Group By :
                                <select name="groupIssues" id="groupIssuesBySelector" onChange={(e) => {
                                    setGroupBy(e.target.value)
                                }}
                                    value={groupBy}
                                >
                                    {
                                        (viewType in groupingMapping) &&
                                        groupingMapping[viewType].map((groupingParam) => {
                                            return <option key={`groupby_${groupingParam}`} value={groupingParam}
                                            >
                                                {groupingParam}
                                            </option>
                                        })
                                    }
                                </select>
                            </div>

                        </div>
                        <div style={{
                            overflowY: 'auto',
                            padding: '20px 20px 40px 20px',
                            marginLeft: '-20px',
                            marginRight: '-20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent:'flex-start',
                            gap: '5px'
                        }}>
                            {
                                viewType &&
                                <IssuesList issuesData={transformedReportData} issueType={viewType} groupBy={groupBy} />
                            }
                        </div>
                    </div>
                    :
                    <span>
                        Loading...
                    </span>
            }

        </div>
    )
}

export default ReportViewer