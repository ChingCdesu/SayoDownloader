import {GameMode, Approved, Language, Genre} from "@src/common/enums/osu";

export interface IMapDiffSettings {
    cs: number,
    hp: number,
    od: number,
    ar: number
}

export interface IBeatmap {
    id: number,
    name: string,
    difficult: number,
    mode: GameMode,
    circle_count: number,
    slider_count: number,
    spinner_count: number,
    map_diff: IMapDiffSettings
}

export interface IBeatmapSet {
    id: number,
    title: string,
    titleU?: string,
    creator: string,
    artist: string,
    artistU?: string,
    approved: Approved,
    tags: string[],
    sources: string[],
    language: Language,
    genre: Genre,
    duration: number,
    bpm: number,
    maps: IBeatmap[],
    audio?: string
}
