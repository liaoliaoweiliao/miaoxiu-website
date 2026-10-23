param([int]$Port, [int]$Width, [int]$Height, [switch]$Maximize)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class MiaoNativeWindow {
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hwnd, int command);
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int width, int height, uint flags);
}
'@
$windowHandle = [IntPtr]::Zero
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*--remote-debugging-port=$Port*" -and $_.CommandLine -notmatch '--type=' } | ForEach-Object {
    $candidate = (Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue).MainWindowHandle
    if ($candidate -and $candidate -ne [IntPtr]::Zero) { $windowHandle = $candidate }
}
if ($windowHandle -eq [IntPtr]::Zero) { throw 'Test app window not found' }
if ($Maximize) { [void][MiaoNativeWindow]::ShowWindow($windowHandle, 3) }
else {
    [void][MiaoNativeWindow]::ShowWindow($windowHandle, 9)
    $scale = [MiaoNativeWindow]::GetDpiForWindow($windowHandle) / 96
    [void][MiaoNativeWindow]::SetWindowPos($windowHandle, [IntPtr]::Zero, 0, 0, [int]($Width * $scale), [int]($Height * $scale), 0x0006)
}
