# Prototype registration: reuse Felipe's existing side-view lower-body poses.
# Source sheets stay untouched. Head, torso, hands and front/back rows stay intact.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'public/assets/characters/experimental'
$target = [Drawing.Bitmap]::new((Join-Path $assets 'yassin-stubble-test-v1.png'))
$donor = [Drawing.Bitmap]::new((Join-Path $assets 'felipe-level3-hd.png'))
$mask = [Drawing.Bitmap]::new((Join-Path $assets 'felipe-level3-hd-material-mask.png'))
$output = $target.Clone([Drawing.Rectangle]::new(0,0,768,576),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
  foreach ($bitmap in @($target,$donor,$mask)) {
    if ($bitmap.Width -ne 768 -or $bitmap.Height -ne 576) { throw 'Expected 768x576 registered sheets.' }
  }
  foreach ($row in @(1,2)) {
    for ($col=0;$col -lt 6;$col++) {
      # Keep Yassin's waistband/hip connection above the leg split.
      $donorTop=110
      for ($y=110;$y -lt 144;$y++) {
        for ($x=0;$x -lt 128;$x++) {
          $px=$col*128+$x; $py=$row*144+$y
          $sourceY=$py
          $old=$target.GetPixel($px,$py)
          $color=$donor.GetPixel($px,$sourceY)
          $label=$mask.GetPixel($px,$sourceY)
          $isTrouser=$label.A -gt 0 -and $label.R -eq 0 -and $label.G -eq 0 -and $label.B -eq 255
          $isShoe=$label.A -gt 0 -and $label.R -eq 255 -and $label.G -eq 255 -and $label.B -eq 0
          $nearMaterial=$false
          # Preserve the donor's dark outlines, without copying the drink/accessory.
          if (!$isTrouser -and !$isShoe -and $color.A -gt 0 -and [math]::Max($color.R,[math]::Max($color.G,$color.B)) -le 65) {
            for ($dy=-1;$dy -le 1 -and !$nearMaterial;$dy++) {
              for ($dx=-1;$dx -le 1;$dx++) {
                if ($x+$dx -lt 0 -or $x+$dx -ge 128 -or $sourceY+$dy -lt $row*144+$donorTop -or $sourceY+$dy -ge ($row+1)*144) { continue }
                $n=$mask.GetPixel($px+$dx,$sourceY+$dy)
                if ($n.A -gt 0 -and (($n.R -eq 0 -and $n.G -eq 0 -and $n.B -eq 255) -or ($n.R -eq 255 -and $n.G -eq 255 -and $n.B -eq 0))) { $nearMaterial=$true; break }
              }
            }
          }
          $replacement=[Drawing.Color]::FromArgb(0,0,0,0)
          # Below y=120 there are no accessories; retain the complete boot ink/soles.
          if ($color.A -gt 0 -and ($isTrouser -or $isShoe -or $nearMaterial -or $y -ge 120)) {
            $replacement=$color
            if ($isTrouser) {
              $shade=[math]::Min(1.35,[math]::Max(0.25,($color.R+$color.G+$color.B)/3.0/48.0))
              $replacement=[Drawing.Color]::FromArgb($color.A,[int](24*$shade),[int](94*$shade),[int](158*$shade))
            }
          }
          # Existing Yassin hands sit in front of the transferred trousers.
          if ($old.A -gt 0 -and $old.R-$old.G -gt 18 -and $old.R -gt $old.B*1.25) { $replacement=$old }
          $output.SetPixel($px,$py,$replacement)
        }
      }
    }
  }
  $prefix=Join-Path $assets 'yassin-stubble-test-v2'
  $output.Save("$prefix.png",[Drawing.Imaging.ImageFormat]::Png)
  $idle=$output.Clone([Drawing.Rectangle]::new(0,0,128,144),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try { $idle.Save("$prefix-idle.png",[Drawing.Imaging.ImageFormat]::Png) } finally { $idle.Dispose() }
  $preview=[Drawing.Bitmap]::new(1536,1152,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    for ($y=0;$y -lt 1152;$y++) { for ($x=0;$x -lt 1536;$x++) { $preview.SetPixel($x,$y,$output.GetPixel([int][math]::Floor($x/2),[int][math]::Floor($y/2))) } }
    $preview.Save("$prefix-preview.png",[Drawing.Imaging.ImageFormat]::Png)
  } finally { $preview.Dispose() }
  Write-Output 'Registered v2: side legs from Felipe; blue denim; original Yassin upper body and front/back preserved.'
} finally { $output.Dispose(); $target.Dispose(); $donor.Dispose(); $mask.Dispose() }
