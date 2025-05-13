import { ApiCall } from "tsrpc";
import { ReqDelArrow, ResDelArrow } from "../../shared/protocols/worldServer/PtlDelArrow";
import { worldServer } from "../../WorldServerMain";

export async function ApiDelArrow(call: ApiCall<ReqDelArrow, ResDelArrow>) {
    let req = call.req;
    let subWorld = worldServer.id2SubWorld.get(req.subWorldId);
    if (!subWorld) {
        return call.error('子世界不存在', { code: 'SUB_WORLD_NOT_EXISTS' });
    }
    delete subWorld.arrowStates[req.arrowState.uid];
    // TODO
    call.succ({});
}