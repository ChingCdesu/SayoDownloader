import { Language, Genre } from "@src/common/enums/osu";

export const mode = [
    { label: "std", value: 1 },
    { label: "taiko", value: 2 },
    { label: "ctb", value: 4 },
    { label: "mania", value: 8 },
];
export const approved = [
    { label: "Ranked & Approved", value: 1 },
    { label: "Qualified", value: 2 },
    { label: "Loved", value: 4 },
    { label: "Pending & WIP", value: 8 },
    { label: "Graveyard", value: 16 },
];
export const genre = [
    { label: "所有", value: 1 },
    { label: "尚未指定", value: 2 },
    { label: "电子游戏", value: 4 },
    { label: "动漫", value: 8 },
    { label: "摇滚", value: 16 },
    { label: "流行乐", value: 32 },
    { label: "其他", value: 64 },
    { label: "新奇", value: 128 },
    { label: "嘻哈", value: 256 },
    { label: "电子", value: 1024 },
];
export const language = [
    { label: "所有", value: 1 },
    { label: "其他", value: 2 },
    { label: "英语", value: 4 },
    { label: "日语", value: 8 },
    { label: "中文", value: 16 },
    { label: "纯音乐", value: 32 },
    { label: "韩语", value: 64 },
    { label: "法语", value: 128 },
    { label: "德语", value: 256 },
    { label: "瑞典语", value: 512 },
    { label: "西班牙语", value: 1024 },
    { label: "意大利语", value: 2048 },
];

export const LanguageChinese = [
    { enum: Language.any, value: "所有" },
    { enum: Language.chinese, value: "中文" },
    { enum: Language.english, value: "英语" },
    { enum: Language.french, value: "法语" },
    { enum: Language.german, value: "德语" },
    { enum: Language.instrumental, value: "纯音乐" },
    { enum: Language.italian, value: "意大利语" },
    { enum: Language.japanese, value: "日语" },
    { enum: Language.korean, value: "韩语" },
    { enum: Language.other, value: "其他" },
    { enum: Language.polish, value: "波兰语" },
    { enum: Language.russian, value: "俄语" },
    { enum: Language.spanish, value: "西班牙语" },
    { enum: Language.swedish, value: "瑞典语" },
    { enum: Language.unspecified, value: "尚未指定" },
];
export const GenreChinese = [
    { value: "所有", enum: Genre.any },
    { value: "尚未指定", enum: Genre.unspecified },
    { value: "电子游戏", enum: Genre.video_game },
    { value: "动漫", enum: Genre.anime },
    { value: "摇滚", enum: Genre.rock },
    { value: "流行乐", enum: Genre.pop },
    { value: "其他", enum: Genre.other },
    { value: "新奇", enum:Genre.novelty },
    { value: "嘻哈", enum:Genre.hip_hop },
    { value: "电子", enum:Genre.electronic },
    { value: "金属", enum: Genre.metal},
    { value: "古典", enum: Genre.classical},
    { value: "民间音乐", enum: Genre.folk},
    { value: "爵士", enum: Genre.jazz},
];