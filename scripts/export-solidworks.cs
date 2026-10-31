// Read-only extraction through the installed official SolidWorks SDK.
// Input documents are never saved. Matrices are root-assembly-relative, in metres.
using System;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using SolidWorks.Interop.sldworks;

public static class SolidWorksWebExport {
  static double[] Numbers(object value) {
    var a=value as Array;if(a==null)return null;
    var result=new double[a.Length];for(int i=0;i<a.Length;i++)result[i]=Convert.ToDouble(a.GetValue(i));return result;
  }
  public static void Run(string input,string output) {
    Directory.CreateDirectory(output);
    ISldWorks sw=(ISldWorks)Activator.CreateInstance(Type.GetTypeFromProgID("SldWorks.Application"));
    Console.WriteLine("SolidWorks "+sw.RevisionNumber());
    int errors=0,warnings=0;
    IModelDoc2 model=sw.OpenDoc6(input,2,3,"",ref errors,ref warnings);
    if(model==null)throw new Exception("OpenDoc6 failed: "+errors+" / "+warnings);
    Console.WriteLine("Opened "+model.GetTitle()+"; errors="+errors+", warnings="+warnings);
    IAssemblyDoc assembly=(IAssemblyDoc)model;
    Console.WriteLine("Resolve status "+assembly.ResolveAllLightWeightComponents(false));
    Array components=(Array)assembly.GetComponents(false);
    var instances=new List<object>();var meshes=new List<object>();var failures=new List<object>();
    var cache=new Dictionary<string,int>();int total=0;
    foreach(object item in components) {
      IComponent2 c=(IComponent2)item;string name=c.Name2,path=c.GetPathName();
      if(c.IsSuppressed()||c.IsHidden(true))continue;
      IModelDoc2 part=(IModelDoc2)c.GetModelDoc2();
      if(part==null){failures.Add(new {name,path,reason="Unloaded model"});continue;}
      if(!(part is IPartDoc))continue;
      try {
        string key=path+"|"+c.ReferencedConfiguration;int mesh;
        if(!cache.TryGetValue(key,out mesh)) {
          Array triangles=((IPartDoc)part).GetTessTriangles(true) as Array;
          if(triangles==null||triangles.Length==0){failures.Add(new{name,path,reason="No tessellation"});continue;}
          mesh=meshes.Count;string file="mesh-"+mesh.ToString("D4")+".bin";
          double[] min={Double.PositiveInfinity,Double.PositiveInfinity,Double.PositiveInfinity};
          double[] max={Double.NegativeInfinity,Double.NegativeInfinity,Double.NegativeInfinity};
          using(var bw=new BinaryWriter(File.Open(Path.Combine(output,file),FileMode.Create))) {
            for(int i=0;i<triangles.Length;i++){float v=Convert.ToSingle(triangles.GetValue(i));bw.Write(v);min[i%3]=Math.Min(min[i%3],v);max[i%3]=Math.Max(max[i%3],v);}
          }
          meshes.Add(new{file,name=part.GetTitle(),path,count=triangles.Length/3,min,max});cache[key]=mesh;
          Console.WriteLine("Mesh "+mesh+": "+part.GetTitle()+" / "+triangles.Length/9+" triangles");
        }
        double[] transform=Numbers(c.Transform2.ArrayData);
        double[] color=Numbers(c.MaterialPropertyValues);
        if(color==null||color.Length<3||color[0]<0)color=Numbers(part.MaterialPropertyValues);
        instances.Add(new{name,path,mesh,transform,color,box=Numbers(c.GetBox(false,false))});total++;
      }catch(Exception e){failures.Add(new{name,path,reason=e.Message});}
    }
    var manifest=new{source=input,revision=sw.RevisionNumber(),errors,warnings,meshes,instances,failures};
    var json=new JavaScriptSerializer{MaxJsonLength=Int32.MaxValue}.Serialize(manifest);
    File.WriteAllText(Path.Combine(output,"assembly.json"),json,new System.Text.UTF8Encoding(false));
    model.ShowNamedView2("",7);model.ViewZoomtofit2();
    Console.WriteLine("Preview "+model.SaveBMP(Path.Combine(output,"assembly-preview.bmp"),1500,900));
    Console.WriteLine("EXPORTED "+total+" instances / "+meshes.Count+" unique meshes / "+failures.Count+" omissions");
  }
}
