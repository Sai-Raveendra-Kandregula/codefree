import errno
import os
from sqlalchemy.orm import DeclarativeBase

class CodeFreeBase(DeclarativeBase):
    pass

def mkdir_p(path): # mkdir -p implementation
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise exc