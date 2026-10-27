# Local registration/compositing of generated arm poses; never redraw the approved body.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
public static class YassinBackArms {
  static bool Denim(Color p) { return p.A>0 && p.B>p.R*1.5 && p.B>p.G; }
  public static void Apply(string original, string donor, string output, string preview) {
    using(var src=new Bitmap(original)) using(var art=new Bitmap(donor))
    using(var dst=src.Clone(new Rectangle(0,0,src.Width,src.Height),PixelFormat.Format32bppArgb)) {
      var allowed=new bool[src.Width,src.Height];
      for(int col=1;col<=5;col++) for(int y=72;y<=111;y++) {
        int left=49,right=78;
        // Keep the original denim AND its adjacent outline, instead of cutting a rectangle through it.
        if(y>=92) {
          for(int x=38;x<64;x++) if(Denim(src.GetPixel(col*128+x,432+y))) { left=Math.Min(left,x-2);break; }
          for(int x=89;x>=64;x--) if(Denim(src.GetPixel(col*128+x,432+y))) { right=Math.Max(right,x+2);break; }
        }
        for(int x=23;x<=104;x++) {
          if(x>left && x<right)continue;
          bool mirror=col==1 || col==3;
          int donorCol=col==5?5:1;
          int donorX=mirror?127-x:x;
          Color p=art.GetPixel(donorCol*128+donorX,y);
          if(Denim(p) || p.A==0)p=Color.FromArgb(0,0,0,0);
          dst.SetPixel(col*128+x,432+y,p);
          allowed[col*128+x,432+y]=true;
        }
      }
      // Remove only tiny detached specks inside the new cutouts; keep all original art outside them.
      int specks=0;
      for(int col=1;col<=5;col++) {
        var seen=new bool[128,144];
        for(int sy=0;sy<144;sy++)for(int sx=0;sx<128;sx++) {
          if(seen[sx,sy] || dst.GetPixel(col*128+sx,432+sy).A==0)continue;
          var pixels=new List<Point>();var queue=new Queue<Point>();queue.Enqueue(new Point(sx,sy));seen[sx,sy]=true;
          while(queue.Count>0) {
            var p=queue.Dequeue();pixels.Add(p);
            for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++) {
              int x=p.X+dx,y=p.Y+dy;
              if(x<0 || y<0 || x>=128 || y>=144 || seen[x,y] || dst.GetPixel(col*128+x,432+y).A==0)continue;
              seen[x,y]=true;queue.Enqueue(new Point(x,y));
            }
          }
          if(pixels.Count<=8)foreach(var p in pixels)if(allowed[col*128+p.X,432+p.Y]) {
            dst.SetPixel(col*128+p.X,432+p.Y,Color.FromArgb(0,0,0,0));specks++;
          }
        }
      }
      int changed=0;
      for(int y=0;y<src.Height;y++)for(int x=0;x<src.Width;x++) {
        if(src.GetPixel(x,y).ToArgb()==dst.GetPixel(x,y).ToArgb())continue;
        if(!allowed[x,y])throw new Exception("Change outside arm mask.");
        changed++;
      }
      dst.Save(output,ImageFormat.Png);
      using(var enlarged=new Bitmap(dst.Width*2,dst.Height*2,PixelFormat.Format32bppArgb)) {
        for(int y=0;y<enlarged.Height;y++)for(int x=0;x<enlarged.Width;x++)enlarged.SetPixel(x,y,dst.GetPixel(x/2,y/2));
        enlarged.Save(preview,ImageFormat.Png);
      }
      Console.WriteLine("Changed arm pixels: "+changed+"; outside arm masks: 0. Head, legs, shoes, idle and other directions preserved.");
      Console.WriteLine("Detached edge specks removed: "+specks);
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$asset=Join-Path $root 'public/assets/characters/experimental/yassin-stubble-test-v3.png'
$backup=Join-Path $root 'assets-drafts/character-customization/yassin-stubble-v3-before-back-arm-fix.png'
if(!(Test-Path -LiteralPath $backup)){Copy-Item -LiteralPath $asset -Destination $backup}
[YassinBackArms]::Apply($backup,(Join-Path $root 'assets-drafts/character-customization/yassin-back-arms-registered.png'),$asset,(Join-Path $root 'public/assets/characters/experimental/yassin-stubble-test-v3-preview.png'))
