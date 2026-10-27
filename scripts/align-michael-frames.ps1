# Rigid registration only: translate complete frames and material labels together.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
public class MichaelFrameOffset {public int row,column,dx,dy,headTopBefore,headTopAfter,footBottom; public double headCenterBefore,headCenterAfter;}
public static class MichaelFrameAlignment {
  static bool Skin(Color p){return p.A>0&&p.R-p.G>18&&p.R>p.B*1.25;}
  static double Median(List<double> a){a.Sort();return (a[(a.Count-1)/2]+a[a.Count/2])/2;}
  static double Score(Bitmap src,int row,int col,int dx,int dy){
    double score=0;
    // Register the whole stable head/neck, not its topmost few antialiased pixels.
    for(int y=8;y<78;y++)for(int x=28;x<100;x++){
      var a=src.GetPixel(x,row*144+y);var b=src.GetPixel(col*128+x-dx,row*144+y-dy);
      if(a.A==0&&b.A==0)continue;
      if(a.A==0||b.A==0)score+=3;
      else score+=(Math.Abs(a.R-b.R)+Math.Abs(a.G-b.G)+Math.Abs(a.B-b.B))/255.0;
    }
    return score+.01*(Math.Abs(dx)+Math.Abs(dy));
  }
  static void Copy(Bitmap src,Bitmap dst,int row,int col,int dx,int dy){
    for(int y=0;y<144;y++)for(int x=0;x<128;x++){
      var p=src.GetPixel(col*128+x,row*144+y);if(p.A==0)continue;
      int tx=x+dx,ty=y+dy;
      if(tx<0||tx>=128||ty<0||ty>=144)throw new Exception("Registration would clip an opaque pixel.");
      dst.SetPixel(col*128+tx,row*144+ty,p);
    }
    // Verify the complete inverse mapping, including empty areas and material labels.
    for(int ty=0;ty<144;ty++)for(int tx=0;tx<128;tx++){
      int sx=tx-dx,sy=ty-dy;
      var expected=sx>=0&&sx<128&&sy>=0&&sy<144?src.GetPixel(col*128+sx,row*144+sy):Color.FromArgb(0,0,0,0);
      var actual=dst.GetPixel(col*128+tx,row*144+ty);
      if(actual.A!=expected.A || (expected.A>0&&actual.ToArgb()!=expected.ToArgb()))throw new Exception("Pixel changed during rigid registration.");
    }
  }
  public static MichaelFrameOffset[] Apply(string original,string labels,string output,string outputMask,string idle,string preview){
    using(var src=new Bitmap(original))using(var mask=new Bitmap(labels))
    using(var dst=new Bitmap(768,576,PixelFormat.Format32bppArgb))using(var dstMask=new Bitmap(768,576,PixelFormat.Format32bppArgb)){
      var frames=new List<MichaelFrameOffset>();
      for(int row=0;row<4;row++){
        var anchors=new List<MichaelFrameOffset>();var centers=new List<double>();int targetTop=144;
        for(int col=0;col<6;col++){
          int top=-1;
          for(int y=0;y<70;y++){int count=0;for(int x=20;x<108;x++)if(Skin(src.GetPixel(col*128+x,row*144+y)))count++;if(count>=3){top=y;break;}}
          if(top<0)throw new Exception("Head anchor missing.");
          // Median of scalp-row centers avoids cigarette, ears, and a stray edge pixel biasing x.
          var lines=new List<double>();
          for(int y=top+8;y<=top+30;y++){
            int left=128,right=-1;
            for(int x=20;x<108;x++)if(Skin(src.GetPixel(col*128+x,row*144+y))){left=Math.Min(left,x);right=Math.Max(right,x);}
            if(right>=left)lines.Add((left+right)/2.0);
          }
          double center=Median(lines);centers.Add(center);targetTop=Math.Min(targetTop,top);
          anchors.Add(new MichaelFrameOffset{row=row,column=col,headTopBefore=top,headCenterBefore=center});
        }
        int commonLift=0;
        foreach(var frame in anchors){
          double best=Double.PositiveInfinity;
          for(int dy=-6;dy<=6;dy++)for(int dx=-4;dx<=4;dx++){
            double score=Score(src,row,frame.column,dx,dy);
            if(score<best){best=score;frame.dx=dx;frame.dy=dy;}
          }
          commonLift=Math.Max(commonLift,frame.dy);
        }
        foreach(var frame in anchors){
          frame.dy-=commonLift; // Same common shift for the row: align without clipping any sole.
          frame.headTopAfter=frame.headTopBefore+frame.dy;frame.headCenterAfter=frame.headCenterBefore+frame.dx;
          Copy(src,dst,row,frame.column,frame.dx,frame.dy);Copy(mask,dstMask,row,frame.column,frame.dx,frame.dy);
          int bottom=-1;for(int y=0;y<144;y++)for(int x=0;x<128;x++)if(dst.GetPixel(frame.column*128+x,row*144+y).A>0)bottom=y;
          frame.footBottom=bottom;frames.Add(frame);
        }
      }
      dst.Save(output,ImageFormat.Png);dstMask.Save(outputMask,ImageFormat.Png);
      using(var frame=dst.Clone(new Rectangle(0,0,128,144),PixelFormat.Format32bppArgb))frame.Save(idle,ImageFormat.Png);
      using(var enlarged=new Bitmap(1536,1152,PixelFormat.Format32bppArgb)){
        for(int y=0;y<1152;y++)for(int x=0;x<1536;x++)enlarged.SetPixel(x,y,dst.GetPixel(x/2,y/2));enlarged.Save(preview,ImageFormat.Png);
      }
      return frames.ToArray();
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$prefix=Join-Path $root 'public/assets/characters/experimental/michael-level3-hd'
$backup=Join-Path $root 'assets-drafts/character-customization/michael-before-frame-alignment'
if(!(Test-Path -LiteralPath "$backup.png")){Copy-Item -LiteralPath "$prefix.png" -Destination "$backup.png"}
if(!(Test-Path -LiteralPath "$backup-mask.png")){Copy-Item -LiteralPath "$prefix-material-mask.png" -Destination "$backup-mask.png"}
$frames=[MichaelFrameAlignment]::Apply("$backup.png","$backup-mask.png","$prefix.png","$prefix-material-mask.png","$prefix-idle.png","$prefix-preview.png")
$report=Get-Content -LiteralPath "$prefix-registration.json" -Raw | ConvertFrom-Json
$alignment=[ordered]@{script='scripts/align-michael-frames.ps1';method='Rigid integer translation registering the head/neck to the idle pose per direction; common upward padding preserves all sole pixels; no resampling or redrawing';sourceBackup='assets-drafts/character-customization/michael-before-frame-alignment.png';sourceSha256=(Get-FileHash -LiteralPath "$backup.png").Hash;maskSha256=(Get-FileHash -LiteralPath "$backup-mask.png").Hash;frames=@($frames)}
$report.postprocess | Add-Member -NotePropertyName alignment -NotePropertyValue $alignment -Force
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath "$prefix-registration.json" -Encoding UTF8
$frames | Format-Table row,column,dx,dy,footBottom
Write-Output 'Verified all 24 sprite/mask cells: integer translation only, no opaque pixels clipped or altered.'
