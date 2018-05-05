import { Button, Col, Divider, Form, Icon, Input, InputNumber, Row, Table, Upload } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import * as React from 'react';
// 组件
import BreadCrumb from '../../components/BreadCrumb';
import DetailHandler from '../../components/Handler/DetailHandler';
import { openConfirm, openModal } from '../../components/Modal';
// 常量
import {
  API_DOMAIN,
  BTN_CANCEL,
  BTN_RESET,
  BTN_SAVE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_ADDEDIT_TITLE,
  MODEL_DEL_BTN_OK,
  MODEL_DEL_DESCRIPTION,
  MODEL_DEL_TITLE,
  MODEL_WIDTH_EDIT,
  URL_PREFIX,
} from '../../utils/consts';
// 方法
import { beforeUpload, strToUpper } from '../../utils/fns';
// 声明
import { IBrandProps as IProps, IBrandStates as IStates } from './';

// 样式
// const styles = require('./Channels.less');
const { TextArea }: any = Input;

let handleStatus = 0; // 0:添加 1:编辑
// 表格 列表项 数据
let recordData: any = {};
// 表格 列表项
const columns = (fn: any) => [
  {
    title: '品牌',
    dataIndex: 'title',
    key: 'title',
    render: (text: any) => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{text}</span>,
  },
  // {
  //   title: '详细描述',
  //   dataIndex: 'description',
  //   key: 'description',
  //   render: text => <span>{text}</span>,
  // },
  {
    title: '发布/更新日期',
    dataIndex: 'updateDate',
    key: 'updateDate',
    width: 240,
    render: (text: any, record: any) => (
      <span>{`${moment(parseInt(record.updateDate, 10)).format('YYYY年MM月DD日 HH:mm:ss')}`}</span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 180,
    render: (text: any, record: any) => {
      return (
        <div>
          <Button onClick={fn.handlerEdit.bind(null, record)}>编辑</Button>
          <Divider type="vertical" />
          <Button
            onClick={fn.handlerDelete.bind(null, record.brandid)}
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

const expandedRowRender = (record: any) => [
  <p key={record.subtitle} style={{ padding: '0 0 12px 0' }}>
    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>副标题: </span>
    {record.subtitle}
  </p>,
  <p key={record.description} style={{ padding: '0 0 12px 0' }}>
    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>详细描述: </span>
    {record.description}
  </p>,
];

@connect(({ brand }: any) => ({
  loading: brand.loading,
  confirmLoading: brand.confirmLoading,
  originalData: brand.originalData,
  data: brand.data,
  uploading: brand.uploading,
  uploadImage: brand.uploadImage,
}))
class AllBrand extends React.PureComponent<IProps, IStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'brand/queryBrandLists',
    });
  }
  componentDidUpdate() {
    // 上传完成/成功时
    this.uploadFinished();
  }

  // Pagination
  onShowSizeChange = (current: number, pageSize: number) => {
    console.log(current, pageSize);
  };

  // filter data
  filterData = (key: string) => {
    if (key.indexOf('SELECTDATE') !== -1) {
      const newKey = key.slice('SELECTDATE'.length + 1);
      // console.log(newKey, 'newKey');
      this.filterSelectDate(newKey);
      return;
    }
    const newKey = key.toString().toUpperCase();
    const { dispatch, data } = this.props;
    const result = data.filter((item: any) => {
      return (
        strToUpper(item.title).indexOf(newKey) !== -1 ||
        strToUpper(item.description).indexOf(newKey) !== -1
      );
    });

    dispatch({
      type: 'brand/getBrandLists',
      payload: result,
    });
  };

  // filter date 日期
  filterSelectDate = (key: any) => {
    const arr = key.split(',');
    const start = moment(arr[0]).valueOf();
    const end = moment(arr[1]).valueOf();
    const { dispatch, data } = this.props;
    const result = data.filter(item => {
      const select = parseInt(item.updateDate, 10);
      return select >= start && select <= end;
    });

    dispatch({
      type: 'brand/getBrandLists',
      payload: result,
    });
  };

  // 重置搜索
  resetData = () => {
    const { dispatch, originalData } = this.props;

    dispatch({
      type: 'brand/getBrandLists',
      payload: originalData,
    });
  };
  // 操作
  // 添加
  handlerAdd = () => {
    console.log('添加');
    handleStatus = 0;
    recordData = {};
    this.props.dispatch({
      type: 'brand/changeUpLoadImage',
      payload: '',
    });
    this.showModal();
  };
  // 编辑
  handlerEdit = (record = {}) => {
    console.log('编辑');
    handleStatus = 1;
    recordData = { ...record };
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
      type: 'brand/delBrand',
      payload: record,
    });
  };
  // submit
  handleSubmit = (event: any) => {
    console.log('保存');
    event.preventDefault();
    const { confirmLoading, form } = this.props;

    if (!confirmLoading) {
      form.validateFields({ force: true }, (err: any, values: any) => {
        const { dispatch, uploadImage } = this.props;
        // console.log(values, 'values');
        if (!err) {
          // 传递给api
          const passApiFormData: any = {
            title: values.title,
            entitle: values.entitle,
            subtitle: values.subtitle,
            tag: values.tag,
            description: values.description,
            weight: values.weight,
            url: uploadImage || recordData.url,
          };

          if (!handleStatus) {
            // console.log(passApiFormData, 'passApiFormData');
            // 添加店铺
            dispatch({
              type: 'brand/addBrand',
              payload: passApiFormData,
            });
          } else {
            passApiFormData.brandid = recordData.brandid;
            // console.log(passApiFormData, 'passApiFormData');
            // 编辑店铺
            dispatch({
              type: 'brand/editBrand',
              payload: passApiFormData,
            });
          }

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'brand/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'brand/changeConfirmLoading',
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
    this.props.form.resetFields(['title', 'entitle', 'subtitle', 'tag', 'description', 'weight']);
  };
  // show Modal
  showModal = () => {
    this.setState({ visible: true });
    this.props.dispatch({
      type: 'brand/changeUpLoadImage',
      payload: '',
    });
  };
  // close Modal
  closeModal = () => {
    this.setState({ visible: false });
  };

  // 自定义上传 栏目
  uploadBrand = (event: any) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);

    dispatch({
      type: 'brand/uploadBrand',
      payload: formData,
    });
  };
  // 上传(完成)成功
  uploadFinished = () => {
    const { dispatch, uploading } = this.props;

    if (uploading === 'done' || uploading === 'error') {
      dispatch({
        type: 'brand/changeUpLoading',
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
              <Form.Item label="品牌图片">
                {getFieldDecorator('brandImage')(
                  <Upload
                    name="brandImage"
                    showUploadList={false}
                    action={`${API_DOMAIN}/api/server/upload/brandimages`}
                    beforeUpload={beforeUpload}
                    customRequest={this.uploadBrand}
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
                        '更新/上传品牌图片'
                      )}
                    </Button>
                  </Upload>
                )}
                {(uploadImage || recordData.url) && (
                  <img
                    src={`${URL_PREFIX}${uploadImage || recordData.url}`}
                    style={{ maxWidth: '100%', marginTop: '6px', display: 'block' }}
                    alt="店铺图片"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="品牌(中文)">
                {getFieldDecorator('title', {
                  initialValue: recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写舒览品牌中文名称！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="英文名">
                {getFieldDecorator('entitle', {
                  initialValue: recordData.entitle || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写舒览品牌英文名称！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label="联系电话">
                {getFieldDecorator('tel', {
                  initialValue: recordData.tel || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写联系电话！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </Form.Item>
            </Col> */}
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="权重(值越小越靠前)">
                {getFieldDecorator('weight', {
                  initialValue: recordData.weight || 0,
                  rules: [
                    {
                      required: true,
                      message: '请填写排序权重！',
                    },
                  ],
                })(<InputNumber size="large" style={{ width: '96%' }} min={0} step={1} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="标签">
                {getFieldDecorator('tag', {
                  initialValue: recordData.tag || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写标签！',
                    },
                  ],
                })(<Input size="large" style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            {/* <Col span={24}>
              <Form.Item label="具体地址">
                {getFieldDecorator('address', {
                  initialValue: recordData.address || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写具体详细地址！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="副标题">
                {getFieldDecorator('subtitle', {
                  initialValue: recordData.subtitle || '',
                  rules: [
                    {
                      // required: true,
                      message: '请填写舒览品牌副标题！',
                    },
                  ],
                })(<TextArea size="large" rows={4} style={{ width: '96%' }} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="详细描述">
                {getFieldDecorator('description', {
                  initialValue: recordData.description || '',
                  rules: [
                    {
                      // required: true,
                      message: '请填写舒览品牌详细描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
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
          </Form.Item>
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
        <div className="componentBackground">
          <BreadCrumb />
        </div>
        <DetailHandler filterData={this.filterData} resetData={this.resetData} />
        <Divider />
        <div>
          <Button style={{ float: 'right' }} type="primary" size="large" onClick={this.handlerAdd}>
            添加新品牌
          </Button>
        </div>
        <div style={{ marginTop: '88px' }}>
          <Table
            rowKey="brandid"
            columns={columns({
              handlerEdit: this.handlerEdit,
              handlerDelete: this.handlerDelete,
            })}
            loading={loading}
            dataSource={data}
            expandedRowRender={expandedRowRender}
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

export default Form.create()(AllBrand);
