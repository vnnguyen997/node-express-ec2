import React from 'react'
import CustomBtn from '../CustomBtn'

function NavBar() {
    return (
        <nav style={{ display: 'flex' }}>
          <CustomBtn label="About" className="nav-link" />
          <CustomBtn label="Store" className="nav-link" />
          <CustomBtn label="Search" className="nav-link" />
          <CustomBtn label="Account" className="nav-link" />
        </nav>
      );
}

export default NavBar