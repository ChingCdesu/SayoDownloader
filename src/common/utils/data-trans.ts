import { IBeatmapSet, IBeatmap } from '@src/common/interfaces/osu'
import { IApiBeatmapSet } from '@src/common/interfaces/api.osu'

export const apiData2IBeatmapSet = (data: IApiBeatmapSet): IBeatmapSet => {
    let ret: IBeatmapSet = {
        id: data.sid,
        title: data.title,
        titleU: data.titleU,
        creator: data.creator,
        artist: data.artist,
        artistU: data.artistU,
        approved: data.approved,
        tags: data.tags.split(' '),
        sources: data.source.split(' '),
        language: data.language,
        genre: data.genre,
        duration: data.bid_data.length > 0 ? data.bid_data[0].length : 0,
        bpm: data.bpm,
        maps: []
    }
    data.bid_data.sort((a, b) => {
        if (a.mode == b.mode)
            return a.star - b.star
        return a.mode - b.mode
    })
    if (data.bid_data.length > 0) {
        ret.audio = data.bid_data[0].audio
    }
    for (var i = 0; i < data.bid_data.length; ++i) {
        const beatmap = data.bid_data[i]
        ret.maps.push({
            id: beatmap.bid,
            name: beatmap.version,
            difficult: beatmap.star,
            mode: beatmap.mode,
            circle_count: beatmap.circles,
            slider_count: beatmap.sliders,
            spinner_count: beatmap.spinners,
            map_diff: {
                cs: beatmap.CS,
                ar: beatmap.AR,
                hp: beatmap.HP,
                od: beatmap.OD
            }
        })
    }
    return ret
}
