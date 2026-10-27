# Composite only registered/generated front/back arm poses and update their material labels.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
public static class MichaelArmSwing {
  static Color Clear=Color.FromArgb(0,0,0,0);
  static bool Denim(Color p) {return p.A>0 && p.B>p.R*1.5 && p.B>p.G;}
  static bool Skin(Color p) {return p.A>0 && p.R-p.G>18 && p.R>p.B*1.25;}
  public static void Apply(string original,string originalMask,string donor,string output,string maskPath,string preview) {
    using(var src=new Bitmap(original))using(var labels=new Bitmap(originalMask))using(var art=new Bitmap(donor))
    using(var dst=src.Clone(new Rectangle(0,0,768,576),PixelFormat.Format32bppArgb))
    using(var mask=labels.Clone(new Rectangle(0,0,768,576),PixelFormat.Format32bppArgb)) {
      var allowed=new bool[768,576];
      foreach(int row in new[]{0,3})for(int col=1;col<=5;col++)for(int y=78;y<=114;y++) {
        int left=49,right=78,oy=row*144;
        if(y>=96) {
          for(int x=38;x<64;x++)if(Denim(src.GetPixel(col*128+x,oy+y))){left=Math.Min(left,x-2);break;}
          for(int x=89;x>=64;x--)if(Denim(src.GetPixel(col*128+x,oy+y))){right=Math.Max(right,x+2);break;}
        }
        for(int x=23;x<=104;x++) {
          if(x>left && x<right)continue;
          int px=col*128+x,py=oy+y;
          Color oldLabel=labels.GetPixel(px,py);
          // Protect original trousers/shoes even if a hand overlaps their bounding box.
          if(oldLabel.A>0 && (oldLabel.B==255 || (oldLabel.R==255 && oldLabel.G==255)))continue;
          bool mirror=col==2 || col==4;
          int donorCol=row==0?3:1,dx=mirror?127-x:x;
          if(col==5){donorCol=row==0?5:3;dx=x<64?127-x:x;}
          Color p=art.GetPixel(donorCol*128+dx,oy+y);
          if(Denim(p) || p.A==0)p=Clear;
          dst.SetPixel(px,py,p);allowed[px,py]=true;
          int max=Math.Max(p.R,Math.Max(p.G,p.B)),min=Math.Min(p.R,Math.Min(p.G,p.B));
          // Black outlines and skin stay fixed; only neutral sleeve fabric is recolorable.
          bool sleeve=p.A>0 && !Skin(p) && max>=25 && max<=100 && max-min<=18 && y<=96;
          mask.SetPixel(px,py,sleeve?Color.FromArgb(255,0,255,0):Clear);
        }
      }
      int specks=0;
      foreach(int row in new[]{0,3})for(int col=1;col<=5;col++) {
        var seen=new bool[128,144];
        for(int sy=0;sy<144;sy++)for(int sx=0;sx<128;sx++) {
          if(seen[sx,sy] || dst.GetPixel(col*128+sx,row*144+sy).A==0)continue;
          var pixels=new List<Point>();var queue=new Queue<Point>();queue.Enqueue(new Point(sx,sy));seen[sx,sy]=true;
          while(queue.Count>0) {
            var p=queue.Dequeue();pixels.Add(p);
            for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++) {
              int x=p.X+dx,y=p.Y+dy;
              if(x<0 || y<0 || x>=128 || y>=144 || seen[x,y] || dst.GetPixel(col*128+x,row*144+y).A==0)continue;
              seen[x,y]=true;queue.Enqueue(new Point(x,y));
            }
          }
          if(pixels.Count<=8)foreach(var p in pixels)if(allowed[col*128+p.X,row*144+p.Y]) {
            dst.SetPixel(col*128+p.X,row*144+p.Y,Clear);mask.SetPixel(col*128+p.X,row*144+p.Y,Clear);specks++;
          }
        }
      }
      int changes=0,maskChanges=0;
      for(int y=0;y<576;y++)for(int x=0;x<768;x++) {
        bool a=src.GetPixel(x,y).ToArgb()!=dst.GetPixel(x,y).ToArgb();
        bool b=labels.GetPixel(x,y).ToArgb()!=mask.GetPixel(x,y).ToArgb();
        if((a||b)&&!allowed[x,y])throw new Exception("Change outside arm cutouts.");
        if(a)changes++;if(b)maskChanges++;
        if(allowed[x,y] && mask.GetPixel(x,y).A>0 && (dst.GetPixel(x,y).A==0 || Skin(dst.GetPixel(x,y))))
          throw new Exception("Material label overlaps transparent pixels or skin.");
      }
      dst.Save(output,ImageFormat.Png);mask.Save(maskPath,ImageFormat.Png);
      using(var enlarged=new Bitmap(1536,1152,PixelFormat.Format32bppArgb)) {
        for(int y=0;y<1152;y++)for(int x=0;x<1536;x++)enlarged.SetPixel(x,y,dst.GetPixel(x/2,y/2));
        enlarged.Save(preview,ImageFormat.Png);
      }
      Console.WriteLine("Sprite pixels changed: "+changes+"; mask pixels changed: "+maskChanges+"; outside arm cutouts: 0; detached edge pixels removed: "+specks);
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$asset=Join-Path $root 'public/assets/characters/experimental/michael-level3-hd.png'
$mask=Join-Path $root 'public/assets/characters/experimental/michael-level3-hd-material-mask.png'
$backup=Join-Path $root 'assets-drafts/character-customization/michael-before-arm-fix.png'
$backupMask=Join-Path $root 'assets-drafts/character-customization/michael-mask-before-arm-fix.png'
if(!(Test-Path -LiteralPath $backup)){Copy-Item -LiteralPath $asset -Destination $backup}
if(!(Test-Path -LiteralPath $backupMask)){Copy-Item -LiteralPath $mask -Destination $backupMask}
[MichaelArmSwing]::Apply($backup,$backupMask,(Join-Path $root 'assets-drafts/character-customization/michael-arms-registered.png'),$asset,$mask,(Join-Path $root 'public/assets/characters/experimental/michael-level3-hd-preview.png'))
