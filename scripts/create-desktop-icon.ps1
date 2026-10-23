param([string]$Source = (Join-Path $PSScriptRoot '../electron/logo-source.png'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
public static class MiaoLogoIcon {
    public static void Create(string source, string iconPath, string previewPath) {
        using (var bitmap = new Bitmap(source)) {
            int w=bitmap.Width, h=bitmap.Height;
            var background=new bool[w*h];
            var queue=new Queue<int>();
            Action<int,int> visit=(x,y)=>{
                int i=y*w+x;
                if(background[i]) return;
                var c=bitmap.GetPixel(x,y);
                // Only remove near-white background connected to the canvas edge.
                // Enclosed cream details retain their original source pixels.
                if(c.A==0 || (c.R>=250 && c.G>=250 && c.B>=250)) {background[i]=true;queue.Enqueue(i);}
            };
            for(int x=0;x<w;x++){visit(x,0);visit(x,h-1);}
            for(int y=0;y<h;y++){visit(0,y);visit(w-1,y);}
            while(queue.Count>0){
                int i=queue.Dequeue(),x=i%w,y=i/w;
                if(x>0)visit(x-1,y);if(x+1<w)visit(x+1,y);
                if(y>0)visit(x,y-1);if(y+1<h)visit(x,y+1);
            }
            int left=w,top=h,right=-1,bottom=-1;
            for(int y=0;y<h;y++)for(int x=0;x<w;x++){
                if(background[y*w+x]) bitmap.SetPixel(x,y,Color.Transparent);
                else {left=Math.Min(left,x);top=Math.Min(top,y);right=Math.Max(right,x);bottom=Math.Max(bottom,y);}
            }
            if(right<left)throw new InvalidDataException("Logo has no visible pixels");
            var crop=new Rectangle(left,top,right-left+1,bottom-top+1);
            int[] sizes={16,20,24,32,40,48,64,128,256};
            var payloads=new List<byte[]>();
            foreach(int size in sizes){
                using(var frame=new Bitmap(size,size,PixelFormat.Format32bppArgb)){
                    using(var graphics=Graphics.FromImage(frame)){
                        graphics.Clear(Color.Transparent);
                        graphics.CompositingQuality=CompositingQuality.HighQuality;
                        graphics.InterpolationMode=InterpolationMode.HighQualityBicubic;
                        graphics.PixelOffsetMode=PixelOffsetMode.HighQuality;
                        float scale=size*0.92f/Math.Max(crop.Width,crop.Height);
                        float width=crop.Width*scale,height=crop.Height*scale;
                        graphics.DrawImage(bitmap,new RectangleF((size-width)/2,(size-height)/2,width,height),crop,GraphicsUnit.Pixel);
                    }
                    using(var stream=new MemoryStream()){frame.Save(stream,ImageFormat.Png);payloads.Add(stream.ToArray());}
                    if(size==256)frame.Save(previewPath,ImageFormat.Png);
                }
            }
            using(var writer=new BinaryWriter(File.Create(iconPath))){
                writer.Write((ushort)0);writer.Write((ushort)1);writer.Write((ushort)sizes.Length);
                uint offset=(uint)(6+16*sizes.Length);
                for(int i=0;i<sizes.Length;i++){
                    writer.Write((byte)(sizes[i]==256?0:sizes[i]));writer.Write((byte)(sizes[i]==256?0:sizes[i]));
                    writer.Write((byte)0);writer.Write((byte)0);writer.Write((ushort)1);writer.Write((ushort)32);
                    writer.Write((uint)payloads[i].Length);writer.Write(offset);offset+=(uint)payloads[i].Length;
                }
                foreach(var payload in payloads)writer.Write(payload);
            }
            Console.WriteLine("Source {0}x{1}; logo bounds {2}; ICO sizes: {3}",w,h,crop,String.Join(",",sizes));
        }
    }
}
'@
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$previewDirectory = Join-Path $projectRoot 'desktop-test-results'
[IO.Directory]::CreateDirectory($previewDirectory) | Out-Null
[MiaoLogoIcon]::Create([IO.Path]::GetFullPath($Source), (Join-Path $projectRoot 'electron/icon.ico'), (Join-Path $previewDirectory 'logo-icon-preview.png'))
