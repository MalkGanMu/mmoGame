import { SubWorldMonsterState } from "../../types/SubWorldMonsterState";
import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqAddMonster extends BaseRequest {
    monsterState: SubWorldMonsterState,
    subWorldId:string
}

export interface ResAddMonster extends BaseResponse {
    
}

export const conf: BaseConf = {
    
}