export { Authorized } from './components/Authorized';

type Dispatch = IAction['dispatch'];
type FuncStrToStr = (param: string) => string;
type FuncTypeToNum = (sort: string, maps: string[]) => number;
type FuncTypeToStr = (sort: string, maps: string[]) => string;
type FuncTypeToElements = (ids: any[], maps: any[]) => Element;
type FuncTypeToArr = (ids: any[], maps: any[]) => string[];
type BeforeUpload = (file: IFile) => boolean;
type HandleToken = (params: { put: string; message?: string }) => void;

interface IFile {
  type: string;
  size: number;
}
interface IAction {
  action: { type: string; payload?: any };
  dispatch: (action: IAction['action']) => void;
}

export type Element = JSX.Element[] | JSX.Element;

export interface App {
  [propName: string]: any;
}
export interface IReturnTypes {
  void: () => void;
  boolean: () => boolean;
  string: () => string;
  number: () => number;
  array: () => any[];
}
export interface IProps {
  currentUser: {
    portrait: string;
    nickname: string;
    sex: number;
    tel: number | string;
    email: string;
  };
  dispatch: Dispatch;
}
export interface IAxios {
  handleFetch(url: string, options: any): any;
  checkStatus(response: IAxios['response'], resolve: any): any;
  response: {
    status: number;
    statusText: string;
    url?: string;
  };
  error: {
    [errName: string]: any;
  };
  fetch: IAxios['handleFetch'];
  request: IAxios['handleFetch'];
}
export interface IParse {
  (
    params: {
      status: number;
      message: string;
      extData: { count: number; data: any[] };
    }
  ): {
    status: number;
    message: string;
    count: number;
    data: any[];
  };
}
export interface IFns {
  setMd5: FuncStrToStr;
  twoDecimal: FuncStrToStr;
  parseNum: FuncStrToStr;
  parseUrl: FuncStrToStr;
  getSortType: FuncTypeToNum;
  getTypeName: FuncTypeToStr;
  getMapTypeName: FuncTypeToElements;
  getMapStrName: FuncTypeToArr;
  strToUpper: FuncStrToStr;
  beforeUpload: BeforeUpload;
  beforeUploadVideo: BeforeUpload;
  delToken: HandleToken;
  noToken: HandleToken;
  getMenus: (firstMenus: any[], data?: any[]) => any[];
  getFirstMenu: (data?: any[]) => any[];
  getChildMenus: (sortId: string, data?: any[]) => any[];
  getBase64: (img: any, callback: FuncStrToStr) => void;
  base64UrlToBlob: (url: string) => any;
  getUploadImgs: (passArr?: any[]) => any[];
  covertBase64toUrl: (params: { data: any[]; contentOps: any }) => any;
  gotoPage: (params: { put: string; url: string; key?: string }) => void;
}
