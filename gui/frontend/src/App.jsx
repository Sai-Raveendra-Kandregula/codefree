import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProjectsRoot from './projects';
import { useState, lazy, Suspense } from 'react';
import Loading from './Loading';

const GlobalRoot = lazy(() => import('./GlobalRoot'));
const ProjectWrapper = lazy(() => import('./projects/ProjectWrapper'));
const ProjectsList = lazy(() => import('./projects/ProjectsList'));
const ProjectHome = lazy(() => import('./projects/ProjectHome'));
const Reports = lazy(() => import('./projects/reports/Reports'));
const ReportViewer = lazy(() => import('./projects/reports/ReportViewer'));
const Settings = lazy(() => import('./projects/Settings'));

function App() {
    const [showHeader, setShowHeader] = useState(false)

    return (
        <div className="App">
            <BrowserRouter>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path='/' element={<GlobalRoot />}>
                            <Route path='/' element={<Navigate to={'/projects'} />} />
                            <Route path='/projects/' element={<ProjectsRoot />}>
                                <Route path='/projects/' element={<ProjectsList />} />
                                <Route path='/projects/:projectid' element={<ProjectWrapper />}>
                                    <Route path='/projects/:projectid/' element={<ProjectHome />} />
                                    <Route path='/projects/:projectid/reports' element={<Reports />} />
                                    <Route path='/projects/:projectid/reports/:reportid' element={<ReportViewer />} />
                                    <Route path='/projects/:projectid/settings' element={<Settings />} />
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
