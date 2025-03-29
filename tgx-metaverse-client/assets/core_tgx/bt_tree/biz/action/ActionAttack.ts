import { _decorator, Component, Node, game } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';

const { ccclass, property } = _decorator;

@ccclass('ActionAttack')
export default class ActionAttack extends BTAction {
    private duration: number = 2000;
    private startTime: number = 0;

    constructor(duration: number = 2000) {
        super();
        this.duration = duration;
    }

    onStart() {
        super.onStart()
        this.startTime = game.totalTime;
        BlackBoard.Instance.hp -= 20;
        console.log("ActionAttack onStart");
    }

    onUpdate() {
        if (game.totalTime - this.startTime > this.duration) {
            return NodeStatus.Success;
        }

        return NodeStatus.Running;
    }

    onEnd() {
        super.onEnd();
        console.log("ActionAttack onEnd");
    }
}