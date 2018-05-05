import { Button, Card, Col, Divider, Form, Icon, Input, Row, Upload } from 'antd';
import { connect } from 'dva';
import * as React from 'react';
// import moment from 'moment';
// 组件
import BreadCrumb from '../../components/BreadCrumb';
import { openModal } from '../../components/Modal';
// 常量
import {
  API_DOMAIN,
  BTN_RESET,
  BTN_SAVE,
  IMAGE_NODESCRIPTION,
  IMAGE_NOTITLE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_ADDEDIT_TITLE,
  MODEL_WIDTH_EDIT,
  URL_PREFIX,
} from '../../utils/consts';
// 方法
import { beforeUpload } from '../../utils/fns';
// 声明
import { ISildeProps as IProps, ISildeStates as IStates } from './';

// 样式
const styles = require('./Sildes.less');

const { Meta }: any = Card;
const { TextArea }: any = Input;

// 表格 列表项 数据
let recordData: any = {};

let clickedUpload = '';

@connect(({ silde }: any) => ({
  loading: silde.loading,
  originalData: silde.originalData,
  data: silde.data,
  uploading: silde.uploading,
  confirmLoading: silde.confirmLoading,
}))
class SildeShow extends React.PureComponent<IProps, IStates> {
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false,
    };
  }
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'silde/querySildeLists',
    });
  }

  clicked = (id: any) => {
    clickedUpload = id;
    // console.log(clickedUpload, 'clickedUpload');
  };
  // submit
  handleSubmit = (event: any) => {
    // console.log('submit');
    event.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err: any, values: any) => {
        const { dispatch } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // 传递给api
          const passApiFormData: any = {
            title: values.title,
            description: values.description,
            url: recordData.url || '',
            topath: values.topath,
          };
          passApiFormData.id = recordData.id;
          // console.log(passApiFormData, 'passApiFormData');
          // 编辑轮播图片
          dispatch({
            type: 'silde/editSilde',
            payload: passApiFormData,
          });

          // 关闭Modal
          setTimeout(() => {
            this.closeModal();
          }, 500);
        } else {
          dispatch({
            type: 'silde/changeConfirmLoading',
            payload: true,
          });
          setTimeout(() => {
            dispatch({
              type: 'silde/changeConfirmLoading',
              payload: false,
            });
          }, 1500);
        }
      });
    }
  };
  // 重置
  handleReset = () => {
    // console.log('重置');
    this.props.form.resetFields(['title', 'description', 'topath']);
  };
  // show Modal
  showModal = () => {
    // console.log('show Modal');
    this.setState({ visible: true });
  };
  // close Modal
  closeModal = () => {
    // console.log('close Modal');
    this.setState({ visible: false });
  };

  // 自定义上传 栏目
  uploadSilde = (event: any) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', clickedUpload);

    dispatch({
      type: 'silde/uploadSilde',
      payload: formData,
    });
  };
  // 上传(完成)成功
  // uploadFinished = () => {
  //   const { uploading, uploadImage } = this.props;

  //   if (uploading === 'done' || uploading === 'error') {
  //     const sort = `url${clickedUpload}`;
  //     this.setState({
  //       [sort]: uploadImage,
  //     });
  //     // console.log(this.state, 'state');
  //   }
  // };

  // 操作
  // 编辑
  handlerEdit = (record = {}) => {
    // console.log('编辑');
    recordData = { ...record };
    this.showModal();
  };

  render() {
    // const { url1, url2, url3 } = this.state;
    const { loading, data, confirmLoading, form } = this.props;
    const { getFieldDecorator } = form;
    const { visible } = this.state;
    // console.log(data, 'data');
    const passChildren = (
      <div style={{ padding: '0 16' }}>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col span={12}>
              <Form.Item label="标题">
                {getFieldDecorator('title', {
                  initialValue: recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写轮播图标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="跳转地址">
                {getFieldDecorator('topath', {
                  initialValue: recordData.topath || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写图片跳转地址！',
                    },
                  ],
                })(<Input addonBefore="Http://" size="large" style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="描述">
                {getFieldDecorator('description', {
                  initialValue: recordData.description || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写轮播图描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div style={{ marginTop: '-24px' }}>
              <Divider>
                <span className="dividerFont">编辑轮播图片</span>
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
        <div style={{ marginTop: '24px' }}>
          <Row>
            {data.reduce((arr, current) => {
              const htmlNode = (
                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} key={current.id}>
                  <div className={styles.uploadImage}>
                    <Card
                      title={`页码: 0${current.weight}`}
                      style={{ width: '100%' }}
                      loading={loading}
                      cover={
                        current.url ? (
                          <img alt="example" src={`${URL_PREFIX}${current.url}`} />
                        ) : (
                          <span className={styles.noImage} />
                        )
                      }
                      actions={[
                        <Icon
                          key="edit"
                          type="edit"
                          onClick={this.handlerEdit.bind(this, current)}
                        />,
                        <Upload
                          key="upload"
                          name="sildeShow"
                          showUploadList={false}
                          action={`${API_DOMAIN}/api/server/upload/sildeimages`}
                          beforeUpload={beforeUpload}
                          customRequest={this.uploadSilde}
                        >
                          <Icon type="upload" onClick={this.clicked.bind(this, current.weight)} />
                        </Upload>,
                      ]}
                    >
                      {
                        <Meta
                          title={current.title || IMAGE_NOTITLE}
                          description={current.description || IMAGE_NODESCRIPTION}
                        />
                      }
                    </Card>
                  </div>
                </Col>
              );
              arr.push(htmlNode);
              return arr;
            }, [])}
            {/* <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8}>
              <div className={styles.uploadImage}>
                <Card
                  style={{ width: '100%' }}
                  loading={loading}
                  cover={
                    url2 ? (
                      <img alt="example" src={`${URL_PREFIX}${url2}`} />
                    ) : (
                      <span className={styles.noImage} />
                    )
                  }
                  actions={[
                    <Icon type="edit" />,
                    <Upload
                      name="sildeShow"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/sildeimages`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadSilde}
                    >
                      <Icon type="upload" onClick={this.clicked.bind(this, 2)} />
                    </Upload>,
                  ]}
                >
                  <Meta title="Card title" description="This is the description" />
                </Card>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8}>
              <div className={styles.uploadImage}>
                <Card
                  style={{ width: '100%' }}
                  loading={loading}
                  cover={
                    url3 ? (
                      <img alt="example" src={`${URL_PREFIX}${url3}`} />
                    ) : (
                      <span className={styles.noImage} />
                    )
                  }
                  actions={[
                    <Icon type="edit" />,
                    <Upload
                      name="sildeShow"
                      showUploadList={false}
                      action={`${API_DOMAIN}/api/server/upload/sildeimages`}
                      beforeUpload={beforeUpload}
                      customRequest={this.uploadSilde}
                    >
                      <Icon type="upload" onClick={this.clicked.bind(this, 3)} />
                    </Upload>,
                  ]}
                >
                  <Meta title="Card title" description="This is the description" />
                </Card>
              </div>
            </Col> */}
          </Row>
        </div>
      </div>
    );
  }
}

export default Form.create()(SildeShow) as any;
