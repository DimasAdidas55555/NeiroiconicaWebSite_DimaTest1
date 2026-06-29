(function () {
  var glow = document.createElement('div');
  glow.style.cssText =
    'position:fixed;pointer-events:none;z-index:1;' +
    'width:500px;height:500px;border-radius:50%;' +
    'background:radial-gradient(circle, rgba(37,99,235,0.07) 0%, rgba(37,99,235,0.03) 40%, transparent 70%);' +
    'transform:translate(-50%,-50%);' +
    'left:-600px;top:-600px;' +
    'will-change:left,top;' +
    'transition:left 0.08s linear,top 0.08s linear;';
  document.body.appendChild(glow);

  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();
