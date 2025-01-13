import datetime
import json
import os
import logging
from typing import List, Self
from typing import Optional
import randomcolor
from sqlalchemy import String, ForeignKey, DateTime, Text
import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.exc import NoResultFound

from .common import CodeFreeBase, mkdir_p

class Project(CodeFreeBase):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    avatar_color: Mapped[str] = mapped_column(String(7))
    git_remote_url: Mapped[Optional[str]] = mapped_column(String(50))
    git_remote_commit_url: Mapped[Optional[str]] = mapped_column(String(50))

    def __repr__(self) -> str:
        return f"Project(id={self.id!r}, name={self.name!r}, slug={self.slug!r})"

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def get(session: Session, id: int):
        project : Project = session.query(Project).where(Project.id.is_(id)).scalar()
        return project
    
    @staticmethod
    def get_project_by_slug(session: Session, slug: str):
        return session.query(Project).filter(Project.slug == slug).first()
    
    @staticmethod
    def generateAvatarColor():
        rand_color = randomcolor.RandomColor()
        return rand_color.generate(luminosity="dark")[0]
    
    @staticmethod
    def createTestProject(db_session : Session):
        result = db_session.query(Project).where(Project.slug.is_("logger")).scalar()
        if result == None:
            project_id = db_session.query(func.coalesce(func.max(Project.id), 0)).scalar() + 1
            db_session.add(
                Project(
                    id=project_id,
                    name="Logger",
                    slug="logger",
                    avatar_color=Project.generateAvatarColor(),
                    git_remote_url="https://github.com/Sai-Raveendra-Kandregula/logger",
                    git_remote_commit_url="https://github.com/Sai-Raveendra-Kandregula/logger/commit",
                )
            )
            db_session.commit()
    
    def getReportsPath(self, data_path : str):
        path = os.path.join(data_path, self.slug, "reports")
        mkdir_p(path=path)
        return path

class Report(CodeFreeBase):
    __tablename__ = "report"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"))
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime())

    # Report Path
    report_path: Mapped[str] = mapped_column(String(200))
    report_hash: Mapped[str] = mapped_column(String(64))
    report_src: Mapped[str] = mapped_column(String(30))
    report_src_usr: Mapped[str] = mapped_column(String(30))

    # Report Stats
    cf_code_quality_score: Mapped[float] = mapped_column(
        sa.Float(6), default=0.0, server_default=sa.text("0.0"), nullable=False
    )

    style_issues: Mapped[int] = mapped_column()

    cwe_issues: Mapped[int] = mapped_column()
    misra_issues: Mapped[int] = mapped_column()

    info_issues: Mapped[int] = mapped_column()
    minor_issues: Mapped[int] = mapped_column()
    major_issues: Mapped[int] = mapped_column()
    critical_issues: Mapped[int] = mapped_column()
    issue_files: Mapped[int] = mapped_column()

    commit_info: Mapped[Optional[str]] = mapped_column(String(255))  # stringified JSON

    def as_dict(self):
        out = {
            "id": self.id,
            "project_id": self.project_id,
            "timestamp": self.timestamp.timestamp() * 1000,
            "report_src": self.report_src,
            "report_src_usr": self.report_src_usr,
            "cf_code_quality_score": self.cf_code_quality_score,
            "style_issues": self.style_issues,
            "cwe_issues": self.cwe_issues,
            "misra_issues": self.misra_issues,
            "info_issues": self.info_issues,
            "minor_issues": self.minor_issues,
            "major_issues": self.major_issues,
            "critical_issues": self.critical_issues,
            "issue_files": self.issue_files,
        }

        if self.commit_info is not None:
            out["commit_info"] = (json.loads(self.commit_info),)

        return out

    def get_report_count(session: Session, project_id: int):
        reports_all_query = session.query(Report).where(
            Report.project_id.is_(project_id)
        )
        reports_all_query_out = reports_all_query.all()
        count = 0
        if reports_all_query_out is not None:
            count = len(reports_all_query_out)
        session.close()
        return count
    
    def get(session : Session, project_id : int, report_id : str):
        if report_id.lower() == "last-report":
            try:
                report_id : int = session.query(func.max(Report.id)).scalar()
            except NoResultFound:
                return None
        else:
            report_id = int(report_id)

        report_data: Report = (
            session.query(Report)
            .where(Report.project_id.is_(project_id))
            .where(Report.id.is_(report_id))
            .scalar()
        )

        return report_data
    
    @staticmethod
    def getHash(report : dict):
        import hashlib
        return hashlib.sha256(json.dumps(report, indent=0).encode("utf-8")).hexdigest()
    
    @staticmethod
    def getReportStats(report: dict):
        from ...cf_checker import (
            CheckerOutput, CheckingModule, 
            CheckerStats, CheckerTypes, 
            ComplianceStandards, CheckerSeverity
        )
        issue_items_cls = [CheckerOutput(dict_data=item) for item in report["data"]]
        CheckingModule.set_output(issue_items_cls)
        CheckerStats.calculateStats()

        files_Set = set()
        cf_code_quality_score = (
            CheckerStats.get_aggregate_score() / CheckerStats.get_score_normalization()
        )
        style_count = 0
        info_count = 0
        minor_count = 0
        major_count = 0
        critical_count = 0

        cwe_count = 0
        misra_count = 0

        for item in issue_items_cls:
            files_Set.add(item.file_name)
            if item._module.module_type == CheckerTypes.STYLE:
                style_count += 1
            elif item._module.module_type == CheckerTypes.CODE:
                if item._module.compliance_standard == ComplianceStandards.CWE:
                    cwe_count += 1
                elif item._module.compliance_standard == ComplianceStandards.MISRA:
                    misra_count += 1

                if item.error_info.severity == CheckerSeverity.CRITICAL:
                    critical_count += 1
                elif item.error_info.severity == CheckerSeverity.MAJOR:
                    major_count += 1
                elif item.error_info.severity == CheckerSeverity.MINOR:
                    minor_count += 1
                elif item.error_info.severity == CheckerSeverity.INFO:
                    info_count += 1

        return {
            "file_count": len(files_Set),
            "cf_code_quality_score": cf_code_quality_score,
            "cwe_count": cwe_count,
            "misra_count": misra_count,
            "style_count": style_count,
            "info_count": info_count,
            "minor_count": minor_count,
            "major_count": major_count,
            "critical_count": critical_count,
        }
    
    def getReportPath(self, project : Project, data_path : str):
        path = os.path.join(project.getReportsPath(data_path=data_path), self.report_path)
        if os.path.exists(path):
            return path
        return None
    
    def getReportData(self, session : Session, project : Project, data_path : str):
        path = self.getReportPath(project=project, data_path=data_path)
        if path is not None:
            with open(path, 'r') as fp:
                return json.load(fp)
        session.delete(self)
        session.commit()
        return None
