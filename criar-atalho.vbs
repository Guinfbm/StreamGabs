REM Script para criar atalho de desktop para StraemGab
REM Execute este arquivo uma vez para criar um atalho no desktop

Set objShell = CreateObject("WScript.Shell")
strDesktop = objShell.SpecialFolders("Desktop")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Set objLink = objShell.CreateShortcut(strDesktop & "\StraemGab.lnk")
objLink.TargetPath = strPath & "\iniciar-server.bat"
objLink.WorkingDirectory = strPath
objLink.IconLocation = strPath & "\icons\icon.svg"
objLink.Description = "StraemGab - Soundboard App"
objLink.Save

MsgBox "✓ Atalho criado no Desktop!", 64, "StraemGab"
