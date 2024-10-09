// TODO: This service doesn't really belong in the game folder, should be in the services folder instead.
class AudioService {

  _play (audio) {
    if (this.store && this.store.state.settings.interface.audio === 'disabled') {
      return
    }
    audio.volume = 0.5
    audio.play()
  }

  preload() {
    this.backspaceAudio = new Audio('audio/backspace.mp3')
    this.clickAudio = new Audio('audio/click.mp3')
    this.closeAudio = new Audio('audio/close.mp3')
    this.dialogOpenAudio = new Audio('audio/dialog_open.mp3')
    this.downloadAudio = new Audio('audio/download.mp3')
    this.hoverAudio = new Audio('audio/hover.mp3')
    this.joinAudio = new Audio('audio/join.mp3')
    this.leaveAudio = new Audio('audio/leave.mp3')
    this.loadingAudio = new Audio('audio/loading.mp3')
    this.openAudio = new Audio('audio/open.mp3')
    this.quitAudio = new Audio('audio/quit.mp3')
    this.typeAudio = new Audio('audio/type.mp3')
  }

  loadStore (store) {
    this.store = store
    this.preload()
  }

  backspace () {
    this._play(this.backspaceAudio)
  }

  click () {
    this._play(this.clickAudio)
  }

  close () {
    this._play(this.closeAudio)
  }

  dialogOpen () {
    this._play(this.dialogOpenAudio)
  }

  download () {
    this._play(this.downloadAudio)
  }

  hover () {
    this._play(this.hoverAudio)
  }

  join () {
    this._play(this.joinAudio)
  }

  leave () {
    this._play(this.leaveAudio)
  }

  loading () {
    this._play(this.loadingAudio)
  }

  open () {
    this._play(this.openAudio)
  }

  quit () {
    this._play(this.quitAudio)
  }

  type () {
    this._play(this.typeAudio)
  }
}

export default new AudioService()
