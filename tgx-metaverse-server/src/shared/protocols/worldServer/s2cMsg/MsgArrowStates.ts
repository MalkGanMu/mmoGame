import { SubWorldArrowState } from "../../../types/SubWorldArrowState";

export interface MsgArrowStates {
    arrowStates: {
        [uid: string]: SubWorldArrowState
    }
}
