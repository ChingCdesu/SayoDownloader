// enums的导出文件不能为.d.ts, 会出现找不到文件的现象
export enum Language {
    any,
    unspecified,
    english,
    japanese,
    chinese,
    instrumental,
    korean,
    french,
    german,
    swedish,
    spanish,
    italian,
    russian,
    polish,
    other
}

export enum Genre {
    any,
    unspecified,
    video_game,
    anime,
    rock,
    pop,
    other,
    novelty,
    hip_hop = 9,
    electronic,
    metal,
    classical,
    folk,
    jazz
}

export enum Approved {
    graveyard = -2,
    WIP,
    pending,
    ranked,
    approved,
    qualified,
    loved
}

export enum GameMode {
    osu,
    taiko,
    catch,
    mania
}
