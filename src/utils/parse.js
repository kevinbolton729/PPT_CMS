import moment from 'moment';

export async function parseResponse(params) {
  const { status, message, extData } = params;
  const count = extData.count || 0;
  const data = extData.data || [];

  return {
    status,
    message,
    count,
    data,
  };
}

export async function parseData(data) {
  const handlerData = data;
  // 按 updateDate 排序
  handlerData.sort((a, b) => (a.updateDate < b.updateDate ? 1 : -1));

  const newData = handlerData.map((item, index) => ({
    key: index,
    sort: item.accountId,
    amount: item.accountAmount,
    feetype: item.sortId,
    showdate: moment(parseInt(item.updateDate, 10)).format('YYYY年MM月DD日'),
    datetimestamp: item.updateDate,
    remark: item.accountRemark,
  }));

  return newData;
}

export async function parseSorts(sorts) {
  return sorts.map(item => ({
    sortId: item.sortId,
    sortType: item.sortType,
    sortName: item.sortName,
    sortPid: item.sortPid,
  }));
}
