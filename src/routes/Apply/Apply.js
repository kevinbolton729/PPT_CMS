import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Tag, Table } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import moment from 'moment';
// 组件
import DetailHandler from '@/components/Handler/DetailHandler';
// 样式
// import styles from './Channels.less';
// 常量
// import {} from '@/utils/consts';
// 方法
import { strToUpper } from '@/utils/fns';

class AllApply extends PureComponent {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '姓名（申请人）',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: text => <span>{text}</span>,
      },
      {
        title: '手机号码',
        dataIndex: 'telphone',
        key: 'telphone',
        width: 180,
        render: text => (
          <span style={{ fontSize: '16px', fontWeight: 'bold' }} className="primaryTheme">
            {text}
          </span>
        ),
      },
      {
        title: '意向城市',
        dataIndex: 'city',
        key: 'city',
        width: 150,
        render: text => <Tag>{text}</Tag>,
      },
      {
        title: '发布/更新日期',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 240,
        render: (text, record) => (
          <span>
            {`${moment(parseInt(record.updateDate, 10)).format('YYYY年MM月DD日 HH:mm:ss')}`}
          </span>
        ),
      },
      // {
      //   title: '操作',
      //   dataIndex: 'action',
      //   key: 'action',
      //   width: 180,
      //   render: () => {
      //     return <div />;
      //   },
      // },
    ];
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'apply/queryApplyLists',
    });
  }

  // Pagination
  onShowSizeChange = (current, pageSize) => {
    console.log(current, pageSize);
  };

  // filter data
  filterData = (key) => {
    if (key.indexOf('SELECTDATE') !== -1) {
      const newKey = key.slice('SELECTDATE'.length + 1);
      // console.log(newKey, 'newKey');
      this.filterSelectDate(newKey);
      return;
    }
    const newKey = key.toString().toUpperCase();
    const { dispatch, data } = this.props;
    const result = data.filter((item) => {
      return (
        strToUpper(item.name).indexOf(newKey) !== -1 ||
        strToUpper(item.telphone).indexOf(newKey) !== -1 ||
        strToUpper(item.email).indexOf(newKey) !== -1 ||
        strToUpper(item.city).indexOf(newKey) !== -1
      );
    });

    dispatch({
      type: 'apply/getApplyLists',
      payload: result,
    });
  };

  // filter date 日期
  filterSelectDate = (key) => {
    const arr = key.split(',');
    const start = moment(arr[0]).valueOf();
    const end = moment(arr[1]).valueOf();
    const { dispatch, data } = this.props;
    const result = data.filter((item) => {
      const select = parseInt(item.updateDate, 10);
      return select >= start && select <= end;
    });
    dispatch({
      type: 'apply/getApplyLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = () => {
    const { dispatch, originalData } = this.props;

    dispatch({
      type: 'apply/getApplyLists',
      payload: originalData,
    });
  };

  render() {
    const { loading, data } = this.props;
    return (
      <div>
        <PageHeaderLayout />
        <DetailHandler filterData={this.filterData} resetData={this.resetData} />
        <Divider />
        <div style={{ marginTop: '24px' }}>
          <Table
            rowKey="id"
            columns={this.columns}
            loading={loading}
            dataSource={data}
            expandedRowRender={record => [
              <p key={record.qq} style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {`QQ: ${record.qq}`}
              </p>,
              <p key={record.email} style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {`Email: ${record.email}`}
              </p>,
              <p key={record.message} style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                {`留言: ${record.message}`}
              </p>,
            ]}
            pagination={{
              size: 'small',
              showSizeChanger: true,
              defaultCurrent: 1,
              defaultPageSize: 20,
              pageSizeOptions: ['10', '20', '30', '50'],
              total: 0,
              onShowSizeChange: this.onShowSizeChange,
            }}
          />
        </div>
      </div>
    );
  }
}

export default connect(({ apply }) => ({
  loading: apply.loading,
  originalData: apply.originalData,
  data: apply.data,
}))(AllApply);
