import io from "socket.io-client";

const url = import.meta.env.VUE_APP_SOCKETS_HOST;

export const init = (store) => {
  const socket = io(url);

  const redirect = id => {
    socket.on(id, (data) => {
      store.commit(id, data);
    });
  }

  redirect("gameStarted");
  redirect("gamePlayerJoined");
  redirect("gamePlayerReady");
  redirect("gamePlayerNotReady");
  redirect("gamePlayerReadyToQuit");
  redirect("gamePlayerNotReadyToQuit");
  redirect("gameMessageSent");
  redirect("gameConversationRead");
  redirect("gameConversationLeft");
  redirect("gameConversationMessagePinned");
  redirect("gameConversationMessageUnpinned");
  redirect("playerEventRead");
  redirect("playerAllEventsRead");
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
