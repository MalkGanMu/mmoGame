import { SubWorldArrowState } from "../../types/SubWorldArrowState";
import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqDelArrow extends BaseRequest {
    arrowState: SubWorldArrowState,
    subWorldId:string
}

export interface ResDelArrow extends BaseResponse {
    
}

export const conf: BaseConf = {
    
}