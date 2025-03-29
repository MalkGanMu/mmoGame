import { _decorator, Component, Node } from 'cc';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('ActionLog')
export default class ActionLog extends BTAction {
    constructor(private text:string){
        super();
    }

    onUpdate() {
        console.log(this.text);
        return NodeStatus.Success;
    }
}


