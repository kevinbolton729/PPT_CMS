/*
 * @Author: Kevin Bolton
 * @Date: 2018-01-03 23:18:25
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-05-05 21:45:29
 */

import { Button, DatePicker, Form, Input, message } from 'antd';
import PropTypes from 'prop-types';
import * as React from 'react';
// 常量
import { MESSAGE_NOINPUT } from '../../utils/consts';
// 声明
import { IProps, IStates } from './';

// 样式
const styles = require('./DetailHandler.less');

const { RangePicker } = DatePicker;
const { Search } = Input;

const dateFormat = {
  dately: 'YYYY年MM月DD日',
};

class DetailHandler extends React.PureComponent<IProps, IStates> {
  static contextTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  // select date
  onChange = (dates: any, dateStrings: any) => {
    console.log(dates, 'dates');
    console.log(dateStrings, 'dateStrings');
    if (dateStrings[0] !== '' || dateStrings[1] !== '') {
      this.props.filterData(`SELECTDATE,${dates[0]},${dates[1]}`);
    }
  };
  // search
  getSearch = (value: any) => {
    const { filterData } = this.props;
    if (!value) {
      message.warning(MESSAGE_NOINPUT);
    } else {
      console.log(value);
      filterData(value);
    }
  };
  enterSearch = (event: any) => {
    event.preventDefault();
    const { value } = event.target;
    this.getSearch(value);
  };
  // reset search
  resetSearch = () => {
    this.props.form.setFieldsValue({
      search: '',
      rangedate: null,
    });
  };
  // click 重置 Button
  clickReset = () => {
    this.props.resetData();
    this.resetSearch();
  };

  render() {
    const { dately } = dateFormat;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.hander}>
        <Form>
          <div className={styles.item}>
            {getFieldDecorator('search')(
              <Search
                enterButton={true}
                style={{ width: 300 }}
                placeholder="关键字"
                onSearch={this.getSearch}
                onPressEnter={this.enterSearch}
              />
            )}
          </div>
          <div className={styles.item}>
            <Button onClick={this.clickReset}>重置</Button>
          </div>
          <div className={styles.item}>
            {getFieldDecorator('rangedate')(
              <RangePicker allowClear={false} onChange={this.onChange} format={dately} />
            )}
          </div>
        </Form>
      </div>
    );
  }
}

export default Form.create()(DetailHandler) as any;
