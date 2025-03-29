import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Singleton')
export default class Singleton extends Component {
    private static _instance: any = null;

    static GetInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this();
        }
        return this._instance;
    }
}


