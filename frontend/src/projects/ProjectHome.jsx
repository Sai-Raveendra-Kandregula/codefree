import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'react-apexcharts';

import { CodeFreeContext, useRouteData } from '../App';
import LinkButton from '../Components/LinkButton.tsx';
import { GoArrowRight } from 'react-icons/go';
import { NameInitialsAvatar } from 'react-name-initials-avatar';
import { ProjectReportManager } from '../models/Project.tsx';
import { toast } from 'react-toastify';
import CFPage from '../Components/Page/CFPage.tsx';
import MiniBar from '../Graphs/MiniBar.tsx';
import Card from '../Components/Panels/Card.tsx';

export function NoReportsFound() {
    const pathParams = useParams();

    return (
        <div
            className="appPanel"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: '15px',
            }}
        >
            <p>
                There are no reports found for this project. Run a CodeFree test <b>from the CLI</b>,<br />
                or
            </p>
            <LinkButton
                className={'themeButton'}
                to={`/projects/${pathParams.projectid}/reports/upload`}
                title={'Upload a Report'}
            />
        </div>
    );
}

function ProjectHome() {
    const pathParams = useParams();

    const projectInfo = useRouteData('project-root');

    const [reportData, setReportData] = useState(null);
    const [reportsList, setReportsLists] = useState([]);
    const cfAppContext = useContext(CodeFreeContext);
    const themeInfo = useMemo(() => cfAppContext.themeInfo, [cfAppContext.themeInfo]);
    const theme = useMemo(() => themeInfo.actualTheme, [themeInfo.actualTheme]);

    const scoreNormalizer = useMemo(() => 10, []);

    const keys_ordered = useMemo(
        () => ({
            style_issues: 'Style Issues',
            minor_issues: 'Minor Code Issues',
            major_issues: 'Major Code Issues',
            critical_issues: 'Critical Code Issues',
            issue_files: 'Files with Issues',
        }),
        [],
    );

    const reportMan = useMemo(() => {
        return new ProjectReportManager(pathParams.projectid);
    }, [pathParams.projectid]);

    const getLatestReportStats = useCallback(() => {
        reportMan
            .stats('last-report')
            .then((data) => {
                setReportData(data);
            })
            .catch((resp) => {
                if (resp.status !== 404) {
                    toast.error(`Error getting Latest Report (Code : ${resp.status})`);
                }
            });
    }, [reportMan, setReportData]);

    const getAllReports = useCallback(() => {
        reportMan
            .all()
            .then((data) => {
                setReportsLists(data);
            })
            .catch((resp) => {
                setReportsLists([]);
                if (resp.status !== 404) {
                    toast(`Failed to get Reports List (Code : ${resp.status})`);
                }
            });
    }, [reportMan, setReportsLists]);

    useEffect(() => {
        getLatestReportStats();
        getAllReports();
    }, [getAllReports, getLatestReportStats]);

    const issueDataDonut = useMemo(() => {
        if (reportData === null) {
            return {};
        }

        var issueDataTmp = {};

        Object.keys(keys_ordered).forEach((key) => {
            if (reportData[key] > 0 && key !== 'issue_files') {
                issueDataTmp[keys_ordered[key]] = reportData[key];
            }
        });

        return issueDataTmp;
    }, [reportData, keys_ordered]);

    const issueSeries = useMemo(() => {
        return Object.keys(keys_ordered).map((key) => {
            return {
                name: keys_ordered[key],
                data: reportsList.map((report) => {
                    return report[key];
                }),
            };
        });
    }, [reportsList, keys_ordered]);

    const codeQualitySeries = useMemo(() => {
        return [
            {
                name: 'Score',
                data: reportsList.map((report) => {
                    return report['cf_code_quality_score'];
                }),
            },
        ];
    }, [reportsList]);

    const codeQualityMiniBarSeries = useMemo(() => {
        return reportsList
            .sort((a, b) => a['timestamp'] - b['timestamp'])
            .map((report) => {
                return {
                    label: new Date(report['timestamp']).toLocaleString(),
                    value: report['cf_code_quality_score'] * scoreNormalizer,
                };
            });
    }, [reportsList]);

    const timeline = useMemo(() => {
        return reportsList.map((report_data) => {
            const date = new Date(report_data['timestamp']);
            return date;
        });
    }, [reportsList]);

    const chartOptions = {
        theme: {
            mode: theme,
            palette: 'palette1',
        },
        chart: {
            id: 'basic-bar',
        },
        xaxis: {
            categories: timeline,
        },
        plotOptions: {
            line: {
                background: 'transparent',
            },
        },
    };

    return (
        <CFPage title={`${projectInfo['name']}`}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'flex-start',
                    gap: '20px',
                }}
            >
                {reportData ? (
                    <React.Fragment>
                        <div
                            className="appPanel"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '50px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    paddingLeft: '30px',
                                }}
                            >
                                <h2>
                                    Code Quality Score :{' '}
                                    {reportData ? (reportData['cf_code_quality_score'] * 10).toFixed(2) : 0} / 10
                                </h2>
                                <h3>
                                    Issues found in {reportData ? reportData['issue_files'] : 0} file
                                    {reportData ? (reportData['issue_files'] !== 1 ? 's' : '') : 's'}.
                                </h3>
                                <LinkButton
                                    to={`/projects/${pathParams.projectid}/reports/last-report`}
                                    title={'View the Latest Report'}
                                    content={
                                        <React.Fragment>
                                            <span
                                                style={{
                                                    paddingLeft: '5px',
                                                }}
                                            >
                                                View the Latest Report
                                            </span>
                                            <GoArrowRight
                                                style={{
                                                    fontSize: '1.25rem',
                                                }}
                                            />
                                        </React.Fragment>
                                    }
                                />
                            </div>
                            <div>
                                <Chart
                                    width="500px"
                                    type="donut"
                                    series={Object.keys(issueDataDonut).map((key) => {
                                        return issueDataDonut[key];
                                    })}
                                    options={{
                                        theme: {
                                            mode: theme,
                                            palette: 'palette1',
                                        },
                                        chart: {
                                            id: 'issues-count',
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
                                                            label: 'Issues Found',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        <Card
                            title="CF Quality Score"
                            cardStyle={{
                                width: '325px',
                                height: '200px',
                            }}
                        >
                            <MiniBar
                                dataPoints={codeQualityMiniBarSeries}
                                maxValue={scoreNormalizer}
                                valueFormatter={(val) => `${val.toFixed(2)}`}
                                containerStyle={{
                                    height: '100%',
                                    width: '100%',
                                }}
                                tooltipContent={(item) => {
                                    return (
                                        <span>
                                            {item.label} : <b>{item.value.toFixed(2)}</b>
                                        </span>
                                    );
                                }}
                            />
                        </Card>
                        <div
                            className="appPanel"
                            style={{
                                alignSelf: 'stretch',
                            }}
                        >
                            <h2
                                style={{
                                    marginTop: '0',
                                }}
                            >
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
                    </React.Fragment>
                ) : (
                    <NoReportsFound />
                )}
            </div>
        </CFPage>
    );
}

export default ProjectHome;
