import { SubWorldArrowState } from "../../types/SubWorldArrowState";
import { BaseRequest, BaseResponse, BaseConf } from "../base";

export interface ReqAddArrow extends BaseRequest {
    arrowState: SubWorldArrowState,
    subWorldId:string
}

export interface ResAddArrow extends BaseResponse {
    
}

export const conf: BaseConf = {
    
}