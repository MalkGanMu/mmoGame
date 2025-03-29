import { _decorator, Component, Node } from 'cc';
import Singleton from '../../core_tgx/bt_tree/Singleton';
const { ccclass, property } = _decorator;

@ccclass('BlackBoard')
export default class BlackBoard extends Singleton {
    static get Instance() {
        return super.GetInstance<BlackBoard>();
    }
    mp = 0;
    hp = 0;
}


