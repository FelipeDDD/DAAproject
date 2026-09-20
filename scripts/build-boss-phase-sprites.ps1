Add-Type -AssemblyName System.Drawing
if (-not ('BossAlphaComponentExtractor' -as [type])) {
  Add-Type -ReferencedAssemblies System.Drawing @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class BossAlphaComponentExtractor {
  public static Bitmap Extract(Bitmap source, int seedX, int seedY) {
    int width=source.Width, height=source.Height, seed=-1, bestDistance=int.MaxValue;
    for(int y=0;y<height;y++) for(int x=0;x<width;x++) {
      if(source.GetPixel(x,y).A<12) continue;
      int dx=x-seedX,dy=y-seedY,d=dx*dx+dy*dy;
      if(d<bestDistance){bestDistance=d;seed=y*width+x;}
    }
    if(seed<0) throw new InvalidOperationException("No opaque component found.");
    var visited=new bool[width*height];var pixels=new List<int>();var queue=new Queue<int>();
    queue.Enqueue(seed);visited[seed]=true;
    int left=width,right=0,top=height,bottom=0;
    while(queue.Count>0){
      int index=queue.Dequeue(),x=index%width,y=index/width;pixels.Add(index);
      left=Math.Min(left,x);right=Math.Max(right,x);top=Math.Min(top,y);bottom=Math.Max(bottom,y);
      for(int oy=-1;oy<=1;oy++) for(int ox=-1;ox<=1;ox++){
        if(ox==0&&oy==0)continue;int nx=x+ox,ny=y+oy;
        if(nx<0||nx>=width||ny<0||ny>=height)continue;int next=ny*width+nx;
        if(visited[next])continue;visited[next]=true;
        if(source.GetPixel(nx,ny).A>=12)queue.Enqueue(next);
      }
    }
    var output=new Bitmap(right-left+1,bottom-top+1,PixelFormat.Format32bppArgb);
    foreach(int index in pixels){int x=index%width,y=index/width;output.SetPixel(x-left,y-top,source.GetPixel(x,y));}
    return output;
  }
}
'@
}

$bossDir = Join-Path $PSScriptRoot '..\public\assets\boss'
$frameWidth = 128
$frameHeight = 160
$contentWidth = 116
$contentHeight = 152
$footY = 156

function Get-AlphaBounds {
  param([System.Drawing.Bitmap]$Bitmap, [System.Drawing.Rectangle]$Region)
  $left = $Region.Right
  $right = $Region.Left
  $top = $Region.Bottom
  $bottom = $Region.Top
  for ($y = $Region.Top; $y -lt $Region.Bottom; $y += 1) {
    for ($x = $Region.Left; $x -lt $Region.Right; $x += 1) {
      if ($Bitmap.GetPixel($x, $y).A -lt 16) { continue }
      if ($x -lt $left) { $left = $x }
      if ($x -gt $right) { $right = $x }
      if ($y -lt $top) { $top = $y }
      if ($y -gt $bottom) { $bottom = $y }
    }
  }
  if ($right -lt $left -or $bottom -lt $top) { throw "No visible pixels found in $Region" }
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
}

function Get-FrameBoundaries {
  param([System.Drawing.Bitmap]$Bitmap, [int]$FrameCount)
  $boundaries = [System.Collections.Generic.List[int]]::new()
  $boundaries.Add(0)
  for ($index = 1; $index -lt $FrameCount; $index += 1) {
    $expected = [Math]::Round($index * $Bitmap.Width / $FrameCount)
    $bestX = $expected
    $bestCount = [int]::MaxValue
    for ($x = $expected - 90; $x -le $expected + 90; $x += 1) {
      $count = 0
      for ($y = 0; $y -lt $Bitmap.Height; $y += 2) {
        if ($Bitmap.GetPixel($x, $y).A -ge 16) { $count += 1 }
      }
      if ($count -lt $bestCount) { $bestCount = $count; $bestX = $x }
    }
    $boundaries.Add($bestX)
  }
  $boundaries.Add($Bitmap.Width)
  return $boundaries.ToArray()
}

