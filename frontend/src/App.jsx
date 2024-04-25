import './App.css';
import './Charts.css';
import './Dropdown.css';
import './TabView.css';
import './Tooltip.css';
import { BrowserRouter, Routes, Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements, Outlet } from 'react-router-dom'
import ProjectsRoot from './projects';
import { useState, lazy, Suspense, useContext } from 'react';

import Loading from './Loading';
import ErrorPage from './ErrorPage';
import SignOut from './SignOut';
import { AppContext, NotFound } from './NotFoundContext';
import { projectInfoLoader } from './projects/ProjectWrapper';
import { reportDataLoader } from './projects/reports/ReportViewer';

const SignIn = lazy(() => import('./SignIn'));
const GlobalRoot = lazy(() => import('./GlobalRoot'));
const ProjectWrapper = lazy(() => import('./projects/ProjectWrapper'));
const ProjectsList = lazy(() => import('./projects/ProjectsList'));
const ProjectHome = lazy(() => import('./projects/ProjectHome'));
const Reports = lazy(() => import('./projects/reports/Reports'));
const ReportViewer = lazy(() => import('./projects/reports/ReportViewer'));
const ConfigureProject = lazy(() => import('./projects/ConfigureProject'));

function setTitle(title = "") {
    window.title = `${title} | CodeFree`;
}

const SERVER_BASE_URL = process.env.REACT_APP_SERVER_BASE_URL.replace(/\/$/, "") || '' // Get Base url from env and remove any trailing slashes

const SuspenseLayout = () => (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );

const RoutesJSX = (
    <Route path="/" element={<SuspenseLayout />}>
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-out' element={<SignOut />} />
        <Route path='*' element={<ErrorPage error={404} />} />
        <Route path='/' element={<GlobalRoot />}>
            <Route path='/' element={<Navigate to={'/home'} replace={false} />} />
            <Route path='/home' element={<Navigate to={'/projects'} replace={false} />} />
            <Route path='/projects/' element={<ProjectsRoot />} >
                <Route path='/projects/' element={<ProjectsList />} />
                <Route path='/projects/:projectid' element={<ProjectWrapper />} loader={projectInfoLoader} errorElement={<NotFound />}>
                    <Route path='/projects/:projectid/' element={<Navigate to={`overview`} relative={true} replace={false} />} />
                    <Route path='/projects/:projectid/overview' element={<ProjectHome />} />
                    <Route path='/projects/:projectid/reports' element={<Reports />} />
                    <Route path='/projects/:projectid/reports/:reportid' element={<ReportViewer />} loader={reportDataLoader} errorElement={<NotFound />} />
                    <Route path='/projects/:projectid/configure' element={<ConfigureProject />} />
                </Route>
            </Route>
        </Route>
    </Route>)

const routes = createRoutesFromElements(RoutesJSX);

const router = createBrowserRouter(routes)

function App() {
    return (
        <div className="App">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
export {
    setTitle,
    SERVER_BASE_URL
};
