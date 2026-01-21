export default class PlayerMutationNames {
  private constructor() { };

  public static readonly GamePlayerJoined: string = 'gamePlayerJoined';
  public static readonly GamePlayerQuit: string = 'gamePlayerQuit';
  public static readonly GamePlayerConcededDefeat: string = 'gamePlayerConcededDefeat';

  public static readonly GamePlayerReady: string = 'gamePlayerReady';
  public static readonly GamePlayerNotReady: string = 'gamePlayerNotReady';

  public static readonly GamePlayerReadyToQuit: string = 'gamePlayerReadyToQuit';
  public static readonly GamePlayerNotReadyToQuit: string = 'gamePlayerNotReadyToQuit';

  public static readonly PlayerDebtSettled: string = 'playerDebtSettled';
}
