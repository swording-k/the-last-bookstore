/* ============================================================
   最后的书店 v6.0 - 场景动画 / 浮尘粒子
   ============================================================ */

var SceneFX = {
  init: function() {
    this._buildDust();
    this._setupTransitions();
  },

  _buildDust: function() {
    var container = document.getElementById('dust-layer');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < 40; i++) {
      var d = document.createElement('div');
      d.className = 'dust';
      var size = 2 + Math.random() * 4;
      var left = Math.random() * 100;
      var top = Math.random() * 100;
      var dur = 8 + Math.random() * 12;
      var delay = Math.random() * -15;
      d.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
        'left:' + left + '%;top:' + top + '%;' +
        'background:rgba(255,236,179,0.6);border-radius:50%;' +
        'animation:floatDust ' + dur.toFixed(1) + 's linear ' + delay.toFixed(1) + 's infinite;';
      container.appendChild(d);
    }
  },

  _setupTransitions: function() {
    // 窗口随时间变化淡入淡出
  },

  // 跨时段视觉过渡
  transitionTo: function(timeOfDay) {
    var wnd = document.getElementById('main-window');
    if (!wnd) return;
    wnd.classList.remove('wnd-morning', 'wnd-afternoon', 'wnd-evening', 'wnd-night');
    void wnd.offsetWidth; // 强制 reflow
    wnd.classList.add('wnd-' + timeOfDay);

    // 文档主题色微调
    document.body.classList.remove('tod-morning', 'tod-afternoon', 'tod-evening', 'tod-night');
    document.body.classList.add('tod-' + timeOfDay);
  }
};
