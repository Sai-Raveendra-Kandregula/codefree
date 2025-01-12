import { StatusCodes } from "http-status-codes"
import { getAPIURL } from "../hooks/useAPI.tsx"

export class User {
    static async all() {
        const resp = await fetch(getAPIURL(`/user/-/all`), {
            credentials: "include"
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return await resp.json()
        }
    }

    static async allPending() {
        const resp = await fetch(getAPIURL(`/user/-/all-pending`), {
            credentials: "include"
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return await resp.json()
        }
    }

    static async SignInUser(username: string, password: string, keepSignedIn: boolean = false) {
        const resp = await fetch(getAPIURL(`/user/sign-in`), {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'password': password,
                'keepSignedIn': keepSignedIn
            }),
            credentials: "include",
            mode: 'cors'
        })
        if(resp.status == StatusCodes.OK){
            return await resp.json()
        }
        throw resp
    }

    static async SignOut() {
        const resp = await fetch(getAPIURL(`/user/-/sign-out`), {
            method: "post",
            credentials: "include",
            mode: 'cors'
        })
        
        if(resp.status == StatusCodes.OK){
            return await resp.json()
        }
        throw resp
    }

    static async getCurrentUser() {
        const resp = await fetch(getAPIURL(`/user/-/validate`), {
            credentials: "include"
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return await resp.json()
        }
    }

    static async getUser(user_id: string) {
        const resp = await fetch(getAPIURL(`/user/${user_id}`), {
            credentials: "include"
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return resp.json()
        }
    }

    static async updateUser(user_id: string, newData : any) {
        const resp = await fetch(getAPIURL(`/user/${user_id}/modify`), {
            method: 'POST',
            body: JSON.stringify(newData),
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return resp.json()
        }
    }
    
    static async deleteUser(user_id: string) {
        const resp = await fetch(getAPIURL(`/user/${user_id}`), {
            method: 'DELETE',
            credentials: "include"
        })
        if (resp.status !== 200) {
            throw resp
        }
        else {
            return resp.json()
        }
    }
}