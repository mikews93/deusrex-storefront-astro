import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * The scroll video add-on (#2309): short AI clips the visitor scrubs through
 * by scrolling, one clip per scene, crossfading into the next.
 *
 * Each scene arrives as ONE WebP sprite of `frames` tiles (`columns` per
 * row) plus a poster, so a scene is two requests however many frames it has.
 * The canvas blends the two frames either side of the scroll position, which
 * is what makes 30 frames feel continuous.
 *
 * Reduced motion gets the posters and captions as a plain stack: the same
 * story, nothing that moves.
 */
export interface ScrollVideoScene {
  sprite: string;
  poster: string;
  caption: string;
  frames: number;
  columns: number;
}

interface Props {
  scenes: ScrollVideoScene[];
}

/** The last part of each scene that blends into the next one. */
const CROSSFADE = 0.18;
/** Retina sharpness without a 3x canvas on phones that report 3. */
const MAX_DPR = 2;

interface LoadedScene {
  poster?: HTMLImageElement;
  sprite?: HTMLImageElement;
}

export default function ScrollVideoIsland({ scenes }: Props): JSX.Element | null {
  /** State */
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  /** Hooks */
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedScene[]>(scenes.map(() => ({})));

  /** Effects */
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion || scenes.length === 0) return;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!track || !canvas || !context) return;

    let frameRequest = 0;
    const draw = () => {
      frameRequest = 0;
      const position = scrollPosition(track, scenes.length);
      setActiveScene(position.caption);
      paint(context, canvas, scenes, loadedRef.current, position);
    };
    const schedule = () => {
      if (!frameRequest) frameRequest = requestAnimationFrame(draw);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      schedule();
    };

    // Posters first so the stage is never empty, then sprites in scene
    // order, starting only when the section is about to scroll into view.
    let cancelled = false;
    const load = async () => {
      for (const [i, scene] of scenes.entries()) {
        loadedRef.current[i].poster = await loadImage(scene.poster);
        if (cancelled) return;
        schedule();
      }
      for (const [i, scene] of scenes.entries()) {
        loadedRef.current[i].sprite = await loadImage(scene.sprite);
        if (cancelled) return;
        schedule();
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        void load();
      },
      { rootMargin: '150% 0px' },
    );
    observer.observe(track);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener('scroll', schedule, { passive: true });
    resize();

    return () => {
      cancelled = true;
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      if (frameRequest) cancelAnimationFrame(frameRequest);
    };
  }, [reducedMotion, scenes]);

  /** Conditional rendering */
  if (scenes.length === 0) return null;

  if (reducedMotion) {
    return (
      <section className="sc-section sc-scroll-video sc-scroll-video--still">
        {scenes.map((scene) => (
          <figure key={scene.sprite} className="sc-scroll-video__still">
            <img src={scene.poster} alt="" loading="lazy" />
            {scene.caption && (
              <figcaption className="sc-scroll-video__caption">{scene.caption}</figcaption>
            )}
          </figure>
        ))}
      </section>
    );
  }

  return (
    <section
      className="sc-scroll-video"
      style={{ '--sv-scenes': scenes.length } as CSSProperties}
    >
      <div ref={trackRef} className="sc-scroll-video__track">
        <div className="sc-scroll-video__stage">
          <canvas ref={canvasRef} className="sc-scroll-video__canvas" aria-hidden="true" />
          <div className="sc-scroll-video__shade" aria-hidden="true" />
          {scenes.map((scene, i) =>
            scene.caption ? (
              <p
                key={scene.sprite}
                className={`sc-scroll-video__caption${
                  i === activeScene ? ' is-active' : ''
                }`}
              >
                {scene.caption}
              </p>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}

interface ScrollPosition {
  scene: number;
  /** 0..1 through the current scene. */
  progress: number;
  /** 0..1 of the next scene showing over this one. */
  blend: number;
  caption: number;
}

/** Where the visitor is in the track, in scenes. */
function scrollPosition(track: HTMLElement, count: number): ScrollPosition {
  const rect = track.getBoundingClientRect();
  const travel = Math.max(rect.height - window.innerHeight, 1);
  const overall = clamp(-rect.top / travel, 0, 1) * count;
  const scene = Math.min(Math.floor(overall), count - 1);
  const progress = overall - scene;
  const blend =
    scene < count - 1 ? clamp((progress - (1 - CROSSFADE)) / CROSSFADE, 0, 1) : 0;
  return { scene, progress, blend, caption: blend > 0.5 ? scene + 1 : scene };
}

function paint(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scenes: ScrollVideoScene[],
  loaded: LoadedScene[],
  position: ScrollPosition,
): void {
  context.globalAlpha = 1;
  drawScene(context, canvas, scenes[position.scene], loaded[position.scene], position.progress);
  if (position.blend > 0) {
    context.globalAlpha = position.blend;
    drawScene(context, canvas, scenes[position.scene + 1], loaded[position.scene + 1], 0);
    context.globalAlpha = 1;
  }
}

/** One scene at `progress`, blending the two frames either side of it. */
function drawScene(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  scene: ScrollVideoScene,
  loaded: LoadedScene,
  progress: number,
): void {
  const { sprite, poster } = loaded;
  if (!sprite) {
    if (poster) drawCover(context, canvas, poster, 0, 0, poster.naturalWidth, poster.naturalHeight);
    return;
  }
  const rows = Math.ceil(scene.frames / scene.columns);
  const width = sprite.naturalWidth / scene.columns;
  const height = sprite.naturalHeight / rows;
  const exact = progress * (scene.frames - 1);
  const first = Math.floor(exact);
  const second = Math.min(first + 1, scene.frames - 1);
  const alpha = context.globalAlpha;
  const tile = (frame: number) =>
    drawCover(
      context,
      canvas,
      sprite,
      (frame % scene.columns) * width,
      Math.floor(frame / scene.columns) * height,
      width,
      height,
    );
  tile(first);
  if (second !== first && exact > first) {
    context.globalAlpha = alpha * (exact - first);
    tile(second);
    context.globalAlpha = alpha;
  }
}

/** Fills the canvas like `object-fit: cover`. */
function drawCover(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): void {
  const scale = Math.max(canvas.width / sw, canvas.height / sh);
  const cropW = canvas.width / scale;
  const cropH = canvas.height / scale;
  context.drawImage(
    image,
    sx + (sw - cropW) / 2,
    sy + (sh - cropH) / 2,
    cropW,
    cropH,
    0,
    0,
    canvas.width,
    canvas.height,
  );
}

async function loadImage(src: string): Promise<HTMLImageElement | undefined> {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  try {
    await image.decode();
    return image;
  } catch {
    // A missing frame sheet leaves the poster up; it must not break the page.
    return undefined;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
