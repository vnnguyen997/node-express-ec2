import React from 'react'

class CustomBtn extends React.Component {
    handleClick = () => {
      console.log('Button clicked!');
    }
  
    render() {
      return (
        <div>
          <button onClick={this.handleClick}>{this.props.label}</button>
        </div>
      );
    }
  }

export default CustomBtn