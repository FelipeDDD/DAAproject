# Technical cuts only. Original artwork is preserved.
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$folder = Join-Path $root 'public/assets/hud'
$source = [System.Drawing.Bitmap]::new((Join-Path $folder 'hud-gothic-frame.png'))
function Save-Cut($name, $x, $y, $width, $height) {
  $cut = $source.Clone([System.Drawing.Rectangle]::new($x,$y,$width,$height),[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $cut.Save((Join-Path $folder $name),[System.Drawing.Imaging.ImageFormat]::Png)
  $cut.Dispose()
}
try {
  # Orb cut shares the exact origin/scale of the bottom bar. The glass opening
  # is transparent; dragon, candles and metal remain the foreground layer.
  $orb = $source.Clone([System.Drawing.Rectangle]::new(0,0,380,400),[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($orb)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::Transparent)
  $graphics.FillEllipse($brush,92,105,234,224)
  $orb.Save((Join-Path $folder 'orb-front.png'),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $orb.Dispose()

  $bar = $source.Clone([System.Drawing.Rectangle]::new(0,0,$source.Width,$source.Height),[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bar)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.FillRectangle($brush,0,0,380,400)
  $bar.Save((Join-Path $folder 'hud-bar-body.png'),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bar.Dispose(); $brush.Dispose()

  # Plain metal rail and an isolated jewel. No ornament is stretched.
  Save-Cut 'frame-edge-horizontal.png' 700 185 120 22
  $edge = [System.Drawing.Bitmap]::new((Join-Path $folder 'frame-edge-horizontal.png'))
  $edge.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
  $edge.Save((Join-Path $folder 'frame-edge-vertical.png'),[System.Drawing.Imaging.ImageFormat]::Png)
  $edge.Dispose()
  foreach ($corner in @('top-left','top-right','bottom-left','bottom-right')) {
    Save-Cut "frame-$corner.png" 453 163 78 60
  }
} finally { $source.Dispose() }
