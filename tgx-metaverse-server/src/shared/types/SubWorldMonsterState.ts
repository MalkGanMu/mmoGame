export interface SubWorldMonsterState {
    uid: string,
    pos: {
        x: number,
        y: number,
        z: number
    },
    health: number,
    aniState: PlayerAniState
}

export type PlayerAniState = 'idle' | 'walking' | 'wave' | 'punch' | 'dance';