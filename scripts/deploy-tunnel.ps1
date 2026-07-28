# Cloudflare Tunnel 部署脚本
# 适用于：byclaw.help → 10.10.10.1:8800 (Python doc-server)
#
# 使用方法：
# 1. 以管理员身份运行 PowerShell
# 2. 执行：.\deploy-tunnel.ps1
#
# 前置条件：
# - 已安装 Python 3.8+
# - 有 Cloudflare 账号
# - byclaw.help 域名已在 Cloudflare 管理

param(
    [Parameter(Mandatory=$false)]
    [string]$TunnelName = "byclaw-docs",

    [Parameter(Mandatory=$false)]
    [string]$Domain = "byclaw.help",

    [Parameter(Mandatory=$false)]
    [string]$LocalPort = "8800",

    [Parameter(Mandatory=$false)]
    [switch]$Uninstall  # 卸载 Tunnel
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n▶ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor $Color
}

function Test-Admin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# ============================================
# 卸载模式
# ============================================
if ($Uninstall) {
    Write-Step "卸载 Cloudflare Tunnel..." "Red"

    # 停止并删除服务
    $service = Get-Service -Name "Cloudflared-$TunnelName" -ErrorAction SilentlyContinue
    if ($service) {
        Stop-Service -Name "Cloudflared-$TunnelName" -Force
        sc.exe delete "Cloudflared-$TunnelName"
        Write-Host "  ✓ 服务已删除" -ForegroundColor Green
    }

    # 删除配置文件
    $configDir = "$env:ProgramData\cloudflared"
    if (Test-Path $configDir) {
        Remove-Item -Recurse -Force $configDir
        Write-Host "  ✓ 配置已删除" -ForegroundColor Green
    }

    Write-Host "`n✅ 卸载完成。记得在 Cloudflare Dashboard 删除 Tunnel 和 DNS 记录。" -ForegroundColor Green
    exit 0
}

# ============================================
# 检查管理员权限
# ============================================
if (-not (Test-Admin)) {
    Write-Host "❌ 请以管理员身份运行此脚本" -ForegroundColor Red
    Write-Host "   右键 PowerShell → 以管理员身份运行" -ForegroundColor Yellow
    exit 1
}

Write-Step "开始部署 Cloudflare Tunnel"
Write-Host "  Tunnel 名称：$TunnelName"
Write-Host "  域名：$Domain"
Write-Host "  本地端口：$LocalPort"

# ============================================
# 1. 安装 cloudflared
# ============================================
Write-Step "检查 cloudflared..."

$cloudflaredPath = "C:\Program Files\Cloudflare\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "  正在下载 cloudflared..." -ForegroundColor Gray

    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
    $installerPath = "$env:TEMP\cloudflared-installer.msi"

    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing

    Write-Host "  正在安装..." -ForegroundColor Gray
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -NoNewWindow

    Remove-Item $installerPath -Force
    Write-Host "  ✓ cloudflared 已安装" -ForegroundColor Green
} else {
    Write-Host "  ✓ cloudflared 已存在" -ForegroundColor Green
}

# 添加到 PATH
$env:Path = "$env:ProgramData\cloudflared;$env:Path"

# ============================================
# 2. 登录 Cloudflare
# ============================================
Write-Step "登录 Cloudflare 账号..."
Write-Host "  即将打开浏览器进行授权..." -ForegroundColor Gray
Write-Host "  请选择你的账号和域名 ($Domain)" -ForegroundColor Yellow

& "C:\Program Files\Cloudflare\cloudflared.exe" tunnel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 登录失败" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ 登录成功" -ForegroundColor Green

# ============================================
# 3. 创建 Tunnel
# ============================================
Write-Step "创建 Tunnel: $TunnelName..."

$tunnelInfo = & "C:\Program Files\Cloudflare\cloudflared.exe" tunnel create $TunnelName --output json 2>$null

