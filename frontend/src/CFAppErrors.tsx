import React from "react"
import LinkButton from "./Components/LinkButton.tsx"
import { IoArrowBack } from "react-icons/io5"

const CFAppErrors = {
    403: <React.Fragment>
      You do not have access to this page.
      <br />
      <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
        fontSize: '1rem'
      }} />
    </React.Fragment>,
    404: <React.Fragment>
      Oops! Let us know when you find something because we have no idea what you are looking for!
      <br />
      <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
        fontSize: '1rem'
      }} />
    </React.Fragment>,
    500: <React.Fragment>
      Internal Server Error. Please contact the Administrator if the issue persists.
      <br />
      <LinkButton icon={<IoArrowBack />} to={'/home'} title='Go Back Home' style={{
        fontSize: '1rem'
      }} />
    </React.Fragment>,
    504: <React.Fragment>
      Unable to Connect to Server. Please try again later, or contact Administrator if the issue persists.
    </React.Fragment>,
  }

  export default CFAppErrors