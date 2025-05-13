import { ApiCall } from "tsrpc";
import { ReqAddArrow, ResAddArrow } from "../../shared/protocols/worldServer/PtlAddArrow";
import { worldServer } from "../../WorldServerMain";

export async function ApiAddArrow(call: ApiCall<ReqAddArrow, ResAddArrow>) {
    let req = call.req;
    let subWorld = worldServer.id2SubWorld.get(req.subWorldId);
    if (!subWorld) {
        return call.error('子世界不存在', { code: 'SUB_WORLD_NOT_EXISTS' });
    }
    subWorld.arrowStates[req.arrowState.uid] = req.arrowState;
    // TODO
    call.succ({});

    subWorld.broadcastMsg('s2cMsg/ArrowStates', {
        arrowStates: subWorld.arrowStates
    });
    delete subWorld.arrowStates[req.arrowState.uid];
}