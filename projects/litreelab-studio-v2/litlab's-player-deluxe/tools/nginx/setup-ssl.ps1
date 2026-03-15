# PowerShell Script to Generate Self-Signed SSL Certificate for Nginx

# --- Configuration ---
$country = "US"
$state = "California"
$locality = "San Francisco"
$organization = "Overlord Systems"
$commonName = "localhost"
$email = "admin@overlord.local"

# --- Paths ---
$nginxPath = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard\tools\nginx"
$sslPath = "$nginxPath\ssl"
$keyPath = "$sslPath\overlord.key"
$certPath = "$sslPath\overlord.crt"

# --- Script ---

# Ensure the SSL directory exists
if (-not (Test-Path -Path $sslPath)) {
    New-Item -ItemType Directory -Path $sslPath
}

# Generate the self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $keyPath -out $certPath -subj "/C=$country/ST=$state/L=$locality/O=$organization/CN=$commonName/emailAddress=$email"

Write-Host "Self-signed SSL certificate generated successfully."
Write-Host "Key: $keyPath"
Write-Host "Certificate: $certPath"