# Final subtle-motion pass over the already-approved arm art. No runtime/timing changes.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class SubtleYassinArm {
  static bool Denim(Color p){return p.A>0 && p.B>p.R*1.5 && p.B>p.G;}
  public static void Apply(string original,string output,string preview){
    using(var src=new Bitmap(original))using(var dst=src.Clone(new Rectangle(0,0,768,576),PixelFormat.Format32bppArgb)){
      var allowed=new bool[768,576];
      foreach(int row in new[]{0,3})for(int col=1;col<=5;col++){
        int delta=col==5?0:(col%2==1?1:-1)*(row==0?1:-1);
        for(int y=75;y<=111;y++){
          int edge=49;
          if(y>=92)for(int x=38;x<64;x++)if(Denim(src.GetPixel(col*128+x,row*144+y))){edge=Math.Min(edge,x-2);break;}
          // Keep the shoulder fixed; shift the relaxed hand only one pixel each way.
          int sy=y-(int)Math.Round(delta*Math.Min(1,Math.Max(0,(y-80)/12.0)));
          for(int x=23;x<=edge;x++){
            Color p=src.GetPixel(5*128+x,row*144+sy);
            if(Denim(p)||p.A==0)p=Color.FromArgb(0,0,0,0);
            dst.SetPixel(col*128+x,row*144+y,p);allowed[col*128+x,row*144+y]=true;
          }
        }
      }
      int changed=0;
      for(int y=0;y<576;y++)for(int x=0;x<768;x++)if(src.GetPixel(x,y).ToArgb()!=dst.GetPixel(x,y).ToArgb()){
        if(!allowed[x,y])throw new Exception("Change outside viewer-left arm.");changed++;
      }
      dst.Save(output,ImageFormat.Png);
      using(var p=new Bitmap(1536,1152,PixelFormat.Format32bppArgb)){
        for(int y=0;y<1152;y++)for(int x=0;x<1536;x++)p.SetPixel(x,y,dst.GetPixel(x/2,y/2));p.Save(preview,ImageFormat.Png);
      }
      Console.WriteLine("Changed pixels: "+changed+"; outside left-arm masks: 0. Right arm unchanged.");
    }
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$asset=Join-Path $root 'public/assets/characters/experimental/yassin-stubble-test-v3.png'
$backup=Join-Path $root 'assets-drafts/character-customization/yassin-before-subtle-left-arm.png'
if(!(Test-Path -LiteralPath $backup)){Copy-Item -LiteralPath $asset -Destination $backup}
[SubtleYassinArm]::Apply($backup,$asset,(Join-Path $root 'public/assets/characters/experimental/yassin-stubble-test-v3-preview.png'))
