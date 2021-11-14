import { app } from "electron";
import path from "path";

const agreement = "sayo";

export const registerSayoProtocol = (): void => {
  let isSet = false; // 是否注册成功

  app.removeAsDefaultProtocolClient(agreement); // 每次运行都删除自定义协议 然后再重新注册
  // 开发模式下在windows运行需要做兼容
  if (process.env.NODE_ENV === "development" && process.platform === "win32") {
    // 设置electron.exe 和 app的路径
    isSet = app.setAsDefaultProtocolClient(agreement, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    isSet = app.setAsDefaultProtocolClient(agreement);
  }
  console.log("是否注册成功", isSet);
};
