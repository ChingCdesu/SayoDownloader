import {GameMode, Approved, Language, Genre} from "@src/common/enums/osu"

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
    titleU?: String,
    creator: String,
    artist: String,
    artistU?: String,
    approved: Approved,
    tags: String[],
    sources: String[],
    language: Language,
    genre: Genre,
    duration: Number,
    bpm: Number,
    maps: Beatmap[]
}
