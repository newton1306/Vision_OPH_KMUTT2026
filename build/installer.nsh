; Custom NSIS installer script for single unified desktop shortcut
!macro customInstall
  DetailPrint "Creating Single Unified Desktop and Start Menu Shortcuts..."
  
  ; Single Desktop Shortcut (Opens directly to unblurred Main Menu)
  CreateShortcut "$DESKTOP\CV Workshop Suite.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\resources\app\build\icon.ico" 0
  
  ; Single Start Menu Shortcut
  CreateShortcut "$SMPROGRAMS\CV Workshop Suite.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\resources\app\build\icon.ico" 0
!macroend

!macro customUnInstall
  Delete "$DESKTOP\CV Workshop Suite.lnk"
  Delete "$DESKTOP\Vision Workshop Suite.lnk"
  Delete "$SMPROGRAMS\CV Workshop Suite.lnk"
  Delete "$SMPROGRAMS\Vision Workshop Suite.lnk"
  
  ; Clean up legacy shortcuts if upgrading
  Delete "$DESKTOP\CV Workshop.lnk"
  Delete "$DESKTOP\Fruit Ninja.lnk"
  Delete "$SMPROGRAMS\CV Workshop.lnk"
  Delete "$SMPROGRAMS\Fruit Ninja.lnk"
!macroend
