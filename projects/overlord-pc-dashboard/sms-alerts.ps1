# SMS Alert Configuration
# Format: phone_number@carrier-gateway.com
# Examples:
#   Verizon: 1234567890@vtext.com
#   AT&T: 1234567890@txt.att.net
#   T-Mobile: 1234567890@tmomail.net
#   Sprint: 1234567890@messaging.sprintpcs.com

$SMS_ALERT_NUMBER = "YOURNUMBER@vtext.com"  # CHANGE THIS
$SMS_FROM_EMAIL = "overlord-alerts@gmail.com"  # Your Gmail
$SMS_FROM_PASSWORD = "YOUR_APP_PASSWORD"  # Gmail App Password

function Send-SMSAlert {
    param($Message)
    
    $smtp = "smtp.gmail.com"
    $port = 587
    
    $securePassword = ConvertTo-SecureString $SMS_FROM_PASSWORD -AsPlainText -Force
    $credentials = New-Object System.Management.Automation.PSCredential($SMS_FROM_EMAIL, $securePassword)
    
    Send-MailMessage -To $SMS_ALERT_NUMBER -From $SMS_FROM_EMAIL -Subject "Overlord Alert" -Body $Message -SmtpServer $smtp -Port $port -UseSsl -Credential $credentials -ErrorAction SilentlyContinue
}
