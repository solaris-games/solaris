import type {Store} from "vuex";
import backspaceFile from '../assets/audio/backspace.mp3'
import clickFile from '../assets/audio/click.mp3'
import closeFile from '../assets/audio/close.mp3'
import dialogOpenFile from '../assets/audio/dialog_open.mp3'
import downloadFile from '../assets/audio/download.mp3'
import hoverFile from '../assets/audio/hover.mp3'
import joinFile from '../assets/audio/join.mp3'
import leaveFile from '../assets/audio/leave.mp3'
import loadingFile from '../assets/audio/loading.mp3'
import openFile from '../assets/audio/open.mp3'
import quitFile from '../assets/audio/quit.mp3'
import typeFile from '../assets/audio/type.mp3'
import type { State } from '../store'

// TODO: This service doesn't really belong in the game folder, should be in the services folder instead.
class AudioService {
  store: Store<State> | undefined;
  backspaceAudio: HTMLAudioElement | undefined;
  closeAudio: HTMLAudioElement | undefined;
  clickAudio: HTMLAudioElement | undefined;
  dialogOpenAudio: HTMLAudioElement | undefined;
  downloadAudio: HTMLAudioElement | undefined;
  hoverAudio: HTMLAudioElement | undefined;
  joinAudio: HTMLAudioElement | undefined;
  leaveAudio: HTMLAudioElement | undefined;
  loadingAudio: HTMLAudioElement | undefined;
  openAudio: HTMLAudioElement | undefined;
  quitAudio: HTMLAudioElement | undefined;
  typeAudio: HTMLAudioElement | undefined;

  _play (audio: HTMLAudioElement) {
    const audioEnabled = this.store?.state?.settings?.interface?.audio === 'disabled';

    if (!this.store || !audioEnabled) {
      return
    }

    audio.volume = 0.5
    audio.play()
  }

  _preload () {
    if (this.backspaceAudio) {
      return
    }

    this.backspaceAudio = new Audio(backspaceFile)
    this.clickAudio = new Audio(clickFile)
    this.closeAudio = new Audio(closeFile)
    this.dialogOpenAudio = new Audio(dialogOpenFile)
    this.downloadAudio = new Audio(downloadFile)
    this.hoverAudio = new Audio(hoverFile)
    this.joinAudio = new Audio(joinFile)
    this.leaveAudio = new Audio(leaveFile)
    this.loadingAudio = new Audio(loadingFile)
    this.openAudio = new Audio(openFile)
    this.quitAudio = new Audio(quitFile)
    this.typeAudio = new Audio(typeFile)
  }

  _checkLoad() {
    const audioEnabled = this.store?.state?.settings?.interface?.audio === 'disabled';

    if (audioEnabled) {
      this._preload();
    }
  }

  loadStore (store: Store<State>) {
    this.store = store;
    this._checkLoad();
  }

  backspace () {
    this._checkLoad();
    this._play(this.backspaceAudio!)
  }

  click () {
    this._play(this.clickAudio!)
  }

  close () {
    this._checkLoad();
    this._play(this.closeAudio!)
  }

  dialogOpen () {
    this._checkLoad();
    this._play(this.dialogOpenAudio!)
  }

  download () {
    this._checkLoad();
    this._play(this.downloadAudio!)
  }

  hover () {
    this._checkLoad();
    this._play(this.hoverAudio!)
  }

  join () {
    this._checkLoad();
    this._play(this.joinAudio!)
  }

  leave () {
    this._checkLoad();
    this._play(this.leaveAudio!)
  }

  loading () {
    this._checkLoad();
    this._play(this.loadingAudio!)
  }

  open () {
    this._checkLoad();
    this._play(this.openAudio!)
  }

  quit () {
    this._checkLoad();
    this._play(this.quitAudio!)
  }

  type () {
    this._checkLoad();
    this._play(this.typeAudio!)
  }
}

export default new AudioService()
