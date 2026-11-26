import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Bg, prog } from './kit';
import { loadFonts } from './fonts';
import { SCENES, FPS } from './theme';
import { OV, Scene1, Scene2, Scene3 } from './scenes1';
import { Institutional, Scene4, Scene5, Scene6, Scene7 } from './scenes2';

const Fade: React.FC<{ children: React.ReactNode; dur: number; withIn: boolean }> = ({ children, withIn }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: withIn ? prog(f, 0, OV, (t) => t) : 1 }}>{children}</AbsoluteFill>;
};

export const Trailer: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [handle] = useState(() => delayRender('fuentes'));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
  }, [handle]);
  const comps = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];
  const endFade = interpolate(f, [durationInFrames - 14, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#040907' }}>
      <Bg />
      {SCENES.map((s, i) => {
        const Comp = comps[i];
        const start = s.from * FPS - (i > 0 ? OV : 0);
        const dur = (s.to - s.from) * FPS + (i > 0 ? OV : 0);
        return (
          <Sequence key={s.name} from={start} durationInFrames={i === 6 ? 105 + OV : dur}>
            <Fade dur={dur} withIn={i > 0}><Comp /></Fade>
          </Sequence>
        );
      })}
      <Sequence from={Math.round(41.5 * FPS) - OV} durationInFrames={durationInFrames - Math.round(41.5 * FPS) + OV}>
        <Institutional />
      </Sequence>
      <AbsoluteFill style={{ background: '#000', opacity: 1 - endFade }} />
    </AbsoluteFill>
  );
};
