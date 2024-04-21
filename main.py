import uvicorn
import logging
import time
import os
from subprocess import Popen, PIPE
import subprocess
import dotenv
import uvicorn.logging

dotenv.load_dotenv(dotenv_path=dotenv.find_dotenv())

PORT=9000

VERSION = open("VERSION", "r").read()

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
    uvicorn_conf = uvicorn.Config(app="modules.server.server:app", host="0.0.0.0", port=PORT, reload=dev_env)

    server = uvicorn.Server(config=uvicorn_conf)

    logger = logging.getLogger('uvicorn.error')

    # Detect Docker Environment
    if docker_env:
        # If Production Environment
        if not dev_env:
            logger.info(f"CodeFree v{VERSION}")

            # Build Frontend
            logger.info("Building Web App...")
            process = Popen(['/usr/bin/yarn', '--cwd', '/codefree/frontend', 'build'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
            stdout, stderr = process.communicate()
            if(process.returncode == 0):
                logger.info('Web App Built Successfully.')
            else:
                logger.error(f'Web App Build Failed : ${stderr}')
                exit(1)

            # Copy /etc/apache2/ports.conf.prod to /etc/apache2/ports.conf and enable frontend static server
            logger.info("Configuring Apache...")
            copy_ports_rc = os.system("cp /etc/apache2/ports.conf.prod /etc/apache2/ports.conf")
            process = Popen(['/bin/bash', '-c', 'a2ensite 001-frontend.conf'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
            process.communicate()
            if (copy_ports_rc == 0 and process.returncode == 0):
                logger.info("Done.")
            else:
                logger.error("Error Configuring Apache.")
                exit(1)

        else:
            logger.info(f"CodeFree v{VERSION} - Development Build")

            # Start Frontend Dev Server
            logger.info("Starting Web App Server...")
            
            process = Popen(['/usr/bin/yarn', '--cwd', '/codefree/frontend', 'start'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
            
            # Wait for 2 Seconds for Dev Server to start
            time.sleep(2) 

            if(check_pid(process.pid)):
                logger.info('Web App Server now Up.')
            else:
                stdout, stderr = process.communicate()
                logger.error(f'Web App Server startup failed :')
                logger.error(stderr)
                exit(1)

            # Copy /etc/apache2/ports.conf.dev to /etc/apache2/ports.conf
            logger.info("Configuring Apache...")
            if (os.system("cp /etc/apache2/ports.conf.dev /etc/apache2/ports.conf") == 0):
                logger.info("Done.")
            else:
                logger.error("Error Configuring Apache.")
                exit(1)
        
        # Start Apache Proxy
        logger.info("Launching Apache Web Server...")
        process = Popen(['service', 'apache2', 'start'], stdout=PIPE, stderr=PIPE, encoding='utf-8')
        stdout, stderr = process.communicate()
        if(process.returncode == 0):
            logger.info('Apache now listening on 0.0.0.0:8080')
        else:
            logger.error(f'Apache Launch Failed : ${stderr}')
            exit(1)

    
    # uvicorn.run("modules.server.server:app", host="0.0.0.0", port=PORT, reload=dev_env)
    server.run()