/* ============================================================
   最后的书店 v6.0 - 音频管理
   ============================================================ */

var AudioManager = {
  _bgm: null,
  _sfxVolume: 0.6,
  _bgmVolume: 0.35,
  _muted: false,
  _currentBGM: null,
  _fadeInterval: null,

  init: function() {
    try {
      this._muted = localStorage.getItem('tlb_muted') === '1';
    } catch (e) { this._muted = false; }

    this._bgm = new (window.Audio || HTMLAudioElement)();
    this._bgm.loop = true;
    this._bgm.volume = this._muted ? 0 : this._bgmVolume;
  },

  playBGM: function(name) {
    if (this._currentBGM === name) return;
    this._currentBGM = name;

    var self = this;
    var path = 'assets/music/' + name + '.mp3';
    var newBgm = new (window.Audio || HTMLAudioElement)(path);
    newBgm.loop = true;
    newBgm.volume = 0;

    // 淡出旧的
    if (this._bgm && !this._bgm.paused) {
      var oldBgm = this._bgm;
      var fadeOut = setInterval(function() {
        if (oldBgm.volume > 0.05) {
          oldBgm.volume -= 0.05;
        } else {
          oldBgm.pause();
          clearInterval(fadeOut);
        }
      }, 80);
    }

    // 淡入新的
    newBgm.play().then(function() {
      var fadeIn = setInterval(function() {
        if (newBgm.volume < (self._muted ? 0 : self._bgmVolume) - 0.03) {
          newBgm.volume += 0.03;
        } else {
          newBgm.volume = self._muted ? 0 : self._bgmVolume;
          clearInterval(fadeIn);
        }
      }, 80);
    }).catch(function() { /* autoplay blocked, ignore */ });

    this._bgm = newBgm;
  },

  playSFX: function(name) {
    if (this._muted) return;
    try {
      var sfx = new (window.Audio || HTMLAudioElement)('assets/sfx/' + name + '.mp3');
      sfx.volume = this._sfxVolume;
      sfx.play().catch(function() {});
    } catch (e) { /* ignore */ }
  },

  toggleMute: function() {
    this._muted = !this._muted;
    try { localStorage.setItem('tlb_muted', this._muted ? '1' : '0'); } catch (e) {}
    if (this._bgm) this._bgm.volume = this._muted ? 0 : this._bgmVolume;
  },

  isMuted: function() { return this._muted; }
};
