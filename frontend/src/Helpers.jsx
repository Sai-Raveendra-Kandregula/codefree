function vh(percent) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (percent * h) / 100;
}

function vw(percent) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (percent * w) / 100;
}

function vmin(percent) {
  return Math.min(vh(percent), vw(percent));
}

function vmax(percent) {
  return Math.max(vh(percent), vw(percent));
}

function splitAtIndex(str, index) {
  const part1 = str.slice(0, index);
  const part2 = str.slice(index);
  return [part1, part2];
}

export {
  vh, vw, vmin, vmax, splitAtIndex
}