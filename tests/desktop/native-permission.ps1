param([int]$Port, [switch]$Allow)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class MiaoPermission {
    public delegate bool Visitor(IntPtr hwnd, IntPtr arg);
    [DllImport("user32.dll")] public static extern bool EnumWindows(Visitor visitor, IntPtr arg);
    [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr parent, Visitor visitor, IntPtr arg);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder value, int size);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hwnd, uint msg, IntPtr param, IntPtr value);
    public static string Text(IntPtr hwnd) {var s=new StringBuilder(2048);GetWindowText(hwnd,s,s.Capacity);return s.ToString();}
    public static IntPtr Find(uint pid, string title) {
        IntPtr result=IntPtr.Zero;
        EnumWindows((hwnd,arg)=>{uint id;GetWindowThreadProcessId(hwnd,out id);if(id==pid&&Text(hwnd)==title&&IsWindowVisible(hwnd)){result=hwnd;return false;}return true;},IntPtr.Zero);
        return result;
    }
    public static IntPtr Button(IntPtr parent, string label) {
        IntPtr result=IntPtr.Zero;
        EnumChildWindows(parent,(hwnd,arg)=>{if(Text(hwnd).Replace("&", "")==label&&IsWindowVisible(hwnd)){result=hwnd;return false;}return true;},IntPtr.Zero);
        return result;
    }
}
'@
$targetIds = @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*--remote-debugging-port=$Port*" -and $_.CommandLine -notmatch '--type=' } | Select-Object -ExpandProperty ProcessId)
$title = -join (0x82d7, 0x7ee3, 0x8bbe, 0x5907, 0x6743, 0x9650 | ForEach-Object { [char]$_ })
$label = if ($Allow) { -join (0x5141, 0x8bb8, 0x5f00, 0x542f | ForEach-Object { [char]$_ }) } else { -join (0x6682, 0x4e0d, 0x5f00, 0x542f | ForEach-Object { [char]$_ }) }
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
    foreach ($targetId in $targetIds) {
        $dialogHandle = [MiaoPermission]::Find($targetId, $title)
        if ($dialogHandle -ne [IntPtr]::Zero) {
            $buttonHandle = [MiaoPermission]::Button($dialogHandle, $label)
            if ($buttonHandle -ne [IntPtr]::Zero) {
                [void][MiaoPermission]::PostMessage($buttonHandle, 0x00F5, [IntPtr]::Zero, [IntPtr]::Zero)
                Write-Output 'Native device permission dialog handled'
                exit 0
            }
        }
    }
    Start-Sleep -Milliseconds 200
} until ([DateTime]::UtcNow -gt $deadline)
throw 'Test app native device permission dialog/button did not appear'
