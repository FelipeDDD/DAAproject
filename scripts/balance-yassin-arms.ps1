# Register already-approved neutral arms with equal opposing motion. No new art generation.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class BalancedYassinArms {
  static Color Clear=Color.FromArgb(0,0,0,0);
  static bool Skin(Color p){return p.A>0 && p.R-p.G>18 && p.R>p.B*1.25;}
  public static void Apply(string original,string output,string preview,string originalMask,string maskPath){
    using(var src=new Bitmap(original))using(var dst=src.Clone(new Rectangle(0,0,768,576),PixelFormat.Format32bppArgb)){
      Bitmap labels=String.IsNullOrEmpty(originalMask)?null:new Bitmap(originalMask);
      Bitmap mask=labels==null?null:labels.Clone(new Rectangle(0,0,768,576),PixelFormat.Format32bppArgb);
      try{
        var allowed=new bool[768,576];
        foreach(int row in new[]{0,3})for(int col=1;col<=5;col++)for(int side=0;side<2;side++){
          int delta=(col==5?0:col%2==1?1:-1)*(row==0?1:-1)*(side==0?1:-1);
          for(int y=75;y<=111;y++){
            // Follow the body contour: keep the torso and the entire central trouser region.
            int edge=y<97?49:43;
            int sy=y-(int)Math.Round(delta*Math.Min(1,Math.Max(0,(y-80)/12.0)));
            for(int x=23;x<=52;x++){
              int tx=side==0?x:127-x,px=col*128+tx,py=row*144+y;
              bool oldHandOverlap=y>=96&&Skin(src.GetPixel(px,py));
              if(x>edge&&!oldHandOverlap)continue;
              Color p=src.GetPixel(5*128+x,row*144+sy);
              if(p.A==0)p=Clear;
              dst.SetPixel(px,py,p);allowed[px,py]=true;
              if(mask!=null){
                Color label=labels.GetPixel(5*128+x,row*144+sy);
                // Copy sleeve labels only; old stray trouser labels must never tint a moving hand.
                bool shirt=label.A>0&&label.R==0&&label.G==255&&label.B==0&&p.A>0&&!Skin(p);
                bool restoredTrouser=oldHandOverlap&&x>edge&&label.A>0&&label.B==255&&p.A>0&&!Skin(p);
                mask.SetPixel(px,py,shirt?Color.FromArgb(255,0,255,0):restoredTrouser?Color.FromArgb(255,0,0,255):Clear);
              }
            }
          }
        }
        int changed=0;
        for(int y=0;y<576;y++)for(int x=0;x<768;x++){
          bool a=src.GetPixel(x,y).ToArgb()!=dst.GetPixel(x,y).ToArgb();
          bool b=mask!=null&&labels.GetPixel(x,y).ToArgb()!=mask.GetPixel(x,y).ToArgb();
          if((a||b)&&!allowed[x,y])throw new Exception("Change outside arm cutouts.");
          if(a)changed++;
        }
        dst.Save(output,ImageFormat.Png);if(mask!=null)mask.Save(maskPath,ImageFormat.Png);
        using(var p=new Bitmap(1536,1152,PixelFormat.Format32bppArgb)){
          for(int y=0;y<1152;y++)for(int x=0;x<1536;x++)p.SetPixel(x,y,dst.GetPixel(x/2,y/2));p.Save(preview,ImageFormat.Png);
        }
        Console.WriteLine(System.IO.Path.GetFileName(output)+": "+changed+" pixels changed, none outside arm masks.");
      }finally{if(mask!=null)mask.Dispose();if(labels!=null)labels.Dispose();}
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
foreach($name in @('yassin-stubble-test-v3','yassin-felipe-walk-v1')){
  $asset=Join-Path $root "public/assets/characters/experimental/$name.png"
  $backup=Join-Path $root "assets-drafts/character-customization/$name-before-balanced-arms.png"
  if(!(Test-Path -LiteralPath $backup)){Copy-Item -LiteralPath $asset -Destination $backup}
  $maskPath=$null;$maskBackup=$null
  if($name -eq 'yassin-felipe-walk-v1'){
    $maskPath=Join-Path $root "public/assets/characters/experimental/$name-material-mask.png"
    $maskBackup=Join-Path $root "assets-drafts/character-customization/$name-mask-before-balanced-arms.png"
    if(!(Test-Path -LiteralPath $maskBackup)){Copy-Item -LiteralPath $maskPath -Destination $maskBackup}
  }
  [BalancedYassinArms]::Apply($backup,$asset,(Join-Path $root "public/assets/characters/experimental/$name-preview.png"),$maskBackup,$maskPath)
}
