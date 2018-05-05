/*
 * @Author: Kevin Bolton
 * @Date: 2017-12-27 12:55:09
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-05-05 20:36:30
 */
import { Icon, Spin } from 'antd';
import * as React from 'react';
// 声明
import { IProps } from './loading';

const loadingComponent = (props: IProps) => {
  // 尺寸: 可选 small(默认) default large
  // style: class 例如 {fontSize: 24}
  // type: icon样式 例如 loading
  // center: 无children，且需要居中是加上该属性
  // children: 被Loading包裹的元素 例如 <Loading><div><span>loading...</span></div></Loading>
  const { size = 'small', style = {}, type = 'loading', center = false, children } = props;
  const newStyle = Object.assign({}, { fontSize: 24 }, style);
  const newLoading = <Icon type="loading" style={newStyle} spin={true} />;

  return type === 'default' ? (
    <Spin size={size} style={newStyle}>
      {children || (center && <i />)}
    </Spin>
  ) : (
    <Spin indicator={newLoading}>{children || (center && <i />)}</Spin>
  );
};

export default loadingComponent;
