import { getAPIURL } from '../hooks/useAPI.tsx'

export interface CommitInfo {
    hash: string
    author: string
    date: string
    email: string
    subject: string
    body: string
    notes: string
    commitDate: string
    age: string
}

export interface ReportIssueItemBase {
    "Module Type": string
    "File Name": string
    "Module Name": string
}

export interface ReportStyleIssueItem extends ReportIssueItemBase {
    "Check Passed": "Failed" | "Passed"
}

export interface ReportCodeIssueItemBase extends ReportIssueItemBase {
    "Compliance Standard": string
    Severity: string
    Line: number
    Column: number
    Context: string
    Description: string
    Symbol?: string
    Type: string
    Suggestion: string | null
}

export interface ReportCodeIssueItemCWE {
    "Primary CWE": string
    "CWE List": string
    "Additional Info": string | null
}

export interface ReportCodeIssueItemMISRA {
    "MISRA Rule Number": string
    "Additional Info": string | null
}

export type ReportCodeIssueItem = ReportCodeIssueItemBase & (ReportCodeIssueItemCWE | ReportCodeIssueItemMISRA)

export type ReportRestObject = {
    id: number
    slug: string
    name: string
    avatar_color: string
    git_remote_url?: string
    git_remote_commit_url?: string
    project_id: number
    timestamp: number
    report_src: string
    report_src_usr: string
    cf_code_quality_score: number
    style_issues: number
    cwe_issues: number
    misra_issues: number
    info_issues: number
    minor_issues: number
    major_issues: number
    critical_issues: number
    issue_files: number
    commit_info?: CommitInfo[]
    report_id: number

    report ?: Array<ReportStyleIssueItem | ReportStyleIssueItem>
}

export class Report {
    id: number
    slug: string
    name: string
    avatar_color: string
    git_remote_url?: string
    git_remote_commit_url?: string
    project_id: number
    timestamp: number
    report_src: string
    report_src_usr: string
    cf_code_quality_score: number
    style_issues: number
    cwe_issues: number
    misra_issues: number
    info_issues: number
    minor_issues: number
    major_issues: number
    critical_issues: number
    issue_files: number
    commit_info?: CommitInfo[]
    report_id: number

    report?: Array<ReportStyleIssueItem | ReportStyleIssueItem>

    constructor(obj: ReportRestObject) {
        this.id = obj.id
        this.slug = obj.slug
        this.name = obj.name
        this.avatar_color = obj.avatar_color
        this.git_remote_url = obj.git_remote_url
        this.git_remote_commit_url = obj.git_remote_commit_url

        this.project_id = obj.project_id
        this.timestamp = obj.timestamp
        this.report_src = obj.report_src
        this.report_src_usr = obj.report_src_usr
        this.cf_code_quality_score = obj.cf_code_quality_score
        this.style_issues = obj.style_issues
        this.cwe_issues = obj.cwe_issues
        this.misra_issues = obj.misra_issues
        this.info_issues = obj.info_issues
        this.minor_issues = obj.minor_issues
        this.major_issues = obj.major_issues
        this.critical_issues = obj.critical_issues
        this.issue_files = obj.issue_files
        this.commit_info = obj.commit_info
        this.report_id = obj.report_id

        if('report' in obj){
            this.report = obj.report
        }
    }

    static async all(project_id: string) {
        const resp = await fetch(getAPIURL(`/project/${project_id}/report/-/all`))
        if (resp.status === 200) {
            const out: Array<ReportRestObject> = await resp.json()
            return out.map((item) => {
                return new Report(item)
            })
        }
        throw resp
    }

    static async get(project_id: string, report_id: string) {
        const resp = await fetch(getAPIURL(`/project/${project_id}/report/${report_id}/`))
        if (resp.status === 200) {
            return new Report(await resp.json())
        }
        throw resp
    }

    static async stats(project_id: string, report_id: string) {
        const resp = await fetch(getAPIURL(`/project/${project_id}/report/${report_id}/stats`))
        if (resp.status === 200) {
            return new Report(await resp.json())
        }
        throw resp
    }
}