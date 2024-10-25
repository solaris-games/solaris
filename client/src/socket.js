import io from "socket.io-client";

const url = import.meta.env.VUE_APP_SOCKETS_HOST;

class Socket {
  constructor(url) {
    this.socket = io(url);
  }

  subscribe(event, callback) {
    this.socket.on(event, callback);
  }

  unsubscribe(event, callback) {
    this.socket.off(event, callback);
  }

  unsubscribeAll(event) {
    this.socket.off(event);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}

export const init = (store) => {
  const socket = new Socket(url);

  const redirect = id => {
    socket.subscribe(id, (data) => {
      store.commit(id, data);
    });
  }

  redirect("gameStarted");
  redirect("gamePlayerJoined");
  redirect("gamePlayerReady");
  redirect("gamePlayerNotReady");
  redirect("gamePlayerReadyToQuit");
  redirect("gamePlayerNotReadyToQuit");
  redirect("gamePlayerCreditsReceived");
  redirect("gamePlayerCreditsSpecialistsReceived");
  redirect("gamePlayerRenownReceived");
  redirect("gamePlayerTechnologyReceived");
  redirect("gamePlayerDebtAdded");
  redirect("gamePlayerDebtForgiven");
  redirect("gamePlayerDebtSettled");
  redirect("gamePlayerDiplomaticStatusChanged");

  return (app, options) => {
    app.config.globalProperties.$socket = socket;
  };
};
