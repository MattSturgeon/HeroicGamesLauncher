import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleSwitch } from 'frontend/components/UI'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import ContextProvider from 'frontend/state/ContextProvider'
import { useSharedConfig } from 'frontend/hooks/config'

const EacRuntime = () => {
  const { t } = useTranslation()
  const [installing, setInstalling] = useState(false)
  const [eacRuntime, setEacRuntime, eacConfigFetched] =
    useSharedConfig('eacRuntime')
  const [useGameMode, setUseGameMode, gameModeConfigFetched] =
    useSharedConfig('gameMode')
  const { showDialogModal, platform } = useContext(ContextProvider)

  if (!eacConfigFetched || !gameModeConfigFetched) return <></>

  if (platform !== 'linux') {
    return null
  }

  const handleEacRuntime = async () => {
    if (!eacRuntime) {
      if (!useGameMode) {
        const isFlatpak = await window.api.isFlatpak()
        if (isFlatpak) {
          showDialogModal({
            showDialog: true,
            message: t(
              'settings.eacRuntime.gameModeRequired.message',
              'GameMode is required for the EAC runtime to work on Flatpak. Do you want to enable it now?'
            ),
            title: t(
              'settings.eacRuntime.gameModeRequired.title',
              'GameMode required'
            ),
            buttons: [
              {
                text: t('box.yes'),
                onClick: async () => setUseGameMode(!useGameMode)
              },
              { text: t('box.no') }
            ]
          })
        }
      }
      const isInstalled = await window.api.isRuntimeInstalled('eac_runtime')
      if (!isInstalled) {
        setInstalling(true)
        const success = await window.api.downloadRuntime('eac_runtime')
        setInstalling(false)
        if (!success) {
          return
        }
      }
    }
    setEacRuntime(!eacRuntime)
  }
  return (
    <div className="toggleRow">
      <ToggleSwitch
        htmlId="eacRuntime"
        value={eacRuntime}
        handleChange={handleEacRuntime}
        title={t('settings.eacRuntime.name', 'EasyAntiCheat Runtime')}
      />
      {installing && (
        <span>
          <FontAwesomeIcon className="fa-spin" icon={faSyncAlt} />
          {t('settings.eacRuntime.installing', 'Installing EAC Runtime...')}
        </span>
      )}
    </div>
  )
}

export default EacRuntime
