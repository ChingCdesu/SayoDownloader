export interface IApiBeatmap {
    AR: number,
    CS: number,
    HP: number,
    OD: number,
    aim: number,
    audio: string,
    bg: string,
    bid: number,
    circles: number,
    hit300window: number,
    img: string,
    length: number,
    maxcombo: number,
    mode: number,
    passcount: number,
    playcount: number,
    pp: number,
    pp_acc: number,
    pp_aim: number,
    pp_speed: number,
    sliders: number,
    speed: number,
    spinners: number,
    star: number,
    strain_aim: string,
    strain_speed: string,
    version: string
}

export interface IApiBeatmapSet {
    approved: number,
    approved_date: number,
    artist: string,
    artistU: string,
    bid_data: IApiBeatmap[]
    bids_amount: number,
    bpm: number,
    creator: string,
    creator_id: number,
    favourite_count: number,
    genre: number,
    language: number,
    last_update: number,
    local_update: number,
    preview: number,
    sid: number,
    source: string,
    storyboard: number,
    tags: string,
    title: string,
    titleU: string,
    video: number
}

export type number_array_of_2 = [number, number];

export interface IBeatmapListParams {
    cmd: string;
    limit: number;
    offset: number;
    type: string;
    keyword?: string;
    subType?: number;
    mode?: number;
    class?: number;
    genre?: number;
    language?: number;
    stars?: number_array_of_2;
    ar?: number_array_of_2;
    od?: number_array_of_2;
    cs?: number_array_of_2;
    hp?: number_array_of_2;
    bpm?: number_array_of_2;
    length?: number_array_of_2;
}

export interface IBeatmapFilter {
    mode?: number[];
    approved?: number[];
    genre?: number[];
    language?: number[];
    stars?: number_array_of_2;
    ar?: number_array_of_2;
    od?: number_array_of_2;
    cs?: number_array_of_2;
    hp?: number_array_of_2;
    bpm?: number_array_of_2;
    length?: number_array_of_2;
}
