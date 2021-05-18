import { Howl, Howler } from "howler";
import { PlayListItem, PlayListLoop } from "@src/common/interfaces/player";

const uuidV4 = function () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

declare global {
  interface Window {
    player: PlayerSingleton;
  }
}

class PlayerSingleton {
  private constructor() {}

  public walkSync: (item: PlayListItem) => void = function (
    item: PlayListItem
  ) {};

  private _playlistLoop: PlayListLoop = "list";

  public get playlistLoop() {
    return this._playlistLoop;
  }

  public set playlistLoop(loop: PlayListLoop) {
    this._playlistLoop = loop;
  }

  private _onPlayEnd = () => {
    this.nextSong()
  };

  private _playlist: PlayListItem[] = [];

  public get playlist(): PlayListItem[] {
    let ret: PlayListItem[] = []
    this._playlist.forEach(v => {
      ret.push({
        sid: v.sid,
        url: v.url,
        id: v.id,
        title: v.title
      })
    })
    return ret
  }

  private _error: boolean = false;

  public get error(): boolean {
    return this._error;
  }

  private _playingIndex = -1;

  public get playingIndex(): number {
    return this._playingIndex;
  }

  private _playing = false;

  public get playing(): boolean {
    return this._playing;
  }

  public static get instance(): PlayerSingleton {
    if (!window.player) {
      window.player = new PlayerSingleton();
    }
    return window.player;
  }

  public addAudioToPlaylist(url: string, title: string, sid: number): string {
    const uuid = uuidV4();
    this._playlist.push({
      sid,
      id: uuid,
      url,
      title,
    });
    return uuid;
  }

  public removePlaylistItem(id: string) {
    const index = this._playlist.findIndex((v) => v.id === id);
    if (index !== -1) this._playlist.splice(index, 1);
  }

  public play(id: string) {
    this._playlist.forEach((p) => {
      p.howl?.stop();
    });
    const index = this._playlist.findIndex((v) => v.id === id);
    this._playingIndex = index;
    if (index !== -1) {
      this._playing = true;
      this._playlist[this._playingIndex].howl = new Howl({
        src: [this._playlist[this._playingIndex].url],
        onload: () => {
          this._playlist[this._playingIndex].duration =
            this._playlist[this._playingIndex].howl?.duration();
        },
        onend: this._onPlayEnd,
        onplay: () => {
          this._playlist[this._playingIndex].timer =
            Math.round(
              this._playlist[this._playingIndex].howl?.seek() as number
            ) || 0;
          var item: PlayListItem = this._playlist[this._playingIndex]
          this.walkSync({
            id: item.id,
            sid: item.sid,
            title: item.title,
            url: item.url,
            timer: item.timer,
            duration: item.duration
          });
        },
        onplayerror: () => {
          this._playing = false;
          this._error = true;
        },
        onloaderror: () => {
          this._playing = false;
          this._error = true;
        },
      });
      this._playlist[this._playingIndex].howl?.play();
    } else {
      this._playing = false;
    }
  }

  public stop() {
    if (this._playingIndex !== -1)
      this._playlist[this._playingIndex].howl?.stop();
  }

  public pause() {
    if (this._playingIndex !== -1)
      this._playlist[this._playingIndex].howl?.pause();
  }

  public resume() {
    if (this._playingIndex !== -1)
      this._playlist[this._playingIndex].howl?.play();
  }

  public mute() {
    Howler.mute(true);
  }

  public unmute() {
    Howler.mute(false);
  }

  public getVolume(): number {
    return Math.round(Howler.volume() * 100);
  }

  public setVolume(volume: number) {
    Howler.volume(volume / 100);
  }

  public seek(time: number) {
    if (this._playingIndex !== -1)
      this._playlist[this._playingIndex].howl?.seek(time);
  }

  public previousSong() {
    this._playing = false;
    if (
      this._playlistLoop === "list" &&
      this._playingIndex === 0
    )
      return;
    if (this._playlistLoop === "list-loop") {
      if (this._playingIndex === 0) this._playingIndex = this._playlist.length - 1;
      else --this._playingIndex;
    }
    if (this._playlistLoop === "random") {
      this._playingIndex = Math.floor(Math.random() * this._playlist.length);
    }
    this.play(this._playlist[this._playingIndex].id);
  }

  public nextSong() {
    this._playing = false;
    if (
      this._playlistLoop === "list" &&
      this._playlist.length - 1 === this._playingIndex
    )
      return;
    if (this._playlistLoop === "list-loop") {
      if (this._playlist.length - 1 === this._playingIndex)
        this._playingIndex = 0;
      else ++this._playingIndex;
    }
    if (this._playlistLoop === "random") {
      this._playingIndex = Math.floor(Math.random() * this._playlist.length);
    }
    this.play(this._playlist[this._playingIndex].id);
  }
}

export default PlayerSingleton;
