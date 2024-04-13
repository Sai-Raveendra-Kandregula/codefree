import uvicorn
from fastapi import FastAPI

PORT=9000

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True)