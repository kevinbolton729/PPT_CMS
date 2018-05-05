import { Link } from 'dva/router';
import * as React from 'react';
import PageHeader from '../components/PageHeader';
// 声明
import { IPageHeaderLayoutProps as IProps } from './';
// 样式
const styles = require('./PageHeaderLayout.less');

export default ({ children, wrapperClassName, top, ...restProps }: IProps) => (
  <div style={{ margin: '-24px -24px 0' }} className={wrapperClassName}>
    {top}
    <PageHeader key="pageheader" {...restProps} linkElement={Link} />
    {children ? <div className={styles.content}>{children}</div> : null}
  </div>
);
