import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Button, Row, Col, Table, Form, Upload, Icon, Input, Checkbox } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import moment from 'moment';
// 组件
import { openModal, openConfirm } from '@/components/Modal';
import DetailHandler from '@/components/Handler/DetailHandler';
// 样式
// import styles from './Channels.less';
// 常量
import {
  LINK_SHOP_ID,
  API_DOMAIN,
  URL_PREFIX,
  BTN_SAVE,
  BTN_CANCEL,
  BTN_RESET,
  MODEL_DEL_TITLE,
  MODEL_DEL_DESCRIPTION,
  MODEL_DEL_BTN_OK,
  MODEL_ADDEDIT_TITLE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_WIDTH_EDIT,
} from '@/utils/consts';
// 方法
import { strToUpper, getMapTypeName, getMapStrName, beforeUpload } from '@/utils/fns';

const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;

class SetChannel extends PureComponent {
  constructor(props) {
    super(props);
    const { sitetypes } = props;

    this.state = {
      visible: false,
    };

    this.handleStatus = 0; // 0:添加 1:编辑

    // 列表项数据
    this.recordData = {};

    // 传入Modal的site data
    this.passSites = props.sitetypes.map(item => ({
      label: item.name,
      value: item.siteid,
    }));

    this.columns = [
      {
        title: '栏目名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: text => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{text}</span>,
      },
      {
        title: '栏目介绍',
        dataIndex: 'text',
        key: 'text',
        width: 300,
        render: text => <span style={{ color: '#999' }}>{text}</span>,
      },
      {
        title: '所属站点',
        dataIndex: 'siteid',
        key: 'siteid',
        render: text => getMapTypeName(text.split(','), sitetypes),
      },
      {
        title: '更新日期',
        dataIndex: 'updateDate',
        key: 'updateDate',
        width: 300,
        render: (text, record) => (
          <span>
            {`${moment(parseInt(record.updateDate, 10)).format('YYYY年MM月DD日 HH:mm:ss')}`}
          </span>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 220,
        render: (text, record) => {
          return (
            <div>
              <Button onClick={this.handlerEdit.bind(this, record)}>编辑</Button>
              {(record.channelid === '5a9f87cdd2467c1d20c8ca64' ||
                record.channelid === '5a9f87e1d2467c1d20c8ca65') && (
                <div style={{ display: 'inline' }}>
                  <Divider type="vertical" />
                  <Button
                    onClick={this.handlerSelect.bind(this, record.channelid)}
                    style={{ marginTop: '12px' }}
                    type="primary"
                  >
                    进入栏目
                  </Button>
                </div>
              )}
              {/* <Divider type="vertical" />
              <Button
                onClick={this.handlerDelete.bind(this, record.channelid)}
                style={{ marginTop: '12px' }}
                type="primary"
              >
                删除
              </Button> */}
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'channel/queryChanneLists',
    });
  }
  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();
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
    const { dispatch, data, sitetypes } = this.props;
    const result = data.filter((item) => {
      const arrs = getMapStrName(item.siteid.split(','), sitetypes);
      return (
        arrs.some(arr => strToUpper(arr).indexOf(newKey) !== -1) ||
        strToUpper(item.name).indexOf(newKey) !== -1
      );
    });

    dispatch({
      type: 'channel/getChanneLists',
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
      type: 'channel/getChanneLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = () => {
    const { dispatch, originalData } = this.props;

    dispatch({
      type: 'channel/getChanneLists',
      payload: originalData,
    });
  };
  // 操作
  // 添加
  handlerAdd = () => {
    console.log('添加');
    this.handleStatus = 0;
    this.recordData = {};
    this.showModal();
  };
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    this.handleStatus = 1;
    this.recordData = { ...record };
    this.showModal();
  };
  // 选择进入
  handlerSelect = (channelid = null) => {
    if (!channelid) return;
    // console.log(channelid, 'channelid');
    const { dispatch } = this.props;
    const filterKey = {
      '5a9f87cdd2467c1d20c8ca64': 'article',
      '5a9f87e1d2467c1d20c8ca65': 'product',
    };
    dispatch({
      type: 'global/goto',
      payload: { url: '/cms/articles', key: filterKey[channelid] },
    });
  };
  // 删除
  handlerDelete = (record = {}) => {
    openConfirm({
      title: MODEL_DEL_TITLE,
      content: MODEL_DEL_DESCRIPTION,
      okText: MODEL_DEL_BTN_OK,
      cancelText: BTN_CANCEL,
      okType: 'primary',
      onOk: this.doDelete.bind(this, record),
    });
  };
  // 执行删除
  doDelete = (record = {}) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'channel/delChannel',
      payload: record,
    });
  };
  // submit
  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err, values) => {
        const { dispatch, uploadImage } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // console.log(values.setHref, 'values.setHref');
          // return;
          // 传递给api
          const passApiFormData = {
            name: values.name,
            text: values.subtitle,
            thumb: uploadImage || '',
            siteid: values.site.join(','),
            href: values.href,
            setHref: parseInt(
              values.setHref && values.setHref.length
                ? values.setHref[values.setHref.length - 1]
                : 0,
              10
            ),
          };
          if (!this.handleStatus) {
            // console.log(passApiFormData, 'passApiFormData');
            // 添加栏目
            dispatch({
              type: 'channel/addChannel',
              payload: passApiFormData,
            });
          } else {
            passApiFormData.channelid = this.recordData.channelid;
            // console.log(passApiFormData, 'passApiFormData');
            // 编辑栏目
            dispatch({
              type: 'channel/editChannel',
              payload: passApiFormData,
            });
          }

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'channel/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'channel/changeConfirmLoading',
              payload: false,
            });
          }, 1500);
        }
      });
    }
  };
  // 重置
  handleReset = () => {
    console.log('重置');
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'channel/changeUpLoadImage',
      payload: '',
    });
  };
  // show Modal
  showModal = () => {
    this.setState({ visible: true });
    this.props.dispatch({
      type: 'channel/changeUpLoadImage',
      payload: '',
    });
    // console.log(this.handleStatus, 'handleStatus');
    console.log(this.recordData, 'recordData');
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // 自定义上传 栏目
  uploadChannel = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'channel/uploadChannel',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'channel/changeUpLoading',
        payload: false,
      });
    }
  };

  render() {
    const { loading, confirmLoading, data, form, uploading, uploadImage } = this.props;
    const { getFieldDecorator } = form;
    const { visible } = this.state;
    const passChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            {this.recordData.channelid !== LINK_SHOP_ID && (
              <Col span={24}>
                <FormItem label="栏目图片">
                  {getFieldDecorator('channelImage')(
                    <Upload
                      name="channelImage"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/channelimages`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadChannel}
                    >
                      <Button disabled={uploading !== false}>
                        <Icon type={uploading && uploading === 'loading' ? 'loading' : 'plus'} />{' '}
                        {uploading ? (
                          uploading === 'loading' ? (
                            '上传中...'
                          ) : (
                            <span className="uploadSuccess">
                              {uploading === 'error' ? '上传失败' : '上传成功'}
                            </span>
                          )
                        ) : (
                          '更新/上传栏目图片'
                        )}
                      </Button>
                    </Upload>
                  )}
                  {(uploadImage || this.recordData.thumb) && (
                    <img
                      src={`${URL_PREFIX}${uploadImage || this.recordData.thumb}`}
                      style={{ maxWidth: '100%', marginTop: '6px', display: 'block' }}
                      alt="栏目图片"
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={24}>
              <FormItem label="标题">
                {getFieldDecorator('name', {
                  initialValue: this.recordData.name || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写栏目标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="简介">
                {getFieldDecorator('subtitle', {
                  initialValue: this.recordData.text || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写栏目简介！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </FormItem>
            </Col>
          </Row>
          {this.recordData.channelid === LINK_SHOP_ID && (
            <Row>
              <Col span={18}>
                <FormItem label="访问地址">
                  {getFieldDecorator('href', {
                    initialValue: this.recordData.href || '',
                    rules: this.recordData.channelid === LINK_SHOP_ID && [
                      {
                        required: true,
                        message: '请填写访问地址！',
                      },
                    ],
                  })(<Input addonBefore="Http://" size="large" style={{ width: '96%' }} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label="启用地址">
                  {getFieldDecorator('setHref', {
                    initialValue: ['1'],
                    rules: this.recordData.channelid === LINK_SHOP_ID && [
                      {
                        required: true,
                        message: '请选择是否启用！',
                      },
                    ],
                  })(<CheckboxGroup disabled options={[{ label: '是否启用', value: '1' }]} />)}
                </FormItem>
              </Col>
            </Row>
          )}
          <Row>
            <Col span={24}>
              <FormItem label="发布至">
                {getFieldDecorator('site', {
                  initialValue: this.recordData.siteid
                    ? this.recordData.siteid.split(',')
                    : ['59607e3c682e090ca074ecfd'],
                  rules: [
                    {
                      required: true,
                      message: '请选择将发布至的站点！',
                    },
                  ],
                })(<CheckboxGroup disabled options={this.passSites} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">编辑栏目</span>
              </Divider>
              <Button onClick={this.handleReset}>{BTN_RESET}</Button>
              <Divider type="vertical" />
              <Button loading={confirmLoading} type="primary" htmlType="submit">
                {BTN_SAVE}
              </Button>
            </div>
          </FormItem>
        </Form>
      </div>
    );

    return (
      <div>
        {openModal.apply(this, [
          {
            title: MODEL_ADDEDIT_TITLE,
            width: MODEL_WIDTH_EDIT,
            content: MODEL_ADDEDIT_DESCRIPTION,
            children: passChildren,
            visible,
            closable: true,
            confirmLoading,
            footer: null,
          },
        ])}
        <PageHeaderLayout />
        <DetailHandler filterData={this.filterData} resetData={this.resetData} />
        <Divider />
        {/* <div>
          <Button style={{ float: 'right' }} type="primary" size="large" onClick={this.handlerAdd}>
            添加新栏目
          </Button>
        </div> */}
        {/* 显示【添加新栏目】按钮时，请设置 { marginTop: '88px' } */}
        <div style={{ marginTop: '24px' }}>
          <Table
            rowKey="channelid"
            columns={this.columns}
            loading={loading}
            dataSource={data}
            // expandedRowRender={record => <p style={{ margin: 0 }}>{`栏目简介: ${record.text}`}</p>}
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

export default connect(({ global, channel }) => ({
  currentSiteid: global.currentSiteid,
  sitetypes: global.sitetypes,
  loading: channel.loading,
  uploading: channel.uploading,
  uploadImage: channel.uploadImage,
  confirmLoading: channel.confirmLoading,
  originalData: channel.originalData,
  data: channel.data,
}))(Form.create()(SetChannel));
