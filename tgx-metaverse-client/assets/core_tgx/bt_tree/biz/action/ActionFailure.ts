import { _decorator, Component, Node } from 'cc';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('ActionFailure')
export class ActionFailure extends BTAction {
    onUpdate() {
        return NodeStatus.Failure;
    }
}


