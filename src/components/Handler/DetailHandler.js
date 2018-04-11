/*
 * @Author: Kevin Bolton
 * @Date: 2018-01-03 23:18:25
 * @Last Modified by: Kevin Bolton
 * @Last Modified time: 2018-03-01 13:05:15
 */

import React, { PureComponent } from 'react';
import { DatePicker, Input, message, Button, Form } from 'antd';
import PropTypes from 'prop-types';
// import moment from 'moment';
// 常量
import { MESSAGE_NOINPUT } from '@/utils/consts';
// 样式
import styles from './DetailHandler.less';

const { RangePicker } = DatePicker;
const { Search } = Input;

class DetailHandler extends PureComponent {
  static contextTypes = {
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.dateFormat = {
      dately: 'YYYY年MM月DD日',
    };
  }

  // select date
  onChange = (dates, dateStrings) => {
    const { filterData } = this.props;
    console.log(dates, 'dates');
    console.log(dateStrings, 'dateStrings');
    if (dateStrings[0] !== '' || dateStrings[1] !== '') {
      filterData(`SELECTDATE,${dates[0]},${dates[1]}`);
    }
  };
  // search
  getSearch = (value) => {
    const { filterData } = this.props;
    if (!value) {
      message.warning(MESSAGE_NOINPUT);
    } else {
      console.log(value);
      filterData(value);
    }
  };
  enterSearch = (e) => {
    e.preventDefault();
    const { value } = e.target;
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
    const { dately } = this.dateFormat;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.hander}>
        <Form>
          <div className={styles.item}>
            {getFieldDecorator('search')(
              <Search
                enterButton
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

export default Form.create()(DetailHandler);
