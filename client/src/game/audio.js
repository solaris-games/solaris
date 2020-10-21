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

// TODO: This service doesn't really belong in the game folder, should be in the services folder instead.
class AudioService {
  constructor (store) {
    this.store = store
  }

  _play (audioFile) {
    if (this.store.state.settings.interface.audio === 'disabled') {
      return
    }

    try {
      let audio = new Audio(audioFile)
      audio.play()
    } catch (err) {
      console.error(err)
    }
  }

  backspace () {
    this._play(backspaceFile)
  }

  click () {
    this._play(clickFile)
  }

  close () {
    this._play(closeFile)
  }

  dialogOpen () {
    this._play(dialogOpenFile)
  }

  download () {
    this._play(downloadFile)
  }

  hover () {
    this._play(hoverFile)
  }

  join () {
    this._play(joinFile)
  }

  leave () {
    this._play(leaveFile)
  }

  loading () {
    this._play(loadingFile)
  }

  open () {
    this._play(openFile)
  }

  quit () {
    this._play(quitFile)
  }

  type () {
    this._play(typeFile)
  }
}

export default AudioService
