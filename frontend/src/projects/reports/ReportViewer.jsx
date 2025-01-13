import React, { useState, useEffect, useContext, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import IssuesList from './IssuesList';
import IconButton from '../../Components/IconButton'

import { IoCloudDownloadOutline } from "react-icons/io5";
import { FaInfoCircle, FaRegTrashAlt } from "react-icons/fa";
import { VscJson } from "react-icons/vsc";
import { TbCsv, TbPdf } from "react-icons/tb";
import { RiFileExcel2Line } from "react-icons/ri";
import { SiAsciidoctor } from "react-icons/si";
import { useRouteData } from '../../App';
import DropdownButton from '../../Components/Dropdown';
import ToolTip from '../../Components/ToolTip';
import { AppContext } from '../../NotFoundContext';
import { toast } from 'react-toastify';
import { getAPIURL } from '../../hooks/useAPI.tsx';
import { ProjectReportManager } from '../../models/Project.tsx';
import CFPage from '../../Components/Page/CFPage.tsx';

export async function reportDataLoader({ params }) {
    const reportMan = new ProjectReportManager(params.projectid)
    return await reportMan.get(params.reportid)
}

function RepoInfo({
    reportData
}) {
    return (reportData && <table style={{
        width: '100%',
        whiteSpace: 'nowrap',
    }}>
        <tbody>
            <tr>
                <td>
                    Generated On
                </td>
                <td>:</td>
                <td>
                    {
                        new Date(reportData['report']['timestamp']).toLocaleString(navigator.languages.slice(-1)[0], {
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
                </td>
            </tr>
            <tr>
                <td>
                    Uploaded On
                </td>
                <td>:</td>
                <td>
                    {
                        new Date(reportData['timestamp']).toLocaleString(navigator.languages.slice(-1)[0], {
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
                </td>
            </tr>
            <tr>
                <td>
                    Uploaded By
                </td>
                <td>:</td>
                <td>
                    {
                        reportData['report_src_usr']
                    }
                </td>
            </tr>
            <tr>
                <td>
                    Uploaded Via
                </td>
                <td>:</td>
                <td>
                    {
                        reportData['report_src']
                    }
                </td>
            </tr>
        </tbody>
    </table>
    )
}

function ReportOptions({
    reportData,
    pathParams
}) {

    const navigate = useNavigate()

    const getExportURL = (format) => {
        return getAPIURL(`/project/${pathParams.projectid}/report/${pathParams.reportid}/export?format=${format}`)
    }
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '10px'
        }}>
            <DropdownButton icon={<IoCloudDownloadOutline size={"1rem"} />} title={"Download Report"} showOnlyIcon={true}>
                {
                    ({ open, close, isOpen }) => {
                        return <React.Fragment>
                            <a className='sideBarLink' title={"Export as XLSX"}
                                href={getExportURL("xlsx")}
                                download={true}
                                onClick={() => {
                                    close()
                                }}
                            >
                                <RiFileExcel2Line />
                                Export as XLSX
                            </a>
                            <a className='sideBarLink' title={"Export as CSV"}
                                href={getExportURL("csv")}
                                download={true}
                                onClick={() => {
                                    close()
                                }}
                            >
                                <TbCsv />
                                Export as CSV
                            </a>
                            <a className='sideBarLink' title={"Export as PDF"}
                                href={getExportURL("pdf")}
                                download={true}
                                onClick={() => {
                                    close()
                                }}
                            >
                                <TbPdf />
                                Export as PDF
                            </a>
                            <a className='sideBarLink' title={"Export as Ascii Doc"}
                                href={getExportURL("adoc")}
                                download={true}
                                onClick={() => {
                                    close()
                                }}
                            >
                                <SiAsciidoctor />
                                Export as Ascii Doc
                            </a>
                            <a className='sideBarLink' title={"Export as JSON"}
                                href={getExportURL("json")}
                                download={true}
                                onClick={() => {
                                    close()
                                }}
                            >
                                <VscJson />
                                Export as JSON
                            </a>
                        </React.Fragment>
                    }
                }
            </DropdownButton>
            <IconButton icon={<FaRegTrashAlt />} title={"Delete Report"} onClick={(e) => {
                e.stopPropagation()
                if (window.confirm("Confirm Report Deletion?")) {
                    fetch(getAPIURL(`project/${pathParams.projectid}/report/${pathParams.reportid}`), {
                        'method': 'DELETE'
                    }).then(resp => {
                        if (resp.status === 200) {
                            navigate('..')
                        }
                        else {
                            throw resp
                        }
                    }).catch((resp) => {
                        toast.error(`Failed to Delete Report (Code:${resp.status})`)
                    })
                }
            }} />
            <ToolTip popup={<RepoInfo reportData={reportData} />}>
                {
                    ({ open, close, isOpen }) => {
                        return <IconButton icon={<FaInfoCircle />} title={"Report Info"} onClick={(e) => {
                            e.stopPropagation()
                            if (isOpen) {
                                close()
                            }
                            else {
                                open()
                            }
                        }} />
                    }
                }
            </ToolTip>
        </div>
    )
}

function ReportViewer() {
    const pathParams = useParams()
    const [searchParams, setSearchParams] = useSearchParams()

    const { setLastReport } = useContext(AppContext);

    const groupingMapping = useMemo(() => ({
        "code": ["Severity", "Compliance Standard", "File Name", "Module Name"],
        "style": ["Check Passed", "File Name", "Module Name"],
        "revision info": [],
    }), [])

    const [viewType, setViewType] = useState(searchParams.get("viewType") || Object.keys(groupingMapping)[0])
    const [groupBy, setGroupBy] = useState(() => {
        return searchParams.get("groupBy") || (groupingMapping[viewType].length > 0 ? groupingMapping[viewType][0] : "")
    });

    const projectInfo = useRouteData('project-root')
    const reportData = useRouteData('report-data')
    const [transformedReportData, setTransformedReportData] = useState({})

    useEffect(() => {
        searchParams.set("viewType", (viewType || Object.keys(groupingMapping)[0]))
        setSearchParams(searchParams)

        if (!(groupingMapping[viewType].includes(groupBy)) && groupingMapping[viewType].length > 0) {
            setGroupBy(groupingMapping[viewType][0])
        }
        else {
            searchParams.delete("groupBy")
            setSearchParams(searchParams)
        }
    }, [viewType, groupBy, groupingMapping, searchParams, setSearchParams])

    useEffect(() => {
        if (groupingMapping[viewType].length > 0) {
            searchParams.set("groupBy", (groupBy || groupingMapping[viewType][0]))
            setSearchParams(searchParams)
        }
    }, [viewType, groupBy, groupingMapping, searchParams, setSearchParams])

    useEffect(() => {
        if (reportData === null) {
            return
        }

        if (pathParams.reportid.toLowerCase() === 'last-report') {
            setLastReport(reportData["id"])
        }
        else {
            setLastReport(0)
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
        if (searchParams.get('viewType') === null) {
            if (dataKeys.length > 0) {
                searchParams.set('viewType', dataKeys[0])
            }
            else {
                searchParams.set('viewType', null)
            }
            setSearchParams(searchParams)
        }

    }, [reportData, pathParams.reportid, searchParams, setSearchParams, setLastReport])

    return (
        <CFPage
            title={`Report #${reportData && reportData['id']}`}
            pageToolBar={<ReportOptions reportData={reportData} pathParams={pathParams} />}
        >
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative',
            }}>
                <div style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    position: 'sticky',
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: 'var(--background)',
                    zIndex: '999',
                }}>
                    <div style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: '0px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: '20px',
                        borderBottom: '1px solid var(--border-color)',
                    }}>
                        <div className={`viewTypeCarousel`} style={{
                            boxSizing: 'border-box',
                            border: 'none',
                            alignSelf: 'stretch',
                            minHeight: 'var(--control-inline-height)',
                            height: '100%',
                            flex: 1,
                        }}>
                            {
                                Object.keys(groupingMapping).map((val) => {
                                    if (val === "revision info" && (!reportData || !reportData['commit_info'])) {
                                        return undefined
                                    }
                                    return <Link
                                        key={val}
                                        className={`viewTypeButton ${viewType === val ? "selected" : ""}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setViewType(val)
                                        }}>
                                        {val}
                                    </Link>
                                })
                            }
                        </div>
                        <div style={{
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '5px 0'
                        }}>
                            {
                                (viewType in groupingMapping) &&
                                groupingMapping[viewType].length > 0 && <React.Fragment>
                                    <span style={{
                                        fontWeight: '500'
                                    }}>Group By :</span>
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
                                </React.Fragment>
                            }
                        </div>
                    </div>
                </div>
                {
                    reportData ?
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            width: '100%',
                            // maxHeight: '100%',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                overflowY: 'auto',
                                boxSizing: 'border-box',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                justifyContent: 'flex-start',
                                gap: '5px',
                                marginBottom: '60px'
                            }}>
                                {
                                    viewType && !(["revision info"].includes(viewType)) &&
                                    <IssuesList issuesData={transformedReportData} issueType={viewType} groupBy={groupBy} />
                                }
                                {
                                    viewType && viewType === "revision info" &&
                                    <div>
                                        {
                                            reportData['commit_info'] && reportData['commit_info'].map((commit_obj) => {
                                                return <React.Fragment>
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    Commit
                                                                </td>
                                                                <td>:</td>
                                                                <td>
                                                                    {commit_obj['subject']} (<a
                                                                        target='_blank'
                                                                        rel='noreferrer'
                                                                        href={
                                                                            projectInfo['git_remote_commit_url'] ?
                                                                                projectInfo['git_remote_commit_url'].replace(/\/+$/, '') + "/" + commit_obj['hash']
                                                                                :
                                                                                null
                                                                        }  >
                                                                        {commit_obj['hash']}
                                                                    </a>)
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    Authored by
                                                                </td>
                                                                <td>:</td>
                                                                <td>{commit_obj['author']} ({commit_obj['email']})</td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    Commited on
                                                                </td>
                                                                <td>:</td>
                                                                <td>{commit_obj['age']}, on {commit_obj['date']}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    {
                                                        commit_obj['body'].length > 0 &&
                                                        <>
                                                            <h4>
                                                                Commit Message
                                                            </h4>
                                                            <code>
                                                                {commit_obj['body']}
                                                            </code>
                                                        </>
                                                    }
                                                    {
                                                        commit_obj['notes'].length > 0 &&
                                                        <>
                                                            <h4>
                                                                Commit Notes
                                                            </h4>
                                                            <code>
                                                                {commit_obj['notes']}
                                                            </code>
                                                        </>
                                                    }
                                                </React.Fragment>
                                            })
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                        :
                        <span>
                            Loading...
                        </span>
                }

            </div>
        </CFPage>
    )
}

export default ReportViewer