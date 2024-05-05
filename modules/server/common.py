import os
import logging
import dotenv
import errno

import base64
import io
from PIL import Image

def is_valid_base64_image(image_string):
    # checking valid base64 image string 
    try:
        image = base64.b64decode(image_string)
        img = Image.open(io.BytesIO(image))
    except Exception:
        raise Exception('file is not valid base64 image')
    # end of check base64 image string
    
    # checking image format I want to support
    if img.format.lower() in ["jpg", "jpeg", "png"]:
        
        # if you need to check image dimension
        # width, height = img.size
        # if width < 400 and height < 400:
        #     return True
        # else:
        #     raise Exception(
        #         'image size exceeded, width and height must be less than 400 pixels')
        
        return True

        # end of checking dimentions
        
    else:
        raise Exception('Image is not valid, only \'base64\' image (jpg, jpeg, png) is valid')

def mkdir_p(path): # mkdir -p implementation
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

DATA_PATH = os.path.join(os.path.dirname(__file__), 'sample_raw_report')

APP_NAME = "CodeFree GUI"
AUTHOR = "Sai Raveendra Kandregula"
CONTACT_EMAIL = "sairaveendrakandregula@gmail.com"


logger = logging.getLogger('uvicorn.error')


SERVER_URL = os.getenv('SERVER_URL', "http://localhost:8080").removesuffix("/")
ROOT_PATH = "/" + os.getenv('ROOT_PATH', "").removeprefix("/").removesuffix("/")
APP_DATA_PATH = os.getenv('CF_DATA_PATH', '/tmp').removesuffix("/")
APP_CONF_PATH = os.getenv('CF_CONF_PATH', '/tmp').removesuffix("/")
DEFAULT_USER = os.getenv('DEFAULT_USER', 'admin')
DEFAULT_USER_EMAIL = os.getenv('DEFAULT_USER_EMAIL', 'admin@example.com')
DEFAULT_PASS = os.getenv('DEFAULT_PASS', 'admin@123')
mkdir_p(APP_CONF_PATH)
APP_CONF_FILE = os.path.join(APP_CONF_PATH, "cf_config.json")
