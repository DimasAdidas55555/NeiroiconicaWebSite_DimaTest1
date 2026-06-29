(function () {
  var N = 10;
  var coords = [];
  var dots = [];
  var mx = -200, my = -200;
  var started = false;

  for (var i = 0; i < N; i++) {
    coords.push({ x: -200, y: -200 });
    var d = document.createElement('div');
    var size = (7 - i * 0.45).toFixed(1);
    var alpha = (0.55 - i * 0.048).toFixed(3);
    d.style.cssText =
      'position:fixed;pointer-events:none;border-radius:50%;z-index:9998;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:rgba(26,79,204,' + alpha + ');' +
      'transform:translate(-50%,-50%);' +
      'left:-200px;top:-200px;will-change:transform;';
    document.body.appendChild(d);
    dots.push(d);
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!started) { started = true; tick(); }
  });

  function tick() {
    coords[0].x += (mx - coords[0].x) * 0.5;
    coords[0].y += (my - coords[0].y) * 0.5;
    for (var i = 1; i < N; i++) {
      coords[i].x += (coords[i - 1].x - coords[i].x) * 0.35;
      coords[i].y += (coords[i - 1].y - coords[i].y) * 0.35;
    }
    for (var i = 0; i < N; i++) {
      dots[i].style.left = coords[i].x + 'px';
      dots[i].style.top = coords[i].y + 'px';
    }
    requestAnimationFrame(tick);
  }
})();
