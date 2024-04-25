import datetime
from typing import List
from typing import Optional
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db_definitions.common import CodeFreeBase

class Project(CodeFreeBase):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"Project(id={self.id!r}, name={self.name!r}, slug={self.slug!r})"
    
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class Report(CodeFreeBase):
    __tablename__ = "report"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"))
    timestamp: Mapped[datetime.datetime] = mapped_column(DateTime())

    # Report Path
    report_path : Mapped[str] = mapped_column(String(200))
    report_hash : Mapped[str] = mapped_column(String(64))

    # Report Stats
    style_issues : Mapped[int] = mapped_column()

    cwe_issues : Mapped[int] = mapped_column()
    misra_issues : Mapped[int] = mapped_column()

    info_issues : Mapped[int] = mapped_column()
    minor_issues : Mapped[int] = mapped_column()
    major_issues : Mapped[int] = mapped_column()
    critical_issues : Mapped[int] = mapped_column()
    issue_files : Mapped[int] = mapped_column()

    def as_dict(self):
        return {
        "id": self.id,
        "project_id": self.project_id,
        "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f%z"),
        "style_issues": self.style_issues,
        "cwe_issues": self.cwe_issues,
        "misra_issues": self.misra_issues,
        "info_issues": self.info_issues,
        "minor_issues": self.minor_issues,
        "major_issues": self.major_issues,
        "critical_issues": self.critical_issues,
        "issue_files": self.issue_files
    }