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
