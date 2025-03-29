import { _decorator, Component, Node, game } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';

const { ccclass, property } = _decorator;

@ccclass('ActionWork')
export default class ActionWork extends BTAction {
    private duration: number = 3000; // 工作持续时间设为3000，可按需调整
    private startTime: number = 0;

    constructor(duration: number = 3000) {
        super();
        this.duration = duration;
    }

    onStart() {
        super.onStart()
        this.startTime = game.totalTime;
        console.log("ActionWork onStart");
    }

    onUpdate() {
        if (game.totalTime - this.startTime > this.duration) {
            return NodeStatus.Success;
        }

        return NodeStatus.Running;
    }

    onEnd() {
        super.onEnd();
        console.log("ActionWork onEnd");
    }
}