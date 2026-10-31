param([string]$Source,[string]$Output)
$ErrorActionPreference='Stop'
$sdk='E:\SolidWorks\SOLIDWORKS\api\redist\SolidWorks.Interop.sldworks.dll'
Add-Type -Path $sdk
Add-Type -AssemblyName System.Web.Extensions
Add-Type -ReferencedAssemblies @($sdk,'System.Web.Extensions') -Path (Join-Path $PSScriptRoot 'export-solidworks.cs')
[SolidWorksWebExport]::Run($Source,$Output)
