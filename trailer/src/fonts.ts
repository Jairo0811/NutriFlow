import { staticFile } from 'remotion';

const FONTS: [string, string, string][] = [
  ['Poppins-Regular.ttf', '400', 'normal'],
  ['Poppins-Medium.ttf', '500', 'normal'],
  ['Poppins-Bold.ttf', '700', 'normal'],
  ['Poppins-BoldItalic.ttf', '700', 'italic'],
];

export const loadFonts = async () => {
  await Promise.all(
    FONTS.map(async ([file, weight, style]) => {
      const face = new FontFace('Poppins', `url(${staticFile('fonts/' + file)})`, { weight, style });
      await face.load();
      document.fonts.add(face);
    }),
  );
};
