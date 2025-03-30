import { SubWorldMonsterState } from "../../types/SubWorldMonsterState";
import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqDelMonster extends BaseRequest {
    monsterState: SubWorldMonsterState,
    subWorldId:string
}

export interface ResDelMonster extends BaseResponse {
}

export const conf: BaseConf = {
    
}