import uvicorn
from fastapi import FastAPI

PORT=8080

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=PORT, reload=True)