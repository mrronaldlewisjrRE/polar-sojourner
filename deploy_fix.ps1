# Deploy Fix Script - Robust Version
$remoteUrl = "https://github.com/RonaldLewisJrAi/polar-sojourner.git"

Write-Host "--- CDH Platform Deployment Helper ---" -ForegroundColor Cyan
Write-Host "Target: $remoteUrl" -ForegroundColor Gray

# 1. Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Error "Current folder is NOT a git repository. Please run this from the project root."
    exit 1
}

# 2. Reset Remote to ensure it's correct
Write-Host "Configuring remote..." -NoNewline
git remote remove origin 2>$null
git remote add origin $remoteUrl
Write-Host "Done." -ForegroundColor Green

# 3. Prompt for Token
Write-Host "`nCRITICAL: You need a Personal Access Token (Classic) with 'repo' scope." -ForegroundColor Yellow
$token = Read-Host -Prompt "Paste your GitHub Token (Input hidden)" -AsSecureString
$tokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
    Write-Error "Token cannot be empty."
    exit 1
}

# 4. Construct Auth URL
# We use the token acting as the username for Basic Auth which works for PATs
$authUrl = $remoteUrl.Replace("https://", "https://$tokenPlain@")

# 5. Push
Write-Host "`nAttempting push to main..." -ForegroundColor Cyan
try {
    # We use Start-Process to hide the token from the process list if possible, 
    # but git needs it in the URL or via credential helper. 
    # For this script, we'll run it directly but mask output on error if possible.
    
    # Simple push (output will show error if fails)
    git push $authUrl main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS! Deployed to GitHub." -ForegroundColor Green
        Write-Host "Vercel should pick up the change in ~2 minutes." -ForegroundColor Gray
    } else {
        Write-Host "`nFAILED. Please check your token permissions (Repo scope)." -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
