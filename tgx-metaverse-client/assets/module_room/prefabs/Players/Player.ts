import { _decorator, Component, Node } from 'cc';
import { PlayerAniState } from '../../../module_basic/shared/types/SubWorldUserState';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    private _moveSpeed = 5;
    private _aniState: PlayerAniState = 'idle';
    public get aniState(): PlayerAniState {
        return this._aniState;
    }
    public set aniState(v: PlayerAniState) {
        if (this._aniState === v) {
            return;
        }
        this._aniState = v;

        this.unscheduleAllCallbacks();
        // this.ani.crossFade(v, 0.5); 骨骼动画转换

        if (v === 'wave') {
            this.scheduleOnce(() => {
                this.aniState = 'idle';
            }, 4.73)
        }

        if (v === 'punch') {
            this.scheduleOnce(() => {
                this.aniState = 'idle';
            }, 2.27)
        }

        if (v === 'dance') {
            this.scheduleOnce(() => {
                this.aniState = 'idle';
            }, 12.37)
        }
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
}


