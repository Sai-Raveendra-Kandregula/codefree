import './App.css';
import './TabView.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProjectsRoot from './projects';
import { useState, lazy, Suspense } from 'react';
import Loading from './Loading';
import ErrorPage from './ErrorPage';
import SignOut from './SignOut';

const SignIn = lazy(() => import('./SignIn'));
const GlobalRoot = lazy(() => import('./GlobalRoot'));
const ProjectWrapper = lazy(() => import('./projects/ProjectWrapper'));
const ProjectsList = lazy(() => import('./projects/ProjectsList'));
const ProjectHome = lazy(() => import('./projects/ProjectHome'));
const Reports = lazy(() => import('./projects/reports/Reports'));
const ReportViewer = lazy(() => import('./projects/reports/ReportViewer'));
const ConfigureProject = lazy(() => import('./projects/ConfigureProject'));

function setTitle(title = ""){
    window.title = `${title} | CodeFree`;
}

const SERVER_BASE_URL = process.env.REACT_APP_SERVER_BASE_URL.replace(/\/$/, "") || '' // Get Base url from env and remove any trailing slashes

function App() {
    const [showHeader, setShowHeader] = useState(false)

    return (
        <div className="App">
            <BrowserRouter>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path='/sign-in' element={<SignIn />} />
                        <Route path='/sign-out' element={<SignOut />} />
                        <Route path='*' element={<ErrorPage error='404' />} /> 
                        <Route path='/' element={<GlobalRoot />}>
                            <Route path='/' element={<Navigate to={'/home'} replace={false} />} />
                            <Route path='/home' element={<Navigate to={'/projects'} replace={false} />} />
                            <Route path='/projects/' element={<ProjectsRoot />}>
                                <Route path='/projects/' element={<ProjectsList />} />
                                <Route path='/projects/:projectid' element={<ProjectWrapper />}>
                                    <Route path='/projects/:projectid/' element={<Navigate to={`overview`} relative={true} replace={false} />} />
                                    <Route path='/projects/:projectid/overview' element={<ProjectHome />} />
                                    <Route path='/projects/:projectid/reports' element={<Reports />} />
                                    <Route path='/projects/:projectid/reports/:reportid' element={<ReportViewer />} />
                                    <Route path='/projects/:projectid/configure' element={<ConfigureProject />} />
                                </Route>
                            </Route>
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </div>
    );
}

export default App;
export {
    setTitle,
    SERVER_BASE_URL
};
