param(
  [string]$Source = 'public/assets/boss/Imagem Codex 20_09_2026, 08_20_15.png',
  [string]$Output = 'public/assets/boss/director-paper-projectile.png'
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = Join-Path (Get-Location) $Output
$sourceImage = [System.Drawing.Bitmap]::new([string]$sourcePath)
$frameSize = 48
$padding = 2
$frameBounds = @(
  @(19, 167, 322, 379),
  @(372, 159, 352, 369),
  @(724, 138, 295, 433),
  @(1131, 165, 317, 374),
  @(1448, 192, 354, 326),
  @(1833, 167, 320, 380)
)

$sheet = [System.Drawing.Bitmap]::new($frameSize * $frameBounds.Count, $frameSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($sheet)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

for ($index = 0; $index -lt $frameBounds.Count; $index++) {
  $bounds = $frameBounds[$index]
  $sourceRect = [System.Drawing.Rectangle]::new($bounds[0], $bounds[1], $bounds[2], $bounds[3])
  $available = $frameSize - 2 * $padding
  $scale = [Math]::Min($available / $bounds[2], $available / $bounds[3])
  $width = [Math]::Max(1, [Math]::Round($bounds[2] * $scale))
  $height = [Math]::Max(1, [Math]::Round($bounds[3] * $scale))
  $x = $index * $frameSize + [Math]::Floor(($frameSize - $width) / 2)
  $y = [Math]::Floor(($frameSize - $height) / 2)
  $destination = [System.Drawing.Rectangle]::new($x, $y, $width, $height)
  $graphics.DrawImage($sourceImage, $destination, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$graphics.Dispose()
$sourceImage.Dispose()
$sheet.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()
Write-Output "Created $Output (6 frames, ${frameSize}x${frameSize})"
