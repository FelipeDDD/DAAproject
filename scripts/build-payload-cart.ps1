param()
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Collections.Generic;
public static class PayloadCartArt {
  public static void ClearBackground(Bitmap b) {
    int w=b.Width,h=b.Height;
    var seen=new bool[w*h]; var q=new Queue<int>();
    for(int x=0;x<w;x++){q.Enqueue(x);q.Enqueue((h-1)*w+x);}
    for(int y=0;y<h;y++){q.Enqueue(y*w);q.Enqueue(y*w+w-1);}
    while(q.Count>0){int n=q.Dequeue();if(seen[n])continue;seen[n]=true;
      int x=n%w,y=n/w;var c=b.GetPixel(x,y);
      if(c.R>16||c.G>16||c.B>16)continue;
      b.SetPixel(x,y,Color.Transparent);
      if(x>0)q.Enqueue(n-1);if(x<w-1)q.Enqueue(n+1);
      if(y>0)q.Enqueue(n-w);if(y<h-1)q.Enqueue(n+w);
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$names=@('Imagem do ChatGPT 5 de out. de 2026, 09_47_10-1.png','4dac903d-4cd2-427e-9419-04ade3f1d105.png','4df9aa68-139a-46f4-ad22-ea3d3f4d656e.png','7cb52624-4565-4d3e-bf2e-6e706998ab94.png')
$destination=Join-Path $root 'public/assets/pvp'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$sheet=[Drawing.Bitmap]::new(2048,256)
$graphics=[Drawing.Graphics]::FromImage($sheet)
$graphics.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode=[Drawing.Drawing2D.PixelOffsetMode]::Half
try {
  for($i=0;$i -lt $names.Count;$i++){
    $source=[Drawing.Bitmap]::new((Join-Path $root ('assets-drafts/payload/'+$names[$i])))
    # The source PNGs are RGB: SetPixel(Transparent) on those becomes opaque white.
    # Copy into explicit ARGB before removing the background.
    $frame=[Drawing.Bitmap]::new($source.Width,$source.Height,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $copy=[Drawing.Graphics]::FromImage($frame)
    try {$copy.DrawImageUnscaled($source,0,0)} finally {$copy.Dispose();$source.Dispose()}
    try {
      if($frame.Width -ne 1536 -or $frame.Height -ne 1024){throw 'Unexpected Payload source dimensions'}
      [PayloadCartArt]::ClearBackground($frame)
      $graphics.DrawImage($frame,[Drawing.Rectangle]::new($i*512,0,512,250),48,160,1440,704,[Drawing.GraphicsUnit]::Pixel)
    } finally {$frame.Dispose()}
  }
  for($i=0;$i -lt 4;$i++){
    if($sheet.GetPixel($i*512,0).A -ne 0){throw "Frame $i background is not transparent"}
    if($sheet.GetPixel($i*512+220,185).A -ne 255){throw "Frame $i artwork was lost"}
  }
  $sheet.Save((Join-Path $destination 'equipment-cart.png'),[Drawing.Imaging.ImageFormat]::Png)
} finally {$graphics.Dispose();$sheet.Dispose()}