function Export-NormalizedSheet {
  param(
    [string]$SourceName,
    [string]$OutputName,
    [int]$SourceFrameCount,
    [int[]]$FrameIndices,
    [int]$OutputFrameWidth = 128,
    [int]$OutputFrameHeight = 160,
    [int]$OutputContentWidth = 116,
    [int]$OutputContentHeight = 152,
    [int]$OutputFootY = 156
  )
  $source = [System.Drawing.Bitmap]::FromFile((Join-Path $bossDir $SourceName))
  $boundaries = if ($SourceFrameCount -gt 1) { Get-FrameBoundaries $source $SourceFrameCount } else { @(0, $source.Width) }
  $sheet = New-Object System.Drawing.Bitmap ($OutputFrameWidth * $FrameIndices.Count), $OutputFrameHeight,
    ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  for ($outputIndex = 0; $outputIndex -lt $FrameIndices.Count; $outputIndex += 1) {
    $sourceIndex = $FrameIndices[$outputIndex]
    $component = $null
    if ($SourceName -eq 'director-lv3-2.png' -and $sourceIndex -eq 4) {
      # Keep the laser pose, but stop before the next generated body that the
      # glow overlaps in the source reference.
      $sliceLeft = [Math]::Round(3.72 * $source.Width / $SourceFrameCount)
      $sliceRight = [Math]::Round(5.03 * $source.Width / $SourceFrameCount)
      $slice = [System.Drawing.Rectangle]::FromLTRB($sliceLeft, 0, $sliceRight, $source.Height)
      $bounds = Get-AlphaBounds -Bitmap $source -Region $slice
      $drawSource = $source
    } elseif ($SourceName.StartsWith('director-lv3') -and $sourceIndex -lt 4) {
      # Generated poses overlap in their rectangular bounds. Extract the opaque
      # component nearest each pose center so neighboring arms are not copied.
      $seedX = [Math]::Round(($sourceIndex + 0.5) * $source.Width / $SourceFrameCount)
      $seedY = [Math]::Round($source.Height * 0.55)
      $component = [BossAlphaComponentExtractor]::Extract($source, $seedX, $seedY)
      $drawSource = $component
      $bounds = New-Object System.Drawing.Rectangle 0, 0, $component.Width, $component.Height
    } else {
      $sliceLeft = $boundaries[$sourceIndex]
      $sliceRight = $boundaries[$sourceIndex + 1]
      $slice = [System.Drawing.Rectangle]::FromLTRB($sliceLeft + 2, 0, $sliceRight - 2, $source.Height)
      $bounds = Get-AlphaBounds -Bitmap $source -Region $slice
      $drawSource = $source
    }
    $scale = [Math]::Min($OutputContentWidth / $bounds.Width, $OutputContentHeight / $bounds.Height)
    $width = [Math]::Max(1, [Math]::Round($bounds.Width * $scale))
    $height = [Math]::Max(1, [Math]::Round($bounds.Height * $scale))
    $x = $outputIndex * $OutputFrameWidth + [Math]::Round(($OutputFrameWidth - $width) / 2)
    $y = $OutputFootY - $height
    $destination = New-Object System.Drawing.Rectangle $x, $y, $width, $height
    $graphics.DrawImage($drawSource, $destination, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
    if ($null -ne $component) { $component.Dispose() }
  }

  $graphics.Dispose()
  $outputPath = Join-Path $bossDir $OutputName
  $sheet.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Dispose()
  $source.Dispose()
  Write-Output "Generated $OutputName ($($FrameIndices.Count) x ${OutputFrameWidth}x${OutputFrameHeight})"
}

Export-NormalizedSheet 'director-lv1.png' 'director-phase1.png' 4 @(0)
Export-NormalizedSheet 'director-lv2.png' 'director-phase2-intro.png' 6 @(0, 1, 2, 3, 4, 5)
Export-NormalizedSheet 'director-lv3-1.png' 'director-phase3-intro.png' 6 @(0, 1, 2, 3, 4, 5) 192 176 182 168 172
Export-NormalizedSheet 'director-lv3-2.png' 'director-phase3-combat.png' 6 @(0, 1, 2, 4) 192 176 182 168 172
