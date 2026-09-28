param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string]$OutputPrefix,
  [int]$Columns = 6,
  [int]$Rows = 4,
  [int]$FrameWidth = 64,
  [int]$FrameHeight = 72,
  [int]$ContentHeight = 66,
  [int]$PreviewScale = 4,
  [int]$AlphaThreshold = 96
)

# Registration only: no pose generation, per-frame stretching or runtime changes.
# The input must already have isolated sprites arranged in transparent rows.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class RegisteredCharacterSheet {
  public static int[][] Bands(Bitmap image, Rectangle area, bool rows, int threshold) {
    var result=new List<int[]>();
    int from=rows?area.Top:area.Left,to=rows?area.Bottom:area.Right;
    for(int line=from;line<to;line++) {
      int count=0;
      for(int other=rows?area.Left:area.Top;other<(rows?area.Right:area.Bottom);other++)
        if(image.GetPixel(rows?other:line,rows?line:other).A>=threshold)count++;
      if(count<3)continue;
      if(result.Count==0 || line-result[result.Count-1][1]>8)result.Add(new int[]{line,line});
      else result[result.Count-1][1]=line;
    }
    return result.ToArray();
  }
  public static Rectangle Bounds(Bitmap image, Rectangle cell, int threshold) {
    int left=cell.Right, top=cell.Bottom, right=-1, bottom=-1;
    for(int y=cell.Top;y<cell.Bottom;y++) for(int x=cell.Left;x<cell.Right;x++) {
      if(image.GetPixel(x,y).A<threshold) continue;
      left=Math.Min(left,x);top=Math.Min(top,y);right=Math.Max(right,x);bottom=Math.Max(bottom,y);
    }
    if(right<left) throw new Exception("Empty source frame.");
    if(left==cell.Left || right==cell.Right-1 || top==cell.Top || bottom==cell.Bottom-1)
      throw new Exception("Sprite touches a source cell boundary. Review the grid before cropping.");
    return Rectangle.FromLTRB(left,top,right+1,bottom+1);
  }
  public static double HeadCenter(Bitmap image, Rectangle b, int threshold) {
    int left=b.Right,right=b.Left;
    for(int y=b.Top+b.Height/12;y<b.Top+b.Height/3;y++) for(int x=b.Left;x<b.Right;x++) {
      if(image.GetPixel(x,y).A<threshold)continue;
      left=Math.Min(left,x);right=Math.Max(right,x);
    }
    return (left+right+1)/2.0;
  }
  public static void CopyFrame(Bitmap input, Bitmap output, Rectangle b,
    int cellX, int cellY, int width, int height, double center, double scale, int threshold) {
    int outWidth=(int)Math.Round(b.Width*scale),outHeight=(int)Math.Round(b.Height*scale);
    int left=(int)Math.Round(width/2.0-(center-b.Left)*scale),top=height-outHeight;
    if(left<1 || left+outWidth>=width || top<1)throw new Exception("Registered frame overflows its cell.");
    for(int y=0;y<outHeight;y++)for(int x=0;x<outWidth;x++) {
      int sx=Math.Min(b.Right-1,b.Left+(int)((x+0.5)*b.Width/outWidth));
      int sy=Math.Min(b.Bottom-1,b.Top+(int)((y+0.5)*b.Height/outHeight));
      Color color=input.GetPixel(sx,sy);
      if(color.A>=threshold)output.SetPixel(cellX+left+x,cellY+top+y,Color.FromArgb(255,color.R,color.G,color.B));
    }
    // A nearest-neighbor sample can miss the last source pixel of a sole.
    // Translate the complete registered frame down, never stretch it.
    int last=-1;
    for(int y=0;y<height;y++)for(int x=0;x<width;x++)if(output.GetPixel(cellX+x,cellY+y).A>0)last=y;
    int shift=height-1-last;
    if(last<0)throw new Exception("Empty registered frame.");
    if(shift>0)for(int y=height-1;y>=0;y--)for(int x=0;x<width;x++)
      output.SetPixel(cellX+x,cellY+y,y>=shift?output.GetPixel(cellX+x,cellY+y-shift):Color.Transparent);
  }
  public static Bitmap Enlarge(Bitmap input, int factor) {
    Bitmap output=new Bitmap(input.Width*factor,input.Height*factor,PixelFormat.Format32bppArgb);
    for(int y=0;y<output.Height;y++)for(int x=0;x<output.Width;x++)output.SetPixel(x,y,input.GetPixel(x/factor,y/factor));
    return output;
  }
}
'@

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$prefix = [IO.Path]::GetFullPath($OutputPrefix)
New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($prefix)) | Out-Null
$inputBitmap = [Drawing.Bitmap]::new($sourcePath)
$sheet = [Drawing.Bitmap]::new($Columns*$FrameWidth,$Rows*$FrameHeight,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
  if($inputBitmap.GetPixel(0,0).A -ge $AlphaThreshold){throw 'A transparent source is required.'}
  $frames = @()
  $rowBands=@([RegisteredCharacterSheet]::Bands($inputBitmap,[Drawing.Rectangle]::new(0,0,$inputBitmap.Width,$inputBitmap.Height),$true,$AlphaThreshold))
  if($rowBands.Count -ne $Rows){throw "Expected $Rows separate rows, found $($rowBands.Count)."}
  for($row=0;$row -lt $Rows;$row++) {
    $top=if($row -eq 0){0}else{[int][math]::Floor(($rowBands[$row-1][1]+$rowBands[$row][0])/2)}
    $bottom=if($row -eq $Rows-1){$inputBitmap.Height}else{[int][math]::Floor(($rowBands[$row][1]+$rowBands[$row+1][0])/2)}
    $columnBands=@([RegisteredCharacterSheet]::Bands($inputBitmap,[Drawing.Rectangle]::FromLTRB(0,$top,$inputBitmap.Width,$bottom),$false,$AlphaThreshold))
    if($columnBands.Count -ne $Columns){throw "Expected $Columns isolated sprites in row $row, found $($columnBands.Count)."}
    for($column=0;$column -lt $Columns;$column++) {
    $left=if($column -eq 0){0}else{[int][math]::Floor(($columnBands[$column-1][1]+$columnBands[$column][0])/2)}
    $right=if($column -eq $Columns-1){$inputBitmap.Width}else{[int][math]::Floor(($columnBands[$column][1]+$columnBands[$column+1][0])/2)}
    $cell=[Drawing.Rectangle]::FromLTRB($left,$top,$right,$bottom)
    $bounds=[RegisteredCharacterSheet]::Bounds($inputBitmap,$cell,$AlphaThreshold)
    $frames += [pscustomobject]@{row=$row;column=$column;bounds=$bounds;center=[RegisteredCharacterSheet]::HeadCenter($inputBitmap,$bounds,$AlphaThreshold)}
  }}
  $maxHeight=($frames.bounds.Height | Measure-Object -Maximum).Maximum
  # Account for off-center accessories as well as body width.
  $halfWidth=($frames | ForEach-Object {[math]::Max($_.center-$_.bounds.Left,$_.bounds.Right-$_.center)} | Measure-Object -Maximum).Maximum
  $scale=[math]::Min($ContentHeight/$maxHeight,($FrameWidth/2-3)/$halfWidth)
  foreach($frame in $frames) {
    [RegisteredCharacterSheet]::CopyFrame($inputBitmap,$sheet,$frame.bounds,
      $frame.column*$FrameWidth,$frame.row*$FrameHeight,$FrameWidth,$FrameHeight,$frame.center,$scale,$AlphaThreshold)
  }
  $sheet.Save("$prefix.png",[Drawing.Imaging.ImageFormat]::Png)
  $idle=$sheet.Clone([Drawing.Rectangle]::new(0,0,$FrameWidth,$FrameHeight),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try{$idle.Save("$prefix-idle.png",[Drawing.Imaging.ImageFormat]::Png)}finally{$idle.Dispose()}
  $preview=[RegisteredCharacterSheet]::Enlarge($sheet,$PreviewScale)
  try{$preview.Save("$prefix-preview.png",[Drawing.Imaging.ImageFormat]::Png)}finally{$preview.Dispose()}
  [ordered]@{
    source=[IO.Path]::GetFileName($sourcePath);sourceSha256=(Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
    columns=$Columns;rows=$Rows;frameWidth=$FrameWidth;frameHeight=$FrameHeight;baseline=$FrameHeight-1
    uniformScale=$scale;alphaThreshold=$AlphaThreshold
    frames=@($frames | ForEach-Object {[ordered]@{row=$_.row;column=$_.column;x=$_.bounds.X;y=$_.bounds.Y;width=$_.bounds.Width;height=$_.bounds.Height;headCenterX=$_.center}})
  } | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 "$prefix-registration.json"
  Write-Output "Registered $($frames.Count) frames: $($sheet.Width)x$($sheet.Height), uniform scale $scale, baseline $($FrameHeight-1)."
} finally {$sheet.Dispose();$inputBitmap.Dispose()}
