import { _decorator, Component, Node } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTAction from '../../BTAction';
import BTConditional from '../../BTConditional';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('ConditionalMP')
export default class ConditionalMP extends BTConditional {
    onUpdate() {
        console.log("BlackBoard.Instance.mp:", BlackBoard.Instance.mp, "BlackBoard.Instance.mp >= 100的结果为:", BlackBoard.Instance.mp >= 100);
        if (BlackBoard.Instance.mp >= 100) {
            return NodeStatus.Success;
        }
        return NodeStatus.Failure;
    }
}


