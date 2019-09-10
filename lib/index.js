const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const quillFilePath = path.join(__dirname, '../node_modules/quill/dist/quill.min.js');
const polyfillFilePath = path.join(__dirname, 'polyfill.js');

const getQuill = async () => {
  const JSDOM_TEMPLATE = `
  <div id="editor">hello</div>
  <script>${await fs.promises.readFile(quillFilePath)}</script>
  <script>${await fs.promises.readFile(polyfillFilePath)}</script>
  <script>
    document.getSelection = function() {
      return {
        getRangeAt: function() { }
      };
    };
    document.execCommand = function (command, showUI, value) {
      try {
          return document.execCommand(command, showUI, value);
      } catch(e) {}
      return false;
    };
  </script>
`;

  const JSDOM_OPTIONS = { runScripts: 'dangerously', resources: 'usable' };

  const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);

  return new DOM.window.Quill('#editor');
}

exports.convertTextToDelta = (text) => {
  const QUILL = getQuill();

  QUILL.setText(text);

  let delta = QUILL.getContents();
  return delta;
};

exports.convertHtmlToDelta = (html) => {
  const QUILL = getQuill();

  return QUILL.clipboard.convert(html);
};

exports.convertDeltaToHtml = (delta) => {
  const QUILL = getQuill();

  QUILL.setContents(delta);

  return QUILL.root.innerHTML;
};