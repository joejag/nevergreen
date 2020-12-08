import React, {ReactElement, useEffect, useRef} from 'react'
import {isBlank} from '../common/Utils'
import {isError, isSick, Projects} from '../domain/Project'
import {useSelector} from 'react-redux'
import {getBrokenBuildSoundFx, getPlayBrokenBuildSoundFx} from '../settings/SettingsReducer'

interface BrokenBuildSfxProps {
  readonly projects: Projects;
}

export function useSoundEffect(projects: Projects): void {
  const playBrokenBuildSounds = useSelector(getPlayBrokenBuildSoundFx)
  const brokenBuildFx = useSelector(getBrokenBuildSoundFx)

  useEffect(() => {
    const sfx = createAudio()
    // return () => {
    //   if (sfx) {
    //     sfx.pause()
    //   }
    // }
    void sfx.play()
  }, [])
}

export function BrokenBuildSfx({projects}: BrokenBuildSfxProps): ReactElement | null {
  const sfxNode = useRef<HTMLAudioElement>(null)
  const playBrokenBuildSounds = useSelector(getPlayBrokenBuildSoundFx)
  const brokenBuildFx = useSelector(getBrokenBuildSoundFx)

  useEffect(() => {
    const sfx = sfxNode.current
    return () => {
      if (sfx) {
        sfx.pause()
      }
    }
  }, [])

  const projectIsBroken = projects.some((project) => isError(project) || isSick(project))
  const playBrokenSfx = playBrokenBuildSounds && !isBlank(brokenBuildFx) && projectIsBroken

  if (!playBrokenSfx) {
    return null
  }

  return (
    <audio ref={sfxNode}
           src={brokenBuildFx}
           autoPlay
           data-locator='broken-build-sound'/>
  )
}

export function createAudio(): HTMLAudioElement {
  return new Audio()
}
