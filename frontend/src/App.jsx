import './App.css';
import './Charts.css';
import './Dropdown.css';
import './TabView.css';
import './Tooltip.css';
import { Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements, Outlet, useMatches, useNavigate } from 'react-router-dom'
import { lazy, Suspense } from 'react';

import Loading from './Loading';
import ErrorPage from './ErrorPage';
import SignOut from './SignOut';
import { NotFound } from './NotFoundContext';
import { globalRootLoader } from './GlobalRoot';
import { ToastContainer, toast } from 'react-toastify';
import { projectListLoader } from './projects/ProjectsList';
import { pendingUserListLoader, userListLoader } from './system/SystemSettingsUsers';
import UserModify, { ModifyUserAction } from './users/UserModify';
import ProjectsCreate, { projectCreateAction } from './projects/ProjectsCreate';
import CreateReport from './projects/reports/ReportCreate';
import { signInAction } from './SignIn';
import SignUp from './SignUp';

const SignIn = lazy(() => import('./SignIn'));
const GlobalRoot = lazy(() => import('./GlobalRoot'));

const ProjectsRoot = lazy(() => import('./projects'));
const ProjectWrapper = lazy(() => import('./projects/ProjectWrapper'));
const ProjectsList = lazy(() => import('./projects/ProjectsList'));
const ProjectHome = lazy(() => import('./projects/ProjectHome'));
const ConfigureProject = lazy(() => import('./projects/ConfigureProject'));

const Reports = lazy(() => import('./projects/reports/Reports'));
const ReportViewer = lazy(() => import('./projects/reports/ReportViewer'));

const UserRoot = lazy(() => import('./users/UserRoot'));
const UserInfo = lazy(() => import('./users/UserInfo'));
const UserPreferences = lazy(() => import('./users/UserPreferences'));

const SystemSettingsRoot = lazy(() => import('./system/SystemSettingsRoot'));
const SystemSettingsUsers = lazy(() => import('./system/SystemSettingsUsers'));

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
const SERVER_ROOT_PATH = tmp.length > 0 ? '/' + process.env.REACT_APP_ROOT_PATH.replace(/^\/|\/$/g, "") : '' // Get Base Path from env and remove any trailing slashes

const SuspenseLayout = () => (
    <Suspense fallback={<Loading />}>
        <Outlet />
    </Suspense>
);


function App() {
    const RoutesJSX = (
        <Route path={`/`} element={<SuspenseLayout />} errorElement={<NotFound />}>
            <Route path={`/`} element={<GlobalRoot />} loader={globalRootLoader} shouldRevalidate={() => true}>
                <Route path={`/`} element={<Navigate to={'/projects'} replace={false} />} />
                <Route path={`/home`} element={<Navigate to={'/projects'} replace={false} />} />
                <Route path={`/user`} element={<UserRoot />}>
                    <Route path={`/user/profile`} element={<UserInfo currentUserInfo={true} />} />
                    <Route path={`/user/:userid`} element={<Outlet />} >
                        <Route path={`/user/:userid`} element={<Navigate to={'profile'} relative={true} />} />
                        <Route path={`/user/:userid/profile`} element={<UserInfo />} />
                        <Route path={`/user/:userid/edit`} element={<UserModify />} action={ModifyUserAction} />
                        <Route path={`/user/:userid/preferences`} element={<UserPreferences />} />
                    </Route>
                </Route>
                <Route path={`/projects`} element={<ProjectsRoot />} >
                    <Route path={`/projects`} element={<ProjectsList />} loader={projectListLoader} />
                    <Route path={`/projects/create`} element={<ProjectsCreate />} action={projectCreateAction} />
                    <Route path={`/projects/:projectid`} element={<ProjectWrapper />} >
                        <Route path={`/projects/:projectid`} element={<ProjectHome />} />
                        <Route path={`/projects/:projectid/reports`} element={<Reports />} />
                        <Route path={`/projects/:projectid/reports/upload`} element={<CreateReport />} />
                        <Route path={`/projects/:projectid/reports/:reportid`} element={<ReportViewer />} />
                        <Route path={`/projects/:projectid/configure`} element={<ConfigureProject />} />
                    </Route>
                </Route>
                <Route path='/admin-area' element={<SystemSettingsRoot />} >
                    <Route path='/admin-area' element={<Navigate to={`/admin-area/users`} />} />
                    <Route path='/admin-area/users' element={<Navigate to={'/admin-area/users/all'} />} />
                    <Route path='/admin-area/users/all' element={<SystemSettingsUsers />} loader={userListLoader} />
                    <Route path='/admin-area/users/pending' element={<SystemSettingsUsers pendingUsers={true} />} loader={pendingUserListLoader} />
                    {/* <Route path='/admin-area/users/create-user' element={<SystemSettingsUserCreate />} /> */}
                    <Route path='/admin-area/users/:userid' element={<UserInfo adminMode={true} />} />
                </Route>
            </Route>
            <Route path={`/sign-in`} element={<SignIn />} action={signInAction} />
            <Route path={`/sign-up`} element={<SignUp />} />
            <Route path={`/sign-out`} element={<SignOut />} />
            <Route path='*' element={<ErrorPage errorNumber={404} />} />
        </Route>)

    const routes = createRoutesFromElements(RoutesJSX);

    const router = createBrowserRouter(routes, {
        basename: `${SERVER_ROOT_PATH}`
    })
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
