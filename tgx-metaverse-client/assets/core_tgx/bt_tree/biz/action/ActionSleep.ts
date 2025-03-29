import { _decorator, Component, Node, game } from 'cc';
import BlackBoard from '../../../../module_room/scene_room1/BlackBoard';
import BTAction from '../../BTAction';
import { NodeStatus } from '../../enum';

const { ccclass, property } = _decorator;

@ccclass('ActionSleep')
export default class ActionSleep extends BTAction {
    private duration: number = 5000; // 睡觉持续时间设为5000，可按需调整
    private startTime: number = 0;

    constructor(duration: number = 5000) {
        super();
        this.duration = duration;
    }

    onStart() {
        super.onStart()
        this.startTime = game.totalTime;
        console.log("ActionSleep onStart");
    }

    onUpdate() {
        if (game.totalTime - this.startTime > this.duration) {
            return NodeStatus.Success;
        }

        return NodeStatus.Running;
    }

    onEnd() {
        super.onEnd();
        console.log("ActionSleep onEnd");
    }
}