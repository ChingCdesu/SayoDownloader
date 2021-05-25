import { Howl, Howler } from "howler";
import { PlayListItem, PlayListLoop } from "@src/common/interfaces/player";
import store from "@src/common/utils/store";

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
  private constructor() {
    if (store.has("playlist")) {
      this._playlist = store.get("playlist");
    } else {
      this._playlist = [];
    }
  }

  private _playlistLoop: PlayListLoop = "list";
  private _playlist: PlayListItem[];
  private _error: boolean = false;
  private _playingIndex = -1;
  private _playing = false;
  private _loading = false;

  private removeHowl(items: PlayListItem[]): PlayListItem[] {
    let ret: PlayListItem[] = [];
    items.forEach((v) => {
      ret.push({
        id: v.id,
        sid: v.sid,
        title: v.title,
        url: v.url,
        duration: v.duration,
        timer: v.timer,
        deleted: v.deleted,
      });
    });
    return ret;
  }

  public walkSync: (item: PlayListItem) => void = function (
    item: PlayListItem
  ) {};

  public get playlistLoop() {
    return this._playlistLoop;
  }

  public set playlistLoop(loop: PlayListLoop) {
    this._playlistLoop = loop;
  }

  public get playlist(): PlayListItem[] {
    return this._playlist.filter((v) => !v.deleted);
  }

  public get error(): boolean {
    return this._error;
  }

  public get loading(): boolean {
    return this._loading;
  }

  public get playingIndex(): number {
    return this._playingIndex;
  }

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
    const index = this._playlist.findIndex((v) => v.url === url);
    let ret: string;
    if (index === -1) {
      const uuid = uuidV4();
      this._playlist.push({
        sid,
        id: uuid,
        url,
        title,
        deleted: false,
      });
      ret = uuid;
    } else {
      this._playlist[index].deleted = false;
      ret = this._playlist[index].id;
    }
    store.set("playlist", this.removeHowl(this._playlist));
    return ret;
  }

  public removePlaylistItem(id: string) {
    const index = this._playlist.findIndex((v) => v.id === id);
    const originPlaying = this._playingIndex === index;
    if (originPlaying) {
      this.nextSong();
    }
    if (index !== -1) this._playlist[index].deleted = true;
    store.set("playlist", this.removeHowl(this._playlist));
  }

  private step = () => {
    if (this._playing) {
      this._playlist[this._playingIndex].timer =
        Math.round(this._playlist[this._playingIndex].howl?.seek() as number) ||
        0;
      var item: PlayListItem = this._playlist[this._playingIndex];
      this.walkSync({
        id: item.id,
        sid: item.sid,
        title: item.title,
        url: item.url,
        timer: item.timer,
        duration: item.duration,
        deleted: item.deleted,
      });
      window.requestAnimationFrame(this.step);
    }
  };

  public play(id: string) {
    this._playlist.forEach((p) => {
      p.howl?.stop();
    });
    const index = this._playlist.findIndex((v) => v.id === id);
    this._playingIndex = index;
    if (index !== -1 && !this._playlist[index].deleted) {
      if (!this._playlist[this._playingIndex].howl) {
        this._loading = true;
        this._playlist[this._playingIndex].howl = new Howl({
          src: [this._playlist[this._playingIndex].url],
          onload: () => {
            this._playlist[this._playingIndex].duration =
              this._playlist[this._playingIndex].howl?.duration();
            this._loading = false;
          },
          onend: () => {
            this._playing = false;
            this.nextSong();
          },
          onplayerror: () => {
            this._playing = false;
            this._error = true;
          },
          onloaderror: () => {
            this._playing = false;
            this._error = true;
          },
          onplay: () => {
            this._playing = true;
            window.requestAnimationFrame(this.step);
          },
          onpause: () => {
            this._playing = false;
          },
          onstop: () => {
            this._playing = false;
          },
        });
      }
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
    return Math.floor(Howler.volume() * 100);
  }

  public setVolume(volume: number) {
    Howler.volume(volume / 100);
  }

  public seek(time: number) {
    if (this._playingIndex !== -1)
      this._playlist[this._playingIndex].howl?.seek(time);
  }

  public previousSong() {
    do {
      if (0 === this._playlist.filter((v) => !v.deleted).length) break;
      if (this._playlistLoop === "list") {
        if (0 === this._playingIndex) return;
        else --this._playingIndex;
      }
      if (this._playlistLoop === "list-loop") {
        if (this._playingIndex === 0)
          this._playingIndex = this._playlist.length - 1;
        else --this._playingIndex;
      }
      if (this._playlistLoop === "random") {
        this._playingIndex = Math.floor(Math.random() * this._playlist.length);
      }
    } while (!this._playlist[this._playingIndex].deleted);
    this.play(this._playlist[this._playingIndex].id);
  }

  public nextSong() {
    do {
      if (0 === this._playlist.filter((v) => !v.deleted).length) break;
      if (this._playlistLoop === "list") {
        if (this._playlist.length - 1 === this._playingIndex) return;
        else ++this._playingIndex;
      }
      if (this._playlistLoop === "list-loop") {
        if (this._playlist.length - 1 === this._playingIndex)
          this._playingIndex = 0;
        else ++this._playingIndex;
      }
      if (this._playlistLoop === "random") {
        this._playingIndex = Math.floor(Math.random() * this._playlist.length);
      }
    } while (!this._playlist[this._playingIndex].deleted);
    this.play(this._playlist[this._playingIndex].id);
  }
}

export default PlayerSingleton;
