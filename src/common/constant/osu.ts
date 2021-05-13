export enum GameMode {
    osu,
    taiko,
    catch,
    mania
}

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

export interface MapDiffSettings {
    cs: Number,
    hp: Number,
    od: Number,
    ar: Number
}

export interface Beatmap {
    id: Number,
    name: String,
    difficult: Number,
    mode: GameMode,
    circle_count: Number,
    slider_count: Number,
    spinner_count: Number,
    map_diff: MapDiffSettings
}

export interface BeatmapSet {
    id: Number,
    title: String,
    creator: String,
    artist: String,
    approved: Approved,
    tags: String[],
    sources: String[],
    language: Language,
    genre: Genre,
    duration: Number,
    bpm: Number,
    maps: Beatmap[]
}
