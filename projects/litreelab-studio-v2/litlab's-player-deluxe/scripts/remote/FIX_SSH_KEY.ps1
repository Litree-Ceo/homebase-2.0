$k = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDF0X9WRsUPaLRCHF7p05mu4t5FtMuSNUmbFxrUYSkod u0_a242@localhost'
$f = 'C:\ProgramData\ssh\administrators_authorized_keys'

Write-Host "Writing key to $f ..."
[System.IO.File]::WriteAllText($f, $k, [System.Text.Encoding]::ASCII)

Write-Host "Setting permissions..."
icacls $f /inheritance:r
icacls $f /grant "NT AUTHORITY\SYSTEM:(F)"
icacls $f /grant "BUILTIN\Administrators:(F)"

Write-Host ""
Write-Host "=== KEY WRITTEN ==="
[System.IO.File]::ReadAllText($f)
Write-Host ""
Write-Host "=== ACL ==="
icacls $f

Write-Host ""
Write-Host "Restarting sshd..."
Restart-Service sshd
Write-Host "sshd restarted. SSH key auth is ready."
Write-Host ""
Write-Host "Now test from Termux:  ssh overlord"
Read-Host "Press Enter to close"
