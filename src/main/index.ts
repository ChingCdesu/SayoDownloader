/**
 * electron 主文件
 */
import { join } from "path";
import { app, session } from "electron";
import { Main } from "./window";
import dotenv from "dotenv";
import store from "@src/common/utils/store";
import { version } from "@src/common/constant";
import { registerDownloadService } from "./download";
import { registerAppService } from "./app";

dotenv.config({ path: join(__dirname, "../../.env") });

function init() {
  const mainWin = new Main();
  store.set("phase", version);
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = `SayoDownloader v${store.get(
      "phase"
    )} powered by Electron`;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  const mainOpen = () => {
    mainWin.open();
    registerDownloadService(mainWin.win);
    registerAppService()
  };
  mainOpen();
}

app.whenReady().then(init);
