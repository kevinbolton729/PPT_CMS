import moment from 'moment';

export const parseResponse = (params: any) => {
  const { status, message, extData } = params;
  const count = extData.count || 0;
  const data = extData.data || [];

  return {
    status,
    message,
    count,
    data,
  };
};

export const parseData = (data: any) => {
  const handlerData = data;
  // 按 updateDate 排序
  handlerData.sort((a: any, b: any) => (a.updateDate < b.updateDate ? 1 : -1));

  const newData = handlerData.map((item: any, index: number) => ({
    key: index,
    sort: item.accountId,
    amount: item.accountAmount,
    feetype: item.sortId,
    showdate: moment(parseInt(item.updateDate, 10)).format('YYYY年MM月DD日'),
    datetimestamp: item.updateDate,
    remark: item.accountRemark,
  }));

  return newData;
};

export const parseSorts = (sorts: any) => {
  return sorts.map((item: any) => ({
    sortId: item.sortId,
    sortType: item.sortType,
    sortName: item.sortName,
    sortPid: item.sortPid,
  }));
};
