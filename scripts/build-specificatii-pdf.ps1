$ErrorActionPreference = "Stop"

$root = "d:\Architectura_SIIS"
$pandoc = "$env:LOCALAPPDATA\Pandoc\pandoc.exe"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$srcMd = Join-Path $root "specificatii.md"
$css = Join-Path $root "docs\plan-marketing.css"
$outHtml = Join-Path $root "docs\specificatii.html"
$outPdf = Join-Path $root "specificatii.pdf"

& $pandoc $srcMd `
    -o $outHtml `
    --standalone `
    --metadata title="" `
    --css $css `
    --from markdown+raw_html

$htmlUri = "file:///" + ($outHtml -replace '\\', '/')
if (Test-Path $outPdf) { Remove-Item $outPdf -Force }
& $chrome --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$outPdf" $htmlUri | Out-Null

if (-not (Test-Path $outPdf)) {
    throw "PDF generation failed: $outPdf"
}

Write-Host "Generated: $outHtml"
Write-Host "Generated: $outPdf ($((Get-Item $outPdf).Length) bytes)"
