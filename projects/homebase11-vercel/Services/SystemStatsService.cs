using System.Runtime.InteropServices;
using System.Diagnostics;

namespace HomeBase11.Services;

public class SystemStatsService
{
    public double GetFreeDiskSpaceGB()
    {
        var drive = new DriveInfo("C");
        return Math.Round(drive.AvailableFreeSpace / 1024.0 / 1024.0 / 1024.0, 1);
    }

    public double GetTotalDiskSpaceGB()
    {
        var drive = new DriveInfo("C");
        return Math.Round(drive.TotalSize / 1024.0 / 1024.0 / 1024.0, 1);
    }

    public int GetFreeSpacePercentage()
    {
        var drive = new DriveInfo("C");
        return (int)((double)drive.AvailableFreeSpace / drive.TotalSize * 100);
    }

    public string GetOsInfo()
    {
        return RuntimeInformation.OSDescription;
    }

    public int GetProcessorCount()
    {
        return Environment.ProcessorCount;
    }
}
