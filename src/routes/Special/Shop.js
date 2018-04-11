import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Divider, Button, Row, Col, Table, Form, Input, InputNumber, Upload, Icon } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import moment from 'moment';
// 组件
import { openModal, openConfirm } from '@/components/Modal';
import DetailHandler from '@/components/Handler/DetailHandler';
// 样式
// import styles from './Channels.less';
// 常量
import {
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
import { strToUpper, beforeUpload } from '@/utils/fns';

const FormItem = Form.Item;
const { TextArea } = Input;

class AllShop extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    this.handleStatus = 0; // 0:添加 1:编辑

    // 列表项数据
    this.recordData = {};

    this.columns = [
      {
        title: '店铺名称',
        dataIndex: 'name',
        key: 'name',
        render: text => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{text}</span>,
      },
      {
        title: '详细描述',
        dataIndex: 'description',
        key: 'description',
        render: text => <span>{text}</span>,
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
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 180,
        render: (text, record) => {
          return (
            <div>
              <Button onClick={this.handlerEdit.bind(this, record)}>编辑</Button>
              <Divider type="vertical" />
              <Button
                onClick={this.handlerDelete.bind(this, record.shopid)}
                style={{ marginTop: '12px' }}
                type="primary"
              >
                删除
              </Button>
            </div>
          );
        },
      },
    ];
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'shop/queryShopLists',
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
    const { dispatch, data } = this.props;
    const result = data.filter((item) => {
      return (
        strToUpper(item.name).indexOf(newKey) !== -1 ||
        strToUpper(item.description).indexOf(newKey) !== -1 ||
        strToUpper(item.address).indexOf(newKey) !== -1 ||
        strToUpper(item.tel).indexOf(newKey) !== -1
      );
    });

    dispatch({
      type: 'shop/getShopLists',
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
      type: 'shop/getShopLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = () => {
    const { dispatch, originalData } = this.props;

    dispatch({
      type: 'shop/getShopLists',
      payload: originalData,
    });
  };
  // 操作
  // 添加
  handlerAdd = () => {
    console.log('添加');
    this.handleStatus = 0;
    this.recordData = {};
    this.props.dispatch({
      type: 'shop/changeUpLoadImage',
      payload: '',
    });
    this.showModal();
  };
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    this.handleStatus = 1;
    this.recordData = { ...record };
    this.showModal();
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
    console.log(record, 'doDelete');
    const { dispatch } = this.props;

    dispatch({
      type: 'shop/delShop',
      payload: record,
    });
  };
  // submit
  handleSubmit = (event) => {
    console.log('保存');
    event.preventDefault();
    const { confirmLoading, form } = this.props;

    if (!confirmLoading) {
      form.validateFields({ force: true }, (err, values) => {
        const { dispatch, uploadImage } = this.props;
        // console.log(values, 'values');
        if (!err) {
          // 传递给api
          const passApiFormData = {
            name: values.name,
            description: values.description,
            url: uploadImage || this.recordData.url,
            tel: values.tel,
            address: values.address,
            traffic: values.traffic,
            weight: values.weight,
          };

          if (!this.handleStatus) {
            // console.log(passApiFormData, 'passApiFormData');
            // 添加店铺
            dispatch({
              type: 'shop/addShop',
              payload: passApiFormData,
            });
          } else {
            passApiFormData.shopid = this.recordData.shopid;
            // console.log(passApiFormData, 'passApiFormData');
            // 编辑店铺
            dispatch({
              type: 'shop/editShop',
              payload: passApiFormData,
            });
          }

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'shop/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'shop/changeConfirmLoading',
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
    this.props.form.resetFields(['name', 'description', 'tel', 'address', 'traffic', 'weight']);
  };
  // show Modal
  showModal = () => {
    this.setState({ visible: true });
    this.props.dispatch({
      type: 'shop/changeUpLoadImage',
      payload: '',
    });
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // 自定义上传 店铺
  uploadShop = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'shop/uploadShop',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'shop/changeUpLoading',
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
            <Col span={24}>
              <FormItem label="店铺图片">
                {getFieldDecorator('shopImage')(
                  <Upload
                    name="shopImage"
                    showUploadList={false}
                    action={`${API_DOMAIN}/api/server/upload/shopimages`}
                    beforeUpload={beforeUpload}
                    customRequest={this.uploadShop}
                  >
                    <Button>
                      <Icon type={uploading && uploading === 'loading' ? 'loading' : 'plus'} />{' '}
                      {uploading ? (
                        uploading === 'loading' ? (
                          '上传中...'
                        ) : (
                          <span className="uploadSuccess">上传成功</span>
                        )
                      ) : (
                        '更新/上传店铺图片'
                      )}
                    </Button>
                  </Upload>
                )}
                {(uploadImage || this.recordData.url) && (
                  <img
                    src={`${URL_PREFIX}${uploadImage || this.recordData.url}`}
                    style={{ maxWidth: '100%', marginTop: '6px', display: 'block' }}
                    alt="店铺图片"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label="店铺">
                {getFieldDecorator('name', {
                  initialValue: this.recordData.name || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写店铺名称！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="联系电话">
                {getFieldDecorator('tel', {
                  initialValue: this.recordData.tel || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写联系电话！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="权重(值越小越靠前)">
                {getFieldDecorator('weight', {
                  initialValue: this.recordData.weight || 0,
                  rules: [
                    {
                      required: true,
                      message: '请填写排序权重！',
                    },
                  ],
                })(<InputNumber size="large" style={{ width: '100%' }} min={0} step={1} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label="店铺地址">
                {getFieldDecorator('address', {
                  initialValue: this.recordData.address || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写店铺详细地址！',
                    },
                  ],
                })(<TextArea size="large" rows={4} style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="周边交通">
                {getFieldDecorator('traffic', {
                  initialValue: this.recordData.traffic || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写店铺周边交通！',
                    },
                  ],
                })(<TextArea size="large" rows={4} style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem label="详细描述">
                {getFieldDecorator('description', {
                  initialValue: this.recordData.description || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写店铺详细描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">添加/编辑</span>
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
        <div>
          <Button style={{ float: 'right' }} type="primary" size="large" onClick={this.handlerAdd}>
            添加新店铺
          </Button>
        </div>
        <div style={{ marginTop: '88px' }}>
          <Table
            rowKey="shopid"
            columns={this.columns}
            loading={loading}
            dataSource={data}
            expandedRowRender={record => [
              <p key={record.tel} style={{ margin: 0 }}>{`联系电话: ${record.tel}`}</p>,
              <p key={record.address} style={{ margin: 0 }}>{`店铺地址: ${record.address}`}</p>,
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

export default connect(({ shop }) => ({
  loading: shop.loading,
  confirmLoading: shop.confirmLoading,
  originalData: shop.originalData,
  data: shop.data,
  uploading: shop.uploading,
  uploadImage: shop.uploadImage,
}))(Form.create()(AllShop));
