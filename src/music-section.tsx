import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FlowButton, FlowLink } from '@/components/ui/flow-button'
import DiscCascadeCarousel, { type DiscCascadeItem } from '@/components/ui/disc-cascade-carousel'

const MusicCarousel = memo(DiscCascadeCarousel)

// Spotify artist Top tracks, retrieved November 18, 2026.
const tracks = [
  {
    "title": "messy",
    "artist": "Łaszewo",
    "duration": "3:27",
    "id": "3CPhCNH8rV1czzGSmXm9TH",
    "preview": "https://p.scdn.co/mp3-preview/5afb5133f732c40ab6ec822c81ae2673e94a5bfa"
  },
  {
    "title": "HIGHJACK (right back)",
    "artist": "Alok, Łaszewo, A$AP Rocky",
    "duration": "2:41",
    "id": "1Eqdkt6DfGNWElHpeujHGJ",
    "preview": "https://p.scdn.co/mp3-preview/ec2aa978d0aa75eb24054af59554e0e63d44537e"
  },
  {
    "title": "3am",
    "artist": "Łaszewo",
    "duration": "2:52",
    "id": "7qAuCJDxFwt6Zp8WWVK15h",
    "preview": "https://p.scdn.co/mp3-preview/2e9d617cb894c0c0d12d918a53191549823fc079"
  },
  {
    "title": "collide",
    "artist": "Łaszewo",
    "duration": "4:13",
    "id": "1i2mlzAv7HAAMMSZyUJ2B2",
    "preview": "https://p.scdn.co/mp3-preview/4d4bfb89ebc4bc516f7145c91a061982c5ce7e5e"
  },
  {
    "title": "SPEND THE WEEK",
    "artist": "Łaszewo",
    "duration": "2:45",
    "id": "6kqtPbQoUOI4NQow6qGGnp",
    "preview": "https://p.scdn.co/mp3-preview/956698a7c492d60bcb88e178e716a9b1fdfedb92"
  },
  {
    "title": "THINK ABOUT US",
    "artist": "Łaszewo",
    "duration": "3:12",
    "id": "40kozRGxfmRAofu3ueL0Kj",
    "preview": "https://p.scdn.co/mp3-preview/8da0e9aebe29d979a8a6f90756b88eadc457056b"
  },
  {
    "title": "3am - Nic Vans Remix",
    "artist": "Łaszewo, Nic Vans",
    "duration": "2:44",
    "id": "0GBxBb2d4BlTiwbaQuQARv",
    "preview": "https://p.scdn.co/mp3-preview/9892ec9adce6331c2cc1bce90cda946520648b91"
  },
  {
    "title": "GIMME LOVE",
    "artist": "Łaszewo",
    "duration": "2:49",
    "id": "2z8xRuTyWedWWAKSWvI9O2",
    "preview": "https://p.scdn.co/mp3-preview/b87b7b1280d5afda4c92bbfdd931e0e7214934d6"
  },
  {
    "title": "Fuck Your Sunshine (Adventure Club Remix)",
    "artist": "Łaszewo, Adventure Club",
    "duration": "3:44",
    "id": "6QvldZZ10eYgKamaWfG52b",
    "preview": "https://p.scdn.co/mp3-preview/92050b02cac88c06b940d2622f023806ce1bb1e0"
  },
  {
    "title": "Headed Back Home (Life's in Color)",
    "artist": "Łaszewo",
    "duration": "4:03",
    "id": "7M6TyRzI5dYey0ths1WJFn",
    "preview": "https://p.scdn.co/mp3-preview/22f7a7caea0e6c05e015e1122f9c227cdb9ed970"
  }
]
const discs: DiscCascadeItem[] = tracks.map(track => ({
  title: track.title,
  src: `assets/${track.id}.jpg`,
  alt: `${track.title} cover artwork`,
  label: '',
  fine: '',
  credits: [{ label: 'Artist', value: track.artist }, { label: 'Length', value: track.duration }],
}))

