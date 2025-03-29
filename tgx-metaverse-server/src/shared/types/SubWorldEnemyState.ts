export interface SubWorldEnemyState {
    uid: string,
    pos: {
        x: number,
        y: number,
        z: number
    },
    rotation: {
        x: number,
        y: number,
        z: number,
        w: number
    },
    health: number,
    aniState: PlayerAniState
}

export type PlayerAniState = 'idle' | 'walking' | 'wave' | 'punch' | 'dance';