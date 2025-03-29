import { _decorator, Component, Node } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTConditional from '../../BTConditional';
import { NodeStatus } from '../../enum';
const { ccclass, property } = _decorator;

@ccclass('ConditionalHP')
export default class ConditionalHP extends BTConditional {
    onUpdate() {
        console.log("BlackBoard.Instance.hp:", BlackBoard.Instance.hp, "BlackBoard.Instance.hp >= 100的结果为:", BlackBoard.Instance.hp >= 100);
        if (BlackBoard.Instance.hp >= 100) {
            return NodeStatus.Success;
        }
        return NodeStatus.Failure;
    }
}


