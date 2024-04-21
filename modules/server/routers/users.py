from uuid import UUID, uuid4
from fastapi import APIRouter, Response, Depends

from modules.server.SessionAuthenticator import authenticate_user, verifier, cookie, backend
from modules.server.definitions import UserData, SessionData

usersRouter = APIRouter()

@usersRouter.post("/user/sign-in")
async def create_session(userdata : UserData, response: Response):
    if authenticate_user(userdata) == False:
        response.status_code = 401
        return {
            "message" : "Invalid Username/Password"
        }
    session = uuid4()
    sessiondata = SessionData(username=userdata.username)

    await backend.create(session, sessiondata)
    if not userdata.keepSignedIn:
        cookie.cookie_params.max_age = (24 * 3600) # One day if user does not want to stay signed in
    else:
        cookie.cookie_params.max_age = (399 * 24 * 3600) # If user wants to stay signed in, set maximum max-age (400 days)
    cookie.attach_to_response(response, session)

    return {
        "message" : f"{userdata.username} signed in successfully!"
    }

@usersRouter.get("/user/validate", dependencies=[Depends(cookie)])
async def whoami(session_data: SessionData = Depends(verifier)):
    return session_data

@usersRouter.post("/user/sign-out")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    if (await backend.read(session_id=session_id) is not None):
        await backend.delete(session_id)
    cookie.delete_from_response(response)
    return {
        "message" : f"User Signed Out"
    }