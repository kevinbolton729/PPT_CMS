import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: 'Dashboard',
    icon: 'desktop',
    path: 'dashboard',
    children: [
      {
        name: '工作台',
        path: 'workspace',
        // hideInMenu: true,
      },
    ],
  },
  {
    name: 'CMS管理',
    icon: 'hdd',
    path: 'cms',
    children: [
      {
        name: '轮播图片',
        path: 'sildes',
      },
      {
        name: '设置栏目',
        path: 'channels',
      },
      {
        name: '所有内容',
        path: 'articles',
      },
      {
        name: '广告管理',
        path: 'advers',
      },
    ],
  },
  {
    name: '专题管理',
    icon: 'bulb',
    path: 'special',
    children: [
      {
        name: '舒览品牌',
        path: 'brand',
      },
      {
        name: '实体店铺',
        path: 'shop',
      },
    ],
  },
  {
    name: '加盟申请',
    icon: 'mail',
    path: 'join',
    children: [
      {
        name: '全部申请',
        path: 'apply',
      },
    ],
  },
];

function formatter(data, parentPath = '', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
