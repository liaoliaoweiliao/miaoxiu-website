param([string]$Destination, [switch]$Cancel)
$ErrorActionPreference = 'Stop'
$Destination = $Destination.Replace('/', '\')
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class MiaoNativeSave {
    public delegate bool Visitor(IntPtr hwnd, IntPtr arg);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr FindWindow(string cls, string title);
    [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr parent, Visitor visitor, IntPtr arg);
    [DllImport("user32.dll")] public static extern int GetDlgCtrlID(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hwnd, uint msg, IntPtr param, IntPtr value);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder value, int size);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder value, int size);
    public static string Text(IntPtr hwnd) {var text=new StringBuilder(2048);GetWindowText(hwnd,text,text.Capacity);return text.ToString();}
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr hwnd, uint msg, IntPtr param, string value);
    [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hwnd, uint msg, IntPtr param, IntPtr value);
    public static IntPtr Child(IntPtr parent, int id, string cls) {
        IntPtr result=IntPtr.Zero;
        EnumChildWindows(parent, (hwnd,arg) => {
            var name=new StringBuilder(256); GetClassName(hwnd,name,name.Capacity);
            if(GetDlgCtrlID(hwnd)==id && IsWindowVisible(hwnd) && name.ToString().Equals(cls,StringComparison.OrdinalIgnoreCase)) {result=hwnd;return false;}
            return true;
        },IntPtr.Zero);
        return result;
    }
}
"@
$dialogTitle = -join (0x4fdd, 0x5b58, 0x82d7, 0x7ee3, 0x56fe, 0x7247 | ForEach-Object { [char]$_ })
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
    $saveWindow = [MiaoNativeSave]::FindWindow('#32770', $dialogTitle)
    if ($saveWindow -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 200 }
} until ($saveWindow -ne [IntPtr]::Zero -or [DateTime]::UtcNow -gt $deadline)
if ($saveWindow -eq [IntPtr]::Zero) { throw 'Native Save As dialog did not appear' }
if (!$Cancel) {
    $controlDeadline = [DateTime]::UtcNow.AddSeconds(10)
    do {
        $edit = [MiaoNativeSave]::Child($saveWindow, 1001, 'Edit')
        if ($edit -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 200 }
    } until ($edit -ne [IntPtr]::Zero -or [DateTime]::UtcNow -gt $controlDeadline)
    if ($edit -eq [IntPtr]::Zero) { throw 'Native filename Edit HWND not found' }
    [void][MiaoNativeSave]::SendMessage($edit, 0x000C, [IntPtr]::Zero, $Destination)
    Write-Output ('Filename value: ' + [MiaoNativeSave]::Text($edit))
}
$buttonId = if ($Cancel) { 2 } else { 1 }
$controlDeadline = [DateTime]::UtcNow.AddSeconds(10)
do {
    $button = [MiaoNativeSave]::Child($saveWindow, $buttonId, 'Button')
    if ($button -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 200 }
} until ($button -ne [IntPtr]::Zero -or [DateTime]::UtcNow -gt $controlDeadline)
if ($button -eq [IntPtr]::Zero) { throw 'Native Save/Cancel HWND not found' }
Write-Output ('Button: ' + $buttonId + ' ' + [MiaoNativeSave]::Text($button))
[void][MiaoNativeSave]::PostMessage($button, 0x00F5, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output 'Native Save As dialog handled'
