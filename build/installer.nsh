!macro customInstall
  DetailPrint "Register sayo URI Handler"
  DeleteRegKey HKCR "sayo"
  WriteRegStr HKCR "sayo" "" "URL:sayo"
  WriteRegStr HKCR "sayo" "URL Protocol" ""
  WriteRegStr HKCR "sayo\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "sayo\shell" "" ""
  WriteRegStr HKCR "sayo\shell\Open" "" ""
  WriteRegStr HKCR "sayo\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend