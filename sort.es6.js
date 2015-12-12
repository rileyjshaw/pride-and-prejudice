window.addEventListener('load', _ => {
  const FONT_SIZE = '72px';
  const FONT_FAMILY = '"Courier New", Courier, monospace';

  /**
   * STAGE ONE: We render a simple file input to the page so the user can get
   * started uploading their text. We also stage an output <pre>.
   */

  const input = document.createElement('input');
  const output = document.createElement('pre');
  input.type = 'file';
  output.style.backgroundColor = '#eee';
  output.style.whiteSpace = 'pre-wrap';
  output.style.wordWrap = 'break-word';
  output.style.fontFamily = FONT_FAMILY;

  input.addEventListener('change', ({target: {files}}) => {
    //Retrieve the first (and only!) File from the FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.onload = ({target: {result}}) => {
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
  const span = document.createElement('span');

  // These are most of the characters we're likely to encounter in a text. We
  // use them to come up with an estimate for the maximum width and height
  // for a character in our selected font. We'll add generous padding in case
  // an unlisted character breaks the limits, but we can be pretty confident
  // with this list alone.
  const chars =
    Array.from({length: 95}, (_, i) => String.fromCharCode(i + 32));

  span.style.font = `${FONT_SIZE} ${FONT_FAMILY}`;
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  document.body.appendChild(span);

  const {w: maxWidth, h: maxHeight} = chars.reduce((max, char) => {
    span.textContent = char;
    const {width, height} = span.getBoundingClientRect();
    return {w: Math.max(max.w, width), h: Math.max(max.w, height)};
  }, {w: 0, h: 0});
  const horizontalPadding = maxWidth / 4;
  const verticalPadding = maxHeight / 4;

  document.body.removeChild(span);

  /**
   * STAGE THREE: We prepare a canvas element to draw characters onto, so we
   * can read the image data and see how much visual weight it carries.
   */

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fullWidth = canvas.width = maxWidth + 2 * horizontalPadding;
  const fullHeight = canvas.height = maxHeight + 2 * verticalPadding;

  ctx.font = `${FONT_SIZE} ${FONT_FAMILY}`;
  ctx.textBaseline = 'top';

  const getPixelWeight = (_ => {
    const memo = {};

    return function getPixelWeight (char) {
      if (typeof memo[char] !== 'undefined') return memo[char];
      ctx.clearRect(0, 0, fullWidth, fullHeight);
      ctx.fillText(char, horizontalPadding, verticalPadding);
      // r, g, b channels will always be 0. Transparent pixels will have an
      // alpha channel of 0. So by summing `data`, we're summing the opacity of
      // all filled-in pixels. This is wildly inefficient but it gives us a
      // dead simple, reliable measure of relative size.
      return memo[char] = ctx.getImageData(0, 0, fullWidth, fullHeight).data
        .reduce((a, b) => a + b);
    }
  })();

  /**
   * STAGE FOUR: We tie it together with a simple function, `sortText()`,
   * with cache `weights`, that accepts a string and sorts it by visual
   * weight. This is already linked to our <input> (see STAGE ONE).
   */

  function sortText (text) {
    return text
      .split('')
      .filter(char => char !== '\n')
      .sort((a, b) => getPixelWeight(a) - getPixelWeight(b))
      .join('')
      .replace(/ /g, '&nbsp;');
      ;
  }
});
