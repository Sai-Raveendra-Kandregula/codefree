import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import IssuesList from './IssuesList';


function ReportViewer() {
    const pathParams = useParams()
    const [searchParams, setSearchParams] = useSearchParams();

    const SERVER = "http://localhost:8080"

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
        if (reportData == null){
            return
        }

        var tempdata = {}

        reportData["report"]["data"].forEach(element => {
            var moduleType = element['Module Type']
            if (!(moduleType in tempdata)){
                tempdata[moduleType] = []
            }
            tempdata[moduleType].push(element)
        });

        setTransformedReportData(tempdata)

        const dataKeys = Object.keys(tempdata)
        if (searchParams.get('viewType') == null){
            if(dataKeys.length > 0){
                searchParams.set('viewType', dataKeys[0])
            }
            else{
                searchParams.set('viewType', null)
            }
            setSearchParams(searchParams)
        }

    }, [reportData])
    

    return (
        <div style={{
            height:'100%',
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
            <hr />
            {
                reportData ? 
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    maxHeight: '100%',
                }}>
                    <div>
                        {
                            Object.keys(transformedReportData).map((val) => {
                                return <button onClick={()=>{
                                    searchParams.set('viewType', val)
                                    setSearchParams(searchParams)
                                }}>
                                    {val.toUpperCase()}
                                </button>
                            })
                        }
                    </div>
                    <div style={{
                        overflowY:'auto',
                        padding: '20px',
                        paddingTop: '10px',
                        marginLeft: '-20px',
                        marginRight: '-20px',
                        
                    }}>
                        {
                            searchParams.get('viewType') && 
                            <IssuesList issuesData={transformedReportData} issueType={searchParams.get('viewType')} />
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