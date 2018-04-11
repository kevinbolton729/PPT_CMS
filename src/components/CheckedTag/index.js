import React, { PureComponent } from 'react';
import { Tag } from 'antd';

const { CheckableTag } = Tag;

class CheckedTag extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }

  handleChange = (checked) => {
    this.setState({ checked });
  };
  render() {
    return (
      <CheckableTag {...this.props} checked={this.state.checked} onChange={this.handleChange} />
    );
  }
}

export default CheckedTag;
