import './App.css';
import './Charts.css';
import './Dropdown.css';
import './TabView.css';
import './Tooltip.css';
import { BrowserRouter, Routes, Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements, Outlet, useMatches } from 'react-router-dom'
import ProjectsRoot from './projects';
import { useState, lazy, Suspense, useContext } from 'react';

import Loading from './Loading';
import ErrorPage from './ErrorPage';
import SignOut from './SignOut';
import { NotFound } from './NotFoundContext';
import { globalRootLoader } from './GlobalRoot';
import { ToastContainer, toast } from 'react-toastify';
import UserRoot from './users/UserRoot';
import UserInfo from './users/UserInfo';
import UserPreferences from './users/UserPreferences';
import { StatusCodes } from 'http-status-codes';
import SystemSettingsRoot from './system/SystemSettingsRoot';
import { projectListLoader } from './projects/ProjectsList';

const SignIn = lazy(() => import('./SignIn'));
const GlobalRoot = lazy(() => import('./GlobalRoot'));
const ProjectWrapper = lazy(() => import('./projects/ProjectWrapper'));
const ProjectsList = lazy(() => import('./projects/ProjectsList'));
const ProjectHome = lazy(() => import('./projects/ProjectHome'));
const Reports = lazy(() => import('./projects/reports/Reports'));
const ReportViewer = lazy(() => import('./projects/reports/ReportViewer'));
const ConfigureProject = lazy(() => import('./projects/ConfigureProject'));

export const useRouteData = (routeId) => {
    const matches = useMatches();
    const data = matches.find((match) => match.id === routeId)?.data;

    return data;
};

function setTitle(title = "") {
    window.title = `${title} | CodeFree`;
}

const SERVER_BASE_URL = process.env.REACT_APP_SERVER_BASE_URL.replace(/^\/|\/$/g, "") || '' // Get Base url from env and remove any trailing slashes
var tmp = process.env.REACT_APP_ROOT_PATH.replace(/^\/|\/$/g, "").toString()
const SERVER_ROOT_PATH = tmp.length > 0 ? process.env.REACT_APP_ROOT_PATH.replace(/^\/|\/$/g, "") : '' // Get Base Path from env and remove any trailing slashes

const SuspenseLayout = () => (
    <Suspense fallback={<Loading />}>
        <Outlet />
    </Suspense>
);

const RoutesJSX = (
    <Route path={`/`} element={<SuspenseLayout />} errorElement={<NotFound />}>
        <Route path={`/sign-in`} element={<SignIn />} />
        <Route path={`/sign-out`} element={<SignOut />} />
        <Route path='*' element={<ErrorPage errorNumber={404} />} />
        <Route path={`/`} element={<GlobalRoot />} loader={globalRootLoader} shouldRevalidate={({ currentUrl }) => {
            return true
        }}>
            <Route path={`/`} element={<Navigate to={'/projects'} replace={false} />} />
            <Route path={`/home`} element={<Navigate to={'/projects'} replace={false} />} />
            <Route path={`/user`} element={<UserRoot />}>
                <Route path={`/user/:userid`} element={<Outlet />} >
                    <Route path={`/user/:userid`} element={<UserInfo />} action={async ({ request, params }) => {
                        switch (request.method) {
                            case "POST": {
                                let formData = await request.formData()
                                let submitData = Object.fromEntries(formData)
                                console.log(submitData)
                                const resp = await fetch(`${SERVER_BASE_URL}/api/user/modify-user`, {
                                    method: 'post',
                                    body: JSON.stringify(submitData),
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    credentials: 'include'
                                })
                                if(resp.status == StatusCodes.OK){
                                    toast.success("User updated Successfully.")
                                }
                                else if(resp.status == StatusCodes.NOT_FOUND){
                                    toast.error("User not found.")
                                }
                                return await resp.json()
                            }
                            default: {
                                throw new Response("", { status: 405 });
                            }
                        }
                    }} />
                    <Route path={`/user/:userid/preferences`} element={<UserPreferences />} />
                </Route>
            </Route>
            <Route path={`/projects`} element={<ProjectsRoot />} >
                <Route path={`/projects`} element={<ProjectsList />} loader={projectListLoader} shouldRevalidate={({currentUrl}) => {
                    return true
                }} />
                <Route path={`/projects/:projectid`} element={<ProjectWrapper />} >
                    <Route path={`/projects/:projectid`} element={<ProjectHome />} />
                    <Route path={`/projects/:projectid/reports`} element={<Reports />} />
                    <Route path={`/projects/:projectid/reports/:reportid`} element={<ReportViewer />} />
                    <Route path={`/projects/:projectid/configure`} element={<ConfigureProject />} />
                </Route>
            </Route>
            <Route path='/system-preferences' element={<SystemSettingsRoot />} />
        </Route>
    </Route>)

const routes = createRoutesFromElements(RoutesJSX);

const router = createBrowserRouter(routes, {
    basename: `${SERVER_ROOT_PATH}`
})

function App() {
    return (
        <div className="App">
            <RouterProvider router={router} />
            <ToastContainer limit={3} />
        </div>
    );
}

export default App;
export {
    setTitle,
    SERVER_BASE_URL,
    SERVER_ROOT_PATH
};
