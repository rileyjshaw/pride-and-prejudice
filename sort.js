'use strict';

window.addEventListener('load', function (_) {
  var FONT_SIZE = '72px';
  var FONT_FAMILY = '"Courier New", Courier, monospace';

  /**
   * STAGE ONE: We render a simple file input to the page so the user can get
   * started uploading their text. We also stage an output <pre>.
   */

  var input = document.createElement('input');
  var output = document.createElement('pre');
  input.type = 'file';
  output.style.backgroundColor = '#eee';
  output.style.whiteSpace = 'pre-wrap';
  output.style.wordWrap = 'break-word';
  output.style.fontFamily = FONT_FAMILY;

  input.addEventListener('change', function (_ref) {
    var files = _ref.target.files;

    // Retrieve the first (and only!) File from the FileList object.
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function (_ref2) {
      var result = _ref2.target.result;

      output.innerHTML = sortText(result);
    };
    reader.readAsText(file);
  });
  document.body.appendChild(input);
  document.body.appendChild(output);

  /**
   * STAGE TWO: We come up with an estimate for the maximum height and width
   * that we'll encounter from a character in this font.
   */

  // ctx.measureText() only returns width for now, so we'll just place
  // characters into a dummy span element and measure their approximate size.
  var span = document.createElement('span');

  // These are most of the characters we're likely to encounter in a text. We
  // use them to come up with an estimate for the maximum width and height
  // for a character in our selected font. We'll add generous padding in case
  // an unlisted character breaks the limits, but we can be pretty confident
  // with this list alone.
  var chars = Array.from({ length: 95 }, function (_, i) {
    return String.fromCharCode(i + 32);
  });

  span.style.font = FONT_SIZE + ' ' + FONT_FAMILY;
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  document.body.appendChild(span);

  var _chars$reduce = chars.reduce(function (max, char) {
    span.textContent = char;

    var _span$getBoundingClie = span.getBoundingClientRect();

    var width = _span$getBoundingClie.width;
    var height = _span$getBoundingClie.height;

    return { w: Math.max(max.w, width), h: Math.max(max.w, height) };
  }, { w: 0, h: 0 });

  var maxWidth = _chars$reduce.w;
  var maxHeight = _chars$reduce.h;

  var horizontalPadding = maxWidth / 4;
  var verticalPadding = maxHeight / 4;

  document.body.removeChild(span);

  /**
   * STAGE THREE: We prepare a canvas element to draw characters onto, so we
   * can read the image data and see how much visual weight it carries.
   */

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var fullWidth = canvas.width = maxWidth + 2 * horizontalPadding;
  var fullHeight = canvas.height = maxHeight + 2 * verticalPadding;

  ctx.font = FONT_SIZE + ' ' + FONT_FAMILY;
  ctx.textBaseline = 'top';

  var getPixelWeight = function (_) {
    var memo = {};

    return function getPixelWeight(char) {
      if (typeof memo[char] !== 'undefined') return memo[char];
      ctx.clearRect(0, 0, fullWidth, fullHeight);
      ctx.fillText(char, horizontalPadding, verticalPadding);
      // r, g, b channels will always be 0. Transparent pixels will have an
      // alpha channel of 0. So by summing `data`, we're summing the opacity of
      // all filled-in pixels. This is wildly inefficient but it gives us a
      // dead simple, <del>reliable</del> measure of relative size.
      return memo[char] = ctx.getImageData(0, 0, fullWidth, fullHeight).data.reduce(function (a, b) {
        return a + b;
      });
    };
  }();

  /**
   * STAGE FOUR: We tie it together with a simple function, `sortText()`,
   * with cache `weights`, that accepts a string and sorts it by visual
   * weight. This is already linked to our <input> (see STAGE ONE).
   */

  function sortText(text) {
    return text.split('').filter(function (char) {
      return char !== '\n';
    }).sort(function (a, b) {
      return getPixelWeight(a) - getPixelWeight(b);
    })
    // While we're here, we also add zero-width spaces between the characters
    // so that they'll break evenly.
    .join('​').replace(/ /g, '&nbsp;');
    ;
  }
});
