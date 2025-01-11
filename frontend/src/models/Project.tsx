import { getAPIURL } from '../hooks/useAPI.tsx'
import { Report } from './Report.tsx'

export type ProjectRestObject = {
    id : number
    slug : string
    name: string
    avatar_color : string
    git_remote_url ?: string
    git_remote_commit_url ?: string
}

export class ProjectReportManager {
    project_id : string
    constructor( project_id : string ){
        this.project_id = project_id
    }

    async all() {
        return await Report.all(this.project_id)
    }

    async get(report_id: string) {
        return await Report.get(this.project_id, report_id)
    }
    
    async stats(report_id: string) {
        return await Report.stats(this.project_id, report_id)
    }
}

export class Project {
    id : number;
    slug : string;
    name: string;
    avatar_color : string;
    git_remote_url ?: string;
    git_remote_commit_url ?: string

    reports : ProjectReportManager

    constructor(obj : ProjectRestObject) {
        this.id = obj.id
        this.slug = obj.slug
        this.name = obj.name
        this.avatar_color = obj.avatar_color
        this.git_remote_url = obj.git_remote_url
        this.git_remote_commit_url = obj.git_remote_commit_url

        this.reports = new ProjectReportManager(this.slug)
    }

    static async all() {
        const resp = await fetch(getAPIURL(`/project/-/all`))
        if (resp.status === 200) {
            const out : Array<ProjectRestObject> = await resp.json()
            return out.map((item) => {
                return new Project(item)
            })
        }
        throw resp
    }

    static async get(project_id: string) {
        const resp = await fetch(getAPIURL(`/project/${project_id}/`))
        if (resp.status === 200) {
            return new Project(await resp.json())
        }
        throw resp
    }
}