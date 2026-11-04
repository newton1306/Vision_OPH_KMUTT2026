using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace KioskGuard
{
    static class Program
    {
        private const int WH_KEYBOARD_LL = 13;
        private const int VK_TAB = 0x09;
        private const int VK_ESCAPE = 0x1B;
        private const int VK_SPACE = 0x20;
        private const int VK_LWIN = 0x5B;
        private const int VK_RWIN = 0x5C;
        private const int VK_APPS = 0x5D;
        private const int VK_F4 = 0x73;
        private const int VK_F11 = 0x7A;
        private const int VK_F12 = 0x7B;
        private const int VK_A = 0x41;
        private const int VK_C = 0x43;
        private const int VK_V = 0x56;
        private const int VK_CONTROL = 0x11;

        [StructLayout(LayoutKind.Sequential)]
        private struct KBDLLHOOKSTRUCT
        {
            public uint vkCode;
            public uint scanCode;
            public uint flags;
            public uint time;
            public UIntPtr dwExtraInfo;
        }

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;
        private static System.Threading.Timer _watchdogTimer;

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll")]
        private static extern short GetAsyncKeyState(int vKey);

        [STAThread]
        static void Main(string[] args)
        {
            // Fail-safe: Monitor parent process PID. If Electron closes/crashes, terminate guard immediately.
            if (args.Length > 0)
            {
                int ppid;
                if (int.TryParse(args[0], out ppid))
                {
                    try
                    {
                        Process parent = Process.GetProcessById(ppid);
                        parent.EnableRaisingEvents = true;
                        parent.Exited += (s, e) => Application.Exit();

                        // Additional polling timer in case process exits without event notification
                        _watchdogTimer = new System.Threading.Timer(state =>
                        {
                            try
                            {
                                if (parent.HasExited)
                                {
                                    Application.Exit();
                                }
                            }
                            catch
                            {
                                Application.Exit();
                            }
                        }, null, 1000, 1000);
                    }
                    catch
                    {
                        // Parent is already gone
                        return;
                    }
                }
            }

            _hookID = SetHook(_proc);

            Application.ApplicationExit += (s, e) =>
            {
                if (_hookID != IntPtr.Zero)
                {
                    UnhookWindowsHookEx(_hookID);
                    _hookID = IntPtr.Zero;
                }
                if (_watchdogTimer != null)
                {
                    _watchdogTimer.Dispose();
                }
            };

            Application.Run();
        }

        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0)
            {
                KBDLLHOOKSTRUCT k = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
                bool isAlt = (k.flags & 0x20) != 0;
                bool isCtrl = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;

                // 1. ALWAYS ALLOW Alt+C (Authorized Supervisor Emergency Exit)
                if (isAlt && k.vkCode == VK_C)
                {
                    return CallNextHookEx(_hookID, nCode, wParam, lParam);
                }

                // 2. ALWAYS ALLOW Alt+A (Instructor Secret Solution Injection)
                if (isAlt && k.vkCode == VK_A)
                {
                    return CallNextHookEx(_hookID, nCode, wParam, lParam);
                }

                // 3. ALWAYS ALLOW Alt+V (Workshop Session Reset)
                if (isAlt && k.vkCode == VK_V)
                {
                    return CallNextHookEx(_hookID, nCode, wParam, lParam);
                }

                // 3. HARD BLOCK: Windows Keys (VK_LWIN 0x5B, VK_RWIN 0x5C)
                // Disables Start Menu, Win+D, Win+Tab, Win+E, Win+R, etc.
                if (k.vkCode == VK_LWIN || k.vkCode == VK_RWIN)
                {
                    return (IntPtr)1;
                }

                // 4. HARD BLOCK: Context Menu / Apps Key (0x5D)
                if (k.vkCode == VK_APPS)
                {
                    return (IntPtr)1;
                }

                // 5. HARD BLOCK: Tab Key (0x09)
                // Blocks plain Tab, Alt+Tab, Ctrl+Tab, Shift+Tab, Win+Tab
                if (k.vkCode == VK_TAB)
                {
                    return (IntPtr)1;
                }

                // 6. HARD BLOCK: Alt + Escape & Ctrl + Escape (Start Menu shortcuts)
                if (isAlt && k.vkCode == VK_ESCAPE)
                {
                    return (IntPtr)1;
                }
                if (isCtrl && k.vkCode == VK_ESCAPE)
                {
                    return (IntPtr)1;
                }

                // 7. HARD BLOCK: Alt + F4 (Window Close)
                if (isAlt && k.vkCode == VK_F4)
                {
                    return (IntPtr)1;
                }

                // 8. HARD BLOCK: Alt + Space (Window System Menu)
                if (isAlt && k.vkCode == VK_SPACE)
                {
                    return (IntPtr)1;
                }

                // 9. HARD BLOCK: F11 (Fullscreen Toggle) & F12 (DevTools)
                if (k.vkCode == VK_F11 || k.vkCode == VK_F12)
                {
                    return (IntPtr)1;
                }
            }

            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }
    }
}