if ($LASTEXITCODE -ne 0) {
    # 可能已存在
    Write-Host "  Tunnel 可能已存在，尝试查询..." -ForegroundColor Yellow
    $tunnelInfo = & "C:\Program Files\Cloudflare\cloudflared.exe" tunnel list --name $TunnelName --output json 2>$null | ConvertFrom-Json | Where-Object { $_.name -eq $TunnelName } | Select-Object -First 1

    if (-not $tunnelInfo) {
        Write-Host "❌ 创建 Tunnel 失败" -ForegroundColor Red
        exit 1
    }
} else {
    $tunnelInfo = $tunnelInfo | ConvertFrom-Json
}

$tunnelId = $tunnelInfo.id
Write-Host "  ✓ Tunnel ID: $tunnelId" -ForegroundColor Green

# ============================================
# 4. 配置 Tunnel 路由
# ============================================
Write-Step "配置 Tunnel 路由..."

$configDir = "$env:ProgramData\cloudflared"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$configYaml = @"
tunnel: $tunnelId
credentials-file: $configDir\$tunnelId.json

ingress:
  - hostname: $Domain
    service: http://localhost:$LocalPort
  - service: http_status:404
"@

$configPath = "$configDir\config.yml"
Set-Content -Path $configPath -Value $configYaml -Encoding UTF8

Write-Host "  ✓ 配置已写入：$configPath" -ForegroundColor Green

# ============================================
# 5. 创建 DNS 记录
# ============================================
Write-Step "创建 DNS CNAME 记录..."

& "C:\Program Files\Cloudflare\cloudflared.exe" tunnel route dns $TunnelName $Domain

if ($LASTEXITCODE -ne 0) {
    Write-Host "   DNS 创建失败，请手动在 Cloudflare Dashboard 添加：" -ForegroundColor Yellow
    Write-Host "    类型：CNAME" -ForegroundColor Gray
    Write-Host "    名称：$Domain" -ForegroundColor Gray
    Write-Host "    目标：$tunnelId.cfargotunnel.com" -ForegroundColor Gray
} else {
    Write-Host "  ✓ DNS 记录已创建：$Domain → $tunnelId.cfargotunnel.com" -ForegroundColor Green
}

# ============================================
# 6. 创建 Windows 服务
# ============================================
Write-Step "创建 Windows 服务（开机自启）..."

$serviceName = "Cloudflared-$TunnelName"
$serviceExists = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($serviceExists) {
    Write-Host "  服务已存在，正在更新..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    sc.exe delete $serviceName | Out-Null
}

sc.exe create $serviceName `
    binPath= "`"C:\Program Files\Cloudflare\cloudflared.exe`" service run" `
    start= auto `
    DisplayName= "Cloudflare Tunnel ($TunnelName)"

sc.exe config $serviceName obj= "LocalSystem"

Write-Host "  ✓ 服务已创建：$serviceName" -ForegroundColor Green

# ============================================
# 7. 启动服务
# ============================================
Write-Step "启动 Tunnel 服务..."

Start-Service -Name $serviceName
Start-Sleep -Seconds 3

$serviceStatus = Get-Service -Name $serviceName
if ($serviceStatus.Status -eq "Running") {
    Write-Host "  ✓ 服务运行中" -ForegroundColor Green
} else {
    Write-Host "   服务未启动，请检查日志" -ForegroundColor Yellow
    Write-Host "    日志位置：$configDir\*.log" -ForegroundColor Gray
}

# ============================================
# 完成
# ============================================
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Step "部署完成！" "Green"
Write-Host "`n访问测试：" -ForegroundColor White
Write-Host "  https://$Domain" -ForegroundColor Cyan
Write-Host "`n管理命令：" -ForegroundColor White
Write-Host "  查看状态：Get-Service $serviceName" -ForegroundColor Gray
Write-Host "  重启服务：Restart-Service $serviceName" -ForegroundColor Gray
Write-Host "  查看日志：Get-Content $configDir\*.log -Tail 50" -ForegroundColor Gray
Write-Host "  卸载脚本：.\deploy-tunnel.ps1 -Uninstall" -ForegroundColor Gray
Write-Host "`nCloudflare Dashboard：" -ForegroundColor White
Write-Host "  https://dash.cloudflare.com/ → Zero Trust → Networks → Tunnels" -ForegroundColor Gray
Write-Host "`n"
