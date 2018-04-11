import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Icon, Upload, Divider, Button, Form, Input } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
// import moment from 'moment';
// 组件
import { openModal } from '@/components/Modal';
// 常量
import {
  API_DOMAIN,
  URL_PREFIX,
  BTN_SAVE,
  BTN_RESET,
  MODEL_ADDEDIT_TITLE,
  MODEL_ADDEDIT_DESCRIPTION,
  MODEL_WIDTH_EDIT,
  IMAGE_NOTITLE,
  IMAGE_NODESCRIPTION,
} from '@/utils/consts';
// 方法
import { beforeUpload } from '@/utils/fns';
// 样式
import styles from './Sildes.less';

const { Meta } = Card;
const FormItem = Form.Item;
const { TextArea } = Input;

class SildeShow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    // 列表项数据
    this.recordData = {};

    this.clickedUpload = '';
  }
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'silde/querySildeLists',
    });
  }

  clicked = (id) => {
    this.clickedUpload = id;
    // console.log(this.clickedUpload, 'clickedUpload');
  };
  // submit
  handleSubmit = (event) => {
    // console.log('submit');
    event.preventDefault();

    if (!this.props.confirmLoading) {
      this.props.form.validateFields({ force: true }, (err, values) => {
        const { dispatch } = this.props;
        if (!err) {
          // console.log(values, 'values');
          // 传递给api
          const passApiFormData = {
            title: values.title,
            description: values.description,
            url: this.recordData.url || '',
            topath: values.topath,
          };
          passApiFormData.id = this.recordData.id;
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
  uploadSilde = (event) => {
    const { dispatch } = this.props;
    const { file, filename } = event;
    const formData = new FormData(); // 创建form对象

    formData.append(filename, file, file.name);
    formData.append('weight', this.clickedUpload);

    dispatch({
      type: 'silde/uploadSilde',
      payload: formData,
    });
  };
  // 上传(完成)成功
  // uploadFinished = () => {
  //   const { uploading, uploadImage } = this.props;

  //   if (uploading === 'done' || uploading === 'error') {
  //     const sort = `url${this.clickedUpload}`;
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
    this.recordData = { ...record };
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
              <FormItem label="标题">
                {getFieldDecorator('title', {
                  initialValue: this.recordData.title || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写轮播图标题！',
                    },
                  ],
                })(<Input size="large" style={{ width: '96%' }} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="跳转地址">
                {getFieldDecorator('topath', {
                  initialValue: this.recordData.topath || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写图片跳转地址！',
                    },
                  ],
                })(<Input addonBefore="Http://" size="large" style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem label="描述">
                {getFieldDecorator('description', {
                  initialValue: this.recordData.description || '',
                  rules: [
                    {
                      required: true,
                      message: '请填写轮播图描述！',
                    },
                  ],
                })(<TextArea size="large" rows={4} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem>
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
                        <Icon type="edit" onClick={this.handlerEdit.bind(this, current)} />,
                        <Upload
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

export default connect(({ silde }) => ({
  loading: silde.loading,
  originalData: silde.originalData,
  data: silde.data,
  uploading: silde.uploading,
  confirmLoading: silde.confirmLoading,
}))(Form.create()(SildeShow));
