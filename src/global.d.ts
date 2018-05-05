export { Authorized } from './components/Authorized';

type Action = IAction['action'];
type Dispatch = IAction['dispatch'];

export interface IAction {
  action: { type: string; payload?: any };
  dispatch: (action: Action) => void;
}

export type Element = JSX.Element[] | JSX.Element;

export interface App {
  [propName: string]: any;
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
