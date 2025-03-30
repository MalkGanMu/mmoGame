import { SubWorldMonsterState } from "../../../types/SubWorldMonsterState";

/** 同步玩家状态 */
export interface MsgMonsterStates {
    monsterStates: {
        [uid: string]: SubWorldMonsterState
    }
}