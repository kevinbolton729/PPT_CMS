import React, { PureComponent } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Row, Col, Avatar, Card, Button } from 'antd';
// 组件
import PageHeaderLayout from '@/layouts/PageHeaderLayout';

// 常量 API_DOMAIN
import { URL_PREFIX, ROLE_NAME } from '@/utils/consts';

import styles from './WorkSpace.less';

class WorkSpace extends PureComponent {
  static contextTypes = {
    currentUser: PropTypes.object,
  };

  componentWillMount() {
    this.props.dispatch({
      type: 'workspace/queryLists',
    });
  }

  getShowDate = () => {
    const now = moment();
    const hour = now.hour();
    const formats = ['凌晨', '早上', '中午', '下午', '晚上'];
    let i = 0;

    if (hour >= 7 && hour <= 11) {
      i = 1;
    }
    if (hour >= 12 && hour <= 13) {
      i = 2;
    }
    if (hour >= 14 && hour <= 18) {
      i = 3;
    }
    if (hour >= 19 && hour <= 23) {
      i = 4;
    }

    return `${formats[i]}好`;
  };

  // 下载
  handleDownload = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'workspace/downloadFile',
      payload: { id: '5acc984e682e0945e8c6057a' },
    });
  };

  render() {
    const { currentUser } = this.context;
    const { lists, loading } = this.props;
    const { siteNums, articleNums, articleTodayNums } = lists;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar
            size="large"
            src={currentUser.portrait && `${URL_PREFIX}${currentUser.portrait}`}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>
            {`${this.getShowDate()}！${currentUser.nickname}，祝您开心每一天！`}
          </div>
          <div>{ROLE_NAME}</div>
          {/* <a download href={`${API_DOMAIN}/api/server/download/5acc984e682e0945e8c6057a`}>
            <Button type="primary" icon="download">
              点击下载
            </Button>
          </a> */}
          <Button type="primary" icon="download" onClick={this.handleDownload}>
            点击下载
          </Button>
        </div>
      </div>
    );

    return (
      <div>
        <PageHeaderLayout content={pageHeaderContent} />
        <div style={{ marginTop: '24px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Card loading={loading} className={styles.card}>
                <p className={styles.siteTotal}>{siteNums}</p>
                <p>全部站点数(个)</p>
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Card loading={loading} className={styles.card}>
                <p className={styles.articleTodayTotal}>{articleTodayNums}</p>
                <p>今日发布文章数(篇)</p>
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8} lg={8} xl={8}>
              <Card loading={loading} className={styles.card}>
                <p className={styles.articleTotal}>{articleNums}</p>
                <p>所有文章数(篇)</p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default connect(({ workspace }) => ({
  loading: workspace.loading,
  lists: workspace.lists,
}))(WorkSpace);
