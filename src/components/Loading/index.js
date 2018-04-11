/*
 * @Author: Kevin Bolton
 * @Date: 2017-12-27 12:55:09
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2017-12-27 14:32:52
 */
import React from 'react';
import { Icon, Spin } from 'antd';

const Loading = (props) => {
  // 尺寸: 可选 small(默认) default large
  // style: class 例如 {fontSize: 24}
  // type: icon样式 例如 loading
  // center: 无children，且需要居中是加上该属性
  // children: 被Loading包裹的元素 例如 <Loading><div><span>loading...</span></div></Loading>
  const {
    size = 'small', style = {}, type = 'loading', center = false, children,
  } = props;
  const newStyle = Object.assign({}, { fontSize: 24 }, style);
  const newLoading = <Icon type="loading" style={newStyle} spin />;

  return type === 'default' ? (
    <Spin size={size} style={newStyle}>
      {children || (center && <i />)}
    </Spin>
  ) : (
    <Spin indicator={newLoading}>{children || (center && <i />)}</Spin>
  );
};

export default Loading;
