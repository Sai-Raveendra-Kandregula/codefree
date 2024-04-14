import uvicorn
import logging

PORT=9000

if __name__ == "__main__":
    logging.basicConfig(format="%(levelname)-9s : %(message)s", level=logging.NOTSET)

    # Disable Uvicorn Logging
    logging.getLogger("uvicorn.error").handlers = []
    logging.getLogger("uvicorn.error").propagate = False

    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.access").propagate = False

    logging.getLogger("uvicorn.asgi").handlers = []
    logging.getLogger("uvicorn.asgi").propagate = True
    
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True)