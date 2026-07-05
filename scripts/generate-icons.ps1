Add-Type -AssemblyName System.Drawing

$sizes = @{16 = "icon16.png"; 48 = "icon48.png"; 128 = "icon128.png"}
$outputDir = "$PSScriptRoot\..\icons"

$pink = [System.Drawing.Color]::FromArgb(243, 127, 150)
$pinkDark = [System.Drawing.Color]::FromArgb(212, 96, 120)
$yellow = [System.Drawing.Color]::FromArgb(249, 241, 137)
$cream = [System.Drawing.Color]::FromArgb(240, 232, 216)

foreach ($size in $sizes.Keys) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $sz = $size
    $half = $sz / 2

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $sz, $sz)

    $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $brush.CenterColor = $pink
    $brush.SurroundColors = @($pinkDark)
    $brush.CenterPoint = New-Object System.Drawing.PointF(($half * 0.7), ($half * 0.7))
    $g.FillEllipse($brush, 0, 0, $sz, $sz)

    $hlColor = [System.Drawing.Color]::FromArgb(35, 255, 255, 255)
    $hlBrush = New-Object System.Drawing.SolidBrush($hlColor)
    $hlInset = [int]($sz * 0.1)
    $hlSize = [int]($sz * 0.8)
    $g.FillEllipse($hlBrush, $hlInset, $hlInset, $hlSize, $hlSize)

    $creamBrush = New-Object System.Drawing.SolidBrush($cream)
    $yellowBrush = New-Object System.Drawing.SolidBrush($yellow)

    if ($sz -ge 48) {
        $fs = [Math]::Max(8, [int]($sz * 0.38))
        $font = New-Object System.Drawing.Font("Segoe UI", $fs, [System.Drawing.FontStyle]::Bold)
        $fmt = New-Object System.Drawing.StringFormat
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF(0, 0, $sz, $sz)
        $g.DrawString("DJ", $font, $creamBrush, $rect, $fmt)

        $starSize = [int]($sz * 0.12)
        $sf = New-Object System.Drawing.Font("Segoe UI", $starSize)
        $starX = [int]($sz * 0.72)
        $starY = [int]($sz * 0.2)
        $g.DrawString([char]0x2605, $sf, $yellowBrush, $starX, $starY)
    } else {
        $fs = [Math]::Max(6, [int]($sz * 0.45))
        $font = New-Object System.Drawing.Font("Segoe UI", $fs, [System.Drawing.FontStyle]::Bold)
        $fmt = New-Object System.Drawing.StringFormat
        $fmt.Alignment = [System.Drawing.StringAlignment]::Center
        $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF(0, 0, $sz, $sz)
        $g.DrawString("D", $font, $creamBrush, $rect, $fmt)
    }

    $g.Dispose()
    $path.Dispose()
    $brush.Dispose()
    $creamBrush.Dispose()
    $yellowBrush.Dispose()
    $hlBrush.Dispose()

    $out = Join-Path $outputDir $sizes[$size]
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $out"
}
