; Custom NSIS installer script for dual shortcuts
!macro customInstall
  DetailPrint "Creating Desktop and Start Menu Shortcuts..."
  
  ; Desktop Shortcuts
  CreateShortcut "$DESKTOP\CV Workshop.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--app=cv-workshop" "$INSTDIR\resources\app\build\cv_workshop.ico" 0
  CreateShortcut "$DESKTOP\Fruit Ninja.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--app=fruit-ninja" "$INSTDIR\resources\app\build\fruit_ninja.ico" 0
  
  ; Start Menu Shortcuts
  CreateShortcut "$SMPROGRAMS\CV Workshop.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--app=cv-workshop" "$INSTDIR\resources\app\build\cv_workshop.ico" 0
  CreateShortcut "$SMPROGRAMS\Fruit Ninja.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--app=fruit-ninja" "$INSTDIR\resources\app\build\fruit_ninja.ico" 0
!macroend

!macro customUnInstall
  Delete "$DESKTOP\CV Workshop.lnk"
  Delete "$DESKTOP\Fruit Ninja.lnk"
  Delete "$SMPROGRAMS\CV Workshop.lnk"
  Delete "$SMPROGRAMS\Fruit Ninja.lnk"
!macroend
