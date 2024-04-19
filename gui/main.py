import uvicorn
import logging
import time
import os
from subprocess import Popen, PIPE
import subprocess
import dotenv

dotenv.load_dotenv(dotenv_path=dotenv.find_dotenv())

PORT=9000

docker_env=os.getenv('IN_DOCKER', False)
dev_env=(os.getenv('ENVIRONMENT', 'PROD') != 'PROD')

def check_pid(pid):
    """ Check For the existence of a unix pid. """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

if __name__ == "__main__":


    logging.basicConfig(format="%(levelname)-9s : %(message)s", level=logging.NOTSET if dev_env else logging.INFO)

    # Disable Uvicorn Logging
    logging.getLogger("uvicorn.error").handlers = []
    logging.getLogger("uvicorn.error").propagate = False

    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.access").propagate = False

    logging.getLogger("uvicorn.asgi").handlers = []
    logging.getLogger("uvicorn.asgi").propagate = True
    
    # Detect Docker Environment
    if docker_env:
        # If Production Environment
        if not dev_env:
            logging.info("CodeFree - Production Mode")

            # Build Frontend
            logging.info("Building Web App...")
            process = Popen(['/usr/bin/yarn', '--cwd', '/codefree/gui/frontend', 'build'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
            stdout, stderr = process.communicate()
            if(process.returncode == 0):
                logging.debug(stdout)
                logging.info('Web App Built Successfully.')
            else:
                logging.error(f'Web App Build Failed : ${stderr}')
                exit(1)

            # Copy /etc/apache2/ports.conf.prod to /etc/apache2/ports.conf and enable frontend static server
            logging.info("Configuring Apache...")
            if (os.system("cp /etc/apache2/ports.conf.prod /etc/apache2/ports.conf") == 0 and
                os.system("a2ensite 001-frontend.conf") == 0):
                logging.info("Done.")
            else:
                logging.error("Error Configuring Apache.")
                exit(1)

        else:
            logging.info("CodeFree - Development Mode")

            # Start Frontend Dev Server
            logging.info("Starting Web App Dev Server...")
            
            # pid = os.spawnv(os.P_NOWAIT, "/bin/bash", ["-c \"yarn --cwd /codefree/gui/frontend start\""])
            process = Popen(['/usr/bin/yarn', '--cwd', '/codefree/gui/frontend', 'start'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
            
            # Wait for 2 Seconds for Dev Server to start
            time.sleep(2) 

            if(check_pid(process.pid)):
                logging.info('Web App Dev Server now Up.')
            else:
                # stdout, stderr = process.communicate()
                # logging.error(f'Web App Dev Server launch failed : ${stderr}')
                logging.error(f'Web App Dev Server launch failed')
                exit(1)

            # Copy /etc/apache2/ports.conf.dev to /etc/apache2/ports.conf
            logging.info("Configuring Apache...")
            if (os.system("cp /etc/apache2/ports.conf.dev /etc/apache2/ports.conf") == 0):
                logging.info("Done.")
            else:
                logging.error("Error Configuring Apache.")
                exit(1)
        
        # Start Apache Proxy
        logging.info("Launching Apache Web Server...")
        process = Popen(['service', 'apache2', 'start'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
        stdout, stderr = process.communicate()
        if(process.returncode == 0):
            logging.debug(stdout)
            logging.info('Apache now listening on 0.0.0.0:8080')
        else:
            logging.error(f'Apache Launch Failed : ${stderr}')
            exit(1)

    
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=dev_env)