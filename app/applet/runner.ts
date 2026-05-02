import fs from 'node:fs';
import pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFontsLib from 'pdfmake/build/vfs_fonts.js';

const vfs = pdfFontsLib.default?.pdfMake?.vfs || pdfFontsLib.default?.vfs || pdfFontsLib.pdfMake?.vfs || pdfFontsLib.vfs || pdfFontsLib.default || pdfFontsLib;
pdfMake.vfs = vfs;

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

const docDefinition = {
  content: [
    'First paragraph',
    { text: 'Another paragraph', bold: true }
  ],
  defaultStyle: { font: 'Roboto' }
};

try {
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getBuffer((buffer) => {
    fs.writeFileSync('output.pdf', buffer);
    console.log('PDF created successfully, size:', buffer.length);
  });
} catch (e) {
  console.error("PDF GENERATION ERROR:", e);
}
