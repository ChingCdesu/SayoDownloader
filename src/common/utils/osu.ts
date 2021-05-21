import { GameMode } from "../enums/osu";

const colors = [
  "#4fbdfc",
  "#65ff84",
  "#adf94e",
  "#f9a55f",
  "#f9514e",
  "#a067ff",
]
const diffs = [0, 2.0, 2.7, 4.0, 5.3, 6.5]
const expertPurple = "#937eff"

const HexToRgb = (sColor: string): number[] => {
  let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  sColor = sColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = "#";
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  } else {
    return [];
  }
}

const RgbToHex = (rgb: string): string => {
  let _this = rgb;
  let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (/^(rgb|RGB)/.test(_this)) {
    let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
    let strHex = "#";
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16);
      hex = hex.length < 2 ? 0 + "" + hex : hex; // 保证每个rgb的值为2位
      strHex += hex;
    }
    if (strHex.length !== 7) {
      strHex = _this;
    }
    return strHex;
  } else if (reg.test(_this)) {
    let aNum = _this.replace(/#/, "").split("");
    if (aNum.length === 6) {
      return _this;
    } else if (aNum.length === 3) {
      let numHex = "#";
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += aNum[i] + aNum[i];
      }
      return numHex;
    }
  } else {
    return _this;
  }
  return "";
}

const gradientColor = (
  startColor: string,
  endColor: string,
  step: number,
  index: number
): string => {
  let startRGB = HexToRgb(startColor); //转换为rgb数组模式
  let startR = startRGB[0];
  let startG = startRGB[1];
  let startB = startRGB[2];
  let endRGB = HexToRgb(endColor);
  let endR = endRGB[0];
  let endG = endRGB[1];
  let endB = endRGB[2];

  let sR = (endR - startR) / step; //总差值
  let sG = (endG - startG) / step;
  let sB = (endB - startB) / step;

  return RgbToHex(
    "rgb(" +
    Math.round(sR * index + startR) +
    "," +
    Math.round(sG * index + startG) +
    "," +
    Math.round(sB * index + startB) +
    ")"
  );
}

export const diffColor = (diff: number): string => {
  if (diff > 6.5) {
    return expertPurple;
  } else if (diff < 0) {
    return colors[0];
  }
  let index = 0;
  while (diff > diffs[index]) index++;
  const step = (diffs[index] - diffs[index - 1]) * 100;
  const i = (diff - diffs[index - 1]) * 100;
  return gradientColor(
    colors[index - 1],
    colors[index],
    Math.round(step),
    Math.round(i)
  );
}

export const getModeIconClass = (mode: GameMode) => {
  return "mode-" + GameMode[mode];
}

export const gameModeString = (mode: GameMode): string => {
  const prefix = mode === GameMode.osu ? "" : "osu!";
  const suffix = mode === GameMode.osu ? "!" : "";
  return prefix + GameMode[mode] + suffix;
}