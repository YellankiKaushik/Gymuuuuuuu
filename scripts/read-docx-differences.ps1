param([Parameter(Mandatory=$true)][string]$Path, [string]$MarkdownPath)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$absolute = (Resolve-Path -LiteralPath $Path).Path
$archive = [System.IO.Compression.ZipFile]::OpenRead($absolute)
try {
  $reader = New-Object System.IO.StreamReader($archive.GetEntry('word/document.xml').Open())
  try { $xml = [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
} finally { $archive.Dispose() }
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$paragraphs = $xml.SelectNodes('//w:p', $ns) | ForEach-Object { ($_.SelectNodes('.//w:t',$ns) | ForEach-Object { $_.'#text' }) -join '' }
if ($MarkdownPath) {
  $normalized = ((Get-Content -LiteralPath $MarkdownPath -Raw) -replace '[^\p{L}\p{N}]', '').ToLowerInvariant()
  $different = $paragraphs | Where-Object { $plain = ($_ -replace '[^\p{L}\p{N}]', '').ToLowerInvariant(); $plain.Length -gt 0 -and -not $normalized.Contains($plain) }
  Write-Output "DOCX compared: $($paragraphs.Count) paragraphs; $($different.Count) additional/different paragraphs follow."
  $different
} else { $paragraphs }