function MusicSection() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Select a disc. Press play for a preview.')
  const activeRef = useRef(0)
  const requestRef = useRef(0)
  const sourceRef = useRef<number | null>(null)
  const playbackIntentRef = useRef(false)
  const audioRef = useRef(document.querySelector<HTMLAudioElement>('#preview-audio'))
  const track = tracks[active]

  const startPreview = useCallback(async (index: number) => {
    const audio = audioRef.current
    if (!audio) return
    const request = ++requestRef.current
    playbackIntentRef.current = true
    if (sourceRef.current !== index) {
      audio.src = tracks[index].preview
      sourceRef.current = index
    }
    audio.volume = 0.65
    setLoading(true)
    setMessage(`Loading ${tracks[index].title} preview…`)
    try {
      await audio.play()
      if (request === requestRef.current) {
        setLoading(false)
        setMessage(`Playing a preview of ${tracks[index].title}.`)
      }
    } catch (error) {
      if (request === requestRef.current) {
        playbackIntentRef.current = false
        setLoading(false)
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setMessage('Preview unavailable. Listen to the full track on Spotify.')
        }
      }
    }
  }, [])

  const selectTrack = useCallback((index: number) => {
    if (index === activeRef.current) return
    const continuePlaying = playbackIntentRef.current
    ++requestRef.current
    audioRef.current?.pause()
    activeRef.current = index
    setActive(index)
    setLoading(false)
    setPlaying(false)
    setProgress(0)
    setMessage('Select a disc. Press play for a preview.')
    if (continuePlaying) void startPreview(index)
  }, [startPreview])

  const togglePreview = useCallback((index: number) => {
    const audio = audioRef.current
    if (!audio) return
    if (index !== activeRef.current) {
      selectTrack(index)
      if (!playbackIntentRef.current) void startPreview(index)
      return
    }
    if (playbackIntentRef.current) {
      playbackIntentRef.current = false
      ++requestRef.current
      audio.pause()
      setLoading(false)
      setPlaying(false)
      setMessage(`${tracks[index].title} preview paused.`)
      return
    }
    void startPreview(index)
  }, [selectTrack, startPreview])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const sync = () => {
      const isPlaying = !audio.paused && !audio.ended
      setPlaying(isPlaying)
      window.dispatchEvent(new CustomEvent('laszewo:playback', { detail: { playing: isPlaying, index: activeRef.current } }))
    }
    const time = () => { if (sourceRef.current === activeRef.current) setProgress(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration * 100 : 0) }
    const ended = () => { sync(); if (sourceRef.current !== activeRef.current) return; playbackIntentRef.current = false; setMessage('Listen to the full track on Spotify.'); setLoading(false) }
    const error = () => { sync(); if (sourceRef.current !== activeRef.current) return; playbackIntentRef.current = false; setLoading(false); setMessage('Preview unavailable. Listen to the full track on Spotify.') }
    audio.addEventListener('play', sync)
    audio.addEventListener('pause', sync)
    audio.addEventListener('timeupdate', time)
    audio.addEventListener('ended', ended)
    audio.addEventListener('error', error)
    return () => {
      audio.removeEventListener('play', sync)
      audio.removeEventListener('pause', sync)
      audio.removeEventListener('timeupdate', time)
      audio.removeEventListener('ended', ended)
      audio.removeEventListener('error', error)
    }
  }, [])

  useEffect(() => {
    const fromHero = () => { void togglePreview(0) }
    window.addEventListener('laszewo:play', fromHero)
    return () => window.removeEventListener('laszewo:play', fromHero)
  }, [togglePreview])

  const onDiscSelect = useCallback((_: DiscCascadeItem, index: number) => { void togglePreview(index) }, [togglePreview])

  return (
    <div className="music-shell relative w-full" data-playing={playing || undefined} data-title-size={track.title.length > 25 ? 'long' : track.title.length > 8 ? 'medium' : 'short'}>
      <MusicCarousel
        items={discs}
        index={active}
        defaultIndex={0}
        onIndexChange={selectTrack}
        onSelect={onDiscSelect}
        loop
        height="var(--music-height)"
        discSize="var(--music-disc-size)"
        spacing={0.96}
        rise={0.3}
        depth={0.4}
        yaw={-18}
        fan={-9}
        tilt={-8}
        roll={110}
        spin={32}
        sheen={0.48}
        brand=""
        indexLabel="Tracks"
        background="radial-gradient(ellipse at 54% 42%, #30322c 0%, #171917 63%)"
        color="#f5f5ee"
        serif="'Barlow Condensed', Impact, sans-serif"
        sans="'Space Grotesk', Arial, sans-serif"
        display="'Barlow Condensed', Impact, sans-serif"
        reviews={false}
        frame={false}
        hint=""
        ariaLabel="Łaszewo music"
        className="music-cascade"
      />
      <div className="disc-player">
        <div className="disc-actions flex items-center gap-5">
          <FlowButton className="disc-play flow-accent" type="button" onClick={() => { void togglePreview(activeRef.current) }} disabled={loading} aria-label={`${playing ? 'Pause' : 'Play'} ${track.title} preview`}>
            <span className={playing ? 'pause-symbol' : 'play-symbol'} aria-hidden="true" />
            {loading ? 'Loading…' : playing ? 'Pause preview' : 'Play preview'}
          </FlowButton>
          <FlowLink className="disc-spotify" href={`https://open.spotify.com/track/${track.id}`} target="_blank" rel="noopener" aria-label={`Listen to ${track.title} on Spotify`}>
            <img src="assets/icons/spotify.svg" alt="" width="20" height="20" />
            <span><span className="spotify-prefix">Listen on </span>Spotify</span>
          </FlowLink>
        </div>
        <div className="disc-progress" role="progressbar" aria-label={`${track.title} preview playback`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
        <p className="disc-status" role="status" aria-live="polite">{message}</p>
      </div>
    </div>
  )
}

const container = document.getElementById('music-carousel')
if (container) createRoot(container).render(<MusicSection />)
