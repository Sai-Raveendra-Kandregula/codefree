import os
import logging
import dotenv
import errno

DATA_PATH = os.path.join(os.path.dirname(__file__), 'sample_raw_report')

APP_NAME = "CodeFree GUI"
AUTHOR = "Sai Raveendra Kandregula"
CONTACT_EMAIL = "sairaveendrakandregula@gmail.com"

logger = logging.getLogger('uvicorn.error')

APP_DATA_PATH = "/tmp"
if os.path.exists(os.path.join(os.path.dirname(__file__), '.env')):
    dotenv.load_dotenv(dotenv_path=".env")

if os.environ.get('DATA_PATH') is not None:
    APP_DATA_PATH = os.environ['DATA_PATH']

def mkdir_p(path): # mkdir -p implementation
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise