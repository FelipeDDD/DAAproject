param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [switch]$TransformationOnly
)

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class SpriteSheetTools {
  public static void AlignFramesToBottom(Bitmap sheet, int frameWidth, int frameHeight, int columns, int rows) {
    for (int row = 0; row < rows; row++) for (int column = 0; column < columns; column++) {
      int last = -1;
      for (int y = 0; y < frameHeight; y++) for (int x = 0; x < frameWidth; x++)
        if (sheet.GetPixel(column * frameWidth + x, row * frameHeight + y).A > 0) last = y;
      int offset = frameHeight - 1 - last;
      if (last < 0 || offset == 0) continue;
      Color[] pixels = new Color[frameWidth * frameHeight];
      for (int y = 0; y < frameHeight; y++) for (int x = 0; x < frameWidth; x++)
        pixels[y * frameWidth + x] = sheet.GetPixel(column * frameWidth + x, row * frameHeight + y);
      for (int y = 0; y < frameHeight; y++) for (int x = 0; x < frameWidth; x++)
        sheet.SetPixel(column * frameWidth + x, row * frameHeight + y, Color.Transparent);
      for (int y = 0; y <= last; y++) for (int x = 0; x < frameWidth; x++) {
        Color color = pixels[y * frameWidth + x];
        if (color.A > 0) sheet.SetPixel(column * frameWidth + x, row * frameHeight + y + offset, color);
      }
    }
  }

  public static Bitmap ExtractLargestComponent(Bitmap source, int left, int top, int width, int height) {
    int length = width * height;
    Color background = source.GetPixel(left, top);
    bool alphaBackground = background.A <= 24;
    bool darkBackground = !alphaBackground && (background.R + background.G + background.B) / 3 < 40;
    bool preserveSeparateParts = alphaBackground || darkBackground;
    bool[] backgroundLike = new bool[length];
    bool[] exterior = new bool[length];
    bool[] visited = new bool[length];
    for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) {
      Color color = source.GetPixel(left + x, top + y);
      int r = color.R - background.R, g = color.G - background.G, b = color.B - background.B;
      backgroundLike[y * width + x] = alphaBackground ? color.A <= 24 : r * r + g * g + b * b <= 5625;
    }

    Queue<int> queue = new Queue<int>();
    Action<int> addExterior = index => {
      if (backgroundLike[index] && !exterior[index]) { exterior[index] = true; queue.Enqueue(index); }
    };
    for (int x = 0; x < width; x++) { addExterior(x); addExterior((height - 1) * width + x); }
    for (int y = 0; y < height; y++) { addExterior(y * width); addExterior(y * width + width - 1); }
    while (queue.Count > 0) {
      int index = queue.Dequeue(), x = index % width, y = index / width;
      if (x > 0) addExterior(index - 1);
      if (x + 1 < width) addExterior(index + 1);
      if (y > 0) addExterior(index - width);
      if (y + 1 < height) addExterior(index + width);
    }

    List<int> largest = new List<int>();
    List<int> selected = new List<int>();
    List<List<int>> components = new List<List<int>>();
    for (int start = 0; start < length; start++) {
      if (exterior[start] || visited[start]) continue;
      List<int> component = new List<int>();
      visited[start] = true;
      queue.Enqueue(start);
      while (queue.Count > 0) {
        int index = queue.Dequeue(), x = index % width, y = index / width;
        component.Add(index);
        Action<int> addComponent = neighbor => {
          if (!exterior[neighbor] && !visited[neighbor]) { visited[neighbor] = true; queue.Enqueue(neighbor); }
        };
        if (x > 0) addComponent(index - 1);
        if (x + 1 < width) addComponent(index + 1);
        if (y > 0) addComponent(index - width);
        if (y + 1 < height) addComponent(index + width);
      }
      components.Add(component);
      if (component.Count > largest.Count) largest = component;
    }
    if (!preserveSeparateParts) selected = largest;
    else {
      selected.AddRange(largest);
      HashSet<List<int>> included = new HashSet<List<int>>();
      included.Add(largest);
      bool changed;
      do {
        changed = false;
        int selectedMinX = width, selectedMaxX = -1, selectedMinY = height, selectedMaxY = -1;
        foreach (int index in selected) {
          int x = index % width, y = index / width;
          selectedMinX = Math.Min(selectedMinX, x); selectedMaxX = Math.Max(selectedMaxX, x);
          selectedMinY = Math.Min(selectedMinY, y); selectedMaxY = Math.Max(selectedMaxY, y);
        }
        foreach (List<int> component in components) {
          if (included.Contains(component) || component.Count < 4) continue;
          int partMinX = width, partMaxX = -1, partMinY = height, partMaxY = -1;
          foreach (int index in component) {
            int x = index % width, y = index / width;
            partMinX = Math.Min(partMinX, x); partMaxX = Math.Max(partMaxX, x);
            partMinY = Math.Min(partMinY, y); partMaxY = Math.Max(partMaxY, y);
          }
          int gapX = Math.Max(0, Math.Max(selectedMinX - partMaxX, partMinX - selectedMaxX));
          int gapY = Math.Max(0, Math.Max(selectedMinY - partMaxY, partMinY - selectedMaxY));
          if (gapX <= 14 && gapY <= 14) {
            selected.AddRange(component);
            included.Add(component);
            changed = true;
          }
        }
      } while (changed);
    }
    if (darkBackground) {
      bool[] selectedMask = new bool[length];
      int[] rowMin = new int[height], rowMax = new int[height];
      int[] columnMin = new int[width], columnMax = new int[width];
      for (int y = 0; y < height; y++) { rowMin[y] = width; rowMax[y] = -1; }
      for (int x = 0; x < width; x++) { columnMin[x] = height; columnMax[x] = -1; }
      foreach (int index in selected) {
        selectedMask[index] = true;
        int x = index % width, y = index / width;
        rowMin[y] = Math.Min(rowMin[y], x); rowMax[y] = Math.Max(rowMax[y], x);
        columnMin[x] = Math.Min(columnMin[x], y); columnMax[x] = Math.Max(columnMax[x], y);
      }
      List<int> enclosedDarkPixels = new List<int>();
      for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) {
        int index = y * width + x;
        if (!selectedMask[index] && rowMin[y] <= x && x <= rowMax[y] &&
            columnMin[x] <= y && y <= columnMax[x]) enclosedDarkPixels.Add(index);
      }
      selected.AddRange(enclosedDarkPixels);
    }
    if (selected.Count == 0) throw new InvalidOperationException("No character component found.");

    int minX = width, maxX = -1, minY = height, maxY = -1;
    foreach (int index in selected) {
      int x = index % width, y = index / width;
      minX = Math.Min(minX, x); maxX = Math.Max(maxX, x);
      minY = Math.Min(minY, y); maxY = Math.Max(maxY, y);
    }
    int componentMinY = minY, componentMaxY = maxY;
    Func<int, bool> isFloorShadow = index => {
      int y = index / width;
      Color color = source.GetPixel(left + index % width, top + y);
      int brightest = Math.Max(color.R, Math.Max(color.G, color.B));
      int darkest = Math.Min(color.R, Math.Min(color.G, color.B));
      int average = (color.R + color.G + color.B) / 3;
      return !preserveSeparateParts && y > componentMinY + (componentMaxY - componentMinY) * 2 / 3 &&
        brightest - darkest <= 18 && average >= 120 && average <= 235;
    };
    minX = width; maxX = -1; minY = height; maxY = -1;
    foreach (int index in selected) {
      if (isFloorShadow(index)) continue;
      int x = index % width, y = index / width;
      minX = Math.Min(minX, x); maxX = Math.Max(maxX, x);
      minY = Math.Min(minY, y); maxY = Math.Max(maxY, y);
    }
    Bitmap result = new Bitmap(maxX - minX + 1, maxY - minY + 1, PixelFormat.Format32bppArgb);
    foreach (int index in selected) {
      if (isFloorShadow(index)) continue;
      int x = index % width, y = index / width;
      result.SetPixel(x - minX, y - minY, source.GetPixel(left + x, top + y));
    }
    return result;
  }
}
'@

$FrameWidth = 64
$FrameHeight = 72
$Columns = 6
$Rows = 4
$MaxContentWidth = 58
$MaxContentHeight = 66
$AlphaThreshold = 24
$MinimumLinePixels = 3

function Get-Intervals {
  param([int[]]$Counts, [int]$Threshold, [int]$MergeGap)
  $raw = @()
  $start = -1
  for ($index = 0; $index -lt $Counts.Count; $index++) {
    if ($Counts[$index] -ge $Threshold -and $start -lt 0) { $start = $index }
    if (($Counts[$index] -lt $Threshold -or $index -eq $Counts.Count - 1) -and $start -ge 0) {
      $end = if ($Counts[$index] -ge $Threshold) { $index } else { $index - 1 }
      $raw += ,@($start, $end)
      $start = -1
    }
  }
  $merged = @()
  foreach ($interval in $raw) {
    if ($merged.Count -and $interval[0] - $merged[-1][1] - 1 -le $MergeGap) {
      $merged[-1][1] = $interval[1]
    } else { $merged += ,@($interval[0], $interval[1]) }
  }
  return $merged
}

function Get-FrameBounds {
  param([System.Drawing.Bitmap]$Bitmap)
  $rowCounts = New-Object int[] $Bitmap.Height
  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -ge $AlphaThreshold) { $rowCounts[$y]++ }
    }
  }
  $rowBands = @(Get-Intervals -Counts $rowCounts -Threshold 20 -MergeGap 8)
  if ($rowBands.Count -ne $Rows) { throw "Expected $Rows direction rows, found $($rowBands.Count)." }

  $frames = @()
  foreach ($rowBand in $rowBands) {
    $scanTop = [math]::Max(0, $rowBand[0] - 10)
    $scanBottom = [math]::Min($Bitmap.Height - 1, $rowBand[1] + 10)
    $columnCounts = New-Object int[] $Bitmap.Width
    for ($y = $scanTop; $y -le $scanBottom; $y++) {
      for ($x = 0; $x -lt $Bitmap.Width; $x++) {
        if ($Bitmap.GetPixel($x, $y).A -ge $AlphaThreshold) { $columnCounts[$x]++ }
      }
    }
    # A cigarette/smoke can be detached from Michael's body; merge nearby pieces
    # before treating the six characters as separate frames.
    $columnBands = @(Get-Intervals -Counts $columnCounts -Threshold $MinimumLinePixels -MergeGap 18)
    if ($columnBands.Count -ne $Columns) { throw "Expected $Columns frames in a row, found $($columnBands.Count)." }

    foreach ($columnBand in $columnBands) {
      $scanLeft = [math]::Max(0, $columnBand[0] - 6)
      $scanRight = [math]::Min($Bitmap.Width - 1, $columnBand[1] + 6)
      $left = $Bitmap.Width; $right = -1; $top = $Bitmap.Height; $bottom = -1
      for ($y = $scanTop; $y -le $scanBottom; $y++) {
        for ($x = $scanLeft; $x -le $scanRight; $x++) {
          if ($Bitmap.GetPixel($x, $y).A -ge $AlphaThreshold) {
            $left = [math]::Min($left, $x); $right = [math]::Max($right, $x)
            $top = [math]::Min($top, $y); $bottom = [math]::Max($bottom, $y)
          }
        }
      }
      if ($right -lt $left -or $bottom -lt $top) { throw 'Detected an empty frame.' }
      $frames += [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
    }
  }
  return $frames
}

function Export-NormalizedSheet {
  param(
    [string]$Source,
    [string]$Output,
    [string]$Preview
  )

  $sourcePath = Join-Path $ProjectRoot $Source
  $outputPath = Join-Path $ProjectRoot $Output
  $previewPath = Join-Path $ProjectRoot $Preview
  $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $bounds = @(Get-FrameBounds -Bitmap $bitmap)
    $largestWidth = ($bounds | ForEach-Object Width | Measure-Object -Maximum).Maximum
    $largestHeight = ($bounds | ForEach-Object Height | Measure-Object -Maximum).Maximum
    $scale = [math]::Min($MaxContentWidth / $largestWidth, $MaxContentHeight / $largestHeight)

    $sheet = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $Rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($sheet)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighSpeed
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

        for ($index = 0; $index -lt $bounds.Count; $index++) {
          $sourceRect = $bounds[$index]
          $width = [math]::Max(1, [math]::Round($sourceRect.Width * $scale))
          $height = [math]::Max(1, [math]::Round($sourceRect.Height * $scale))
          $column = $index % $Columns
          $row = [math]::Floor($index / $Columns)
          $left = $column * $FrameWidth + [math]::Floor(($FrameWidth - $width) / 2)
          $top = ($row + 1) * $FrameHeight - $height
          $destination = New-Object System.Drawing.Rectangle $left, $top, $width, $height
          $graphics.DrawImage($bitmap, $destination, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        }
      } finally { $graphics.Dispose() }


      $sheet.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      $previewBitmap = $sheet.Clone((New-Object System.Drawing.Rectangle 0, 0, $FrameWidth, $FrameHeight), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try { $previewBitmap.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png) }
      finally { $previewBitmap.Dispose() }
      Write-Output "${Output}: 24 frames, ${FrameWidth}x${FrameHeight}, source scale $([math]::Round($scale, 4))"
    } finally { $sheet.Dispose() }
  } finally { $bitmap.Dispose() }
}

function Get-GridCutoutPowerShellFallback {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Column,
    [int]$Row,
    [int]$GridColumns,
    [int]$GridRows
  )

  $left = [math]::Floor($Column * $Bitmap.Width / $GridColumns)
  $right = [math]::Floor(($Column + 1) * $Bitmap.Width / $GridColumns) - 1
  $top = [math]::Floor($Row * $Bitmap.Height / $GridRows)
  $bottom = [math]::Floor(($Row + 1) * $Bitmap.Height / $GridRows) - 1
  $width = $right - $left + 1
  $height = $bottom - $top + 1
  $pixelCount = $width * $height
  $background = $Bitmap.GetPixel($left, $top)
  $backgroundLike = New-Object bool[] $pixelCount
  $exterior = New-Object bool[] $pixelCount

  # The generated reference sheets use a slightly graded ivory background.
  # Mark pixels close to the cell corner as background; flood filling below
  # ensures enclosed white details on clothes and glasses remain intact.
  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $color = $Bitmap.GetPixel($left + $x, $top + $y)
      $red = $color.R - $background.R
      $green = $color.G - $background.G
      $blue = $color.B - $background.B
      $backgroundLike[$y * $width + $x] = ($red * $red + $green * $green + $blue * $blue) -le 5625
    }
  }

  $queue = New-Object 'System.Collections.Generic.Queue[int]'
  function Add-ExteriorPixel([int]$X, [int]$Y) {
    $index = $Y * $width + $X
    if ($backgroundLike[$index] -and -not $exterior[$index]) {
      $exterior[$index] = $true
      $queue.Enqueue($index)
    }
  }
  for ($x = 0; $x -lt $width; $x++) {
    Add-ExteriorPixel $x 0
    Add-ExteriorPixel $x ($height - 1)
  }
  for ($y = 0; $y -lt $height; $y++) {
    Add-ExteriorPixel 0 $y
    Add-ExteriorPixel ($width - 1) $y
  }
  while ($queue.Count) {
    $index = $queue.Dequeue()
    $x = $index % $width
    $y = [math]::Floor($index / $width)
    if ($x -gt 0) { Add-ExteriorPixel ($x - 1) $y }
    if ($x + 1 -lt $width) { Add-ExteriorPixel ($x + 1) $y }
    if ($y -gt 0) { Add-ExteriorPixel $x ($y - 1) }
    if ($y + 1 -lt $height) { Add-ExteriorPixel $x ($y + 1) }
  }

  # The oval floor shadow is separate from the character. Keep only the
  # largest connected non-background component so it is not baked into the
  # Phaser sprite.
  $visited = New-Object bool[] $pixelCount
  $largest = @()
  for ($start = 0; $start -lt $pixelCount; $start++) {
    if ($exterior[$start] -or $visited[$start]) { continue }
    $componentQueue = New-Object 'System.Collections.Generic.Queue[int]'
    $component = New-Object 'System.Collections.Generic.List[int]'
    $visited[$start] = $true
    $componentQueue.Enqueue($start)
    while ($componentQueue.Count) {
      $index = $componentQueue.Dequeue()
      $component.Add($index)
      $x = $index % $width
      $y = [math]::Floor($index / $width)
      foreach ($neighbor in @(
        $(if ($x -gt 0) { $index - 1 } else { -1 }),
        $(if ($x + 1 -lt $width) { $index + 1 } else { -1 }),
        $(if ($y -gt 0) { $index - $width } else { -1 }),
        $(if ($y + 1 -lt $height) { $index + $width } else { -1 })
      )) {
        if ($neighbor -ge 0 -and -not $exterior[$neighbor] -and -not $visited[$neighbor]) {
          $visited[$neighbor] = $true
          $componentQueue.Enqueue($neighbor)
        }
      }
    }
    if ($component.Count -gt $largest.Count) { $largest = $component.ToArray() }
  }
  if (-not $largest.Count) { throw "No character found in grid cell $Column,$Row of the source sheet." }

  $minX = $width; $maxX = -1; $minY = $height; $maxY = -1
  foreach ($index in $largest) {
    $x = $index % $width
    $y = [math]::Floor($index / $width)
    $minX = [math]::Min($minX, $x); $maxX = [math]::Max($maxX, $x)
    $minY = [math]::Min($minY, $y); $maxY = [math]::Max($maxY, $y)
  }
  $cutout = New-Object System.Drawing.Bitmap ($maxX - $minX + 1), ($maxY - $minY + 1), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  foreach ($index in $largest) {
    $x = $index % $width
    $y = [math]::Floor($index / $width)
    $cutout.SetPixel($x - $minX, $y - $minY, $Bitmap.GetPixel($left + $x, $top + $y))
  }
  return ,$cutout
}

function Get-GridCutout {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Column,
    [int]$Row,
    [int]$GridColumns,
    [int]$GridRows
  )
  $left = [math]::Floor($Column * $Bitmap.Width / $GridColumns)
  $right = [math]::Floor(($Column + 1) * $Bitmap.Width / $GridColumns) - 1
  $top = [math]::Floor($Row * $Bitmap.Height / $GridRows)
  $bottom = [math]::Floor(($Row + 1) * $Bitmap.Height / $GridRows) - 1
  try {
    return ,([SpriteSheetTools]::ExtractLargestComponent(
      $Bitmap, $left, $top, $right - $left + 1, $bottom - $top + 1
    ))
  } catch {
    throw "Could not isolate character in grid cell $Column,${Row}: $($_.Exception.Message)"
  }
}

function Export-GridSheet {
  param(
    [string]$Source,
    [int]$SourceColumns,
    [int]$SourceRows,
    [int[]]$FrameReferences,
    [string]$Output,
    [string]$Preview
  )
  if ($FrameReferences.Count -ne $Columns * $Rows) { throw "Expected 24 output frame references for $Source." }

  $bitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $ProjectRoot $Source))
  $cache = @{}
  try {
    foreach ($sourceIndex in ($FrameReferences | Select-Object -Unique)) {
      $sourceColumn = $sourceIndex % $SourceColumns
      $sourceRow = [math]::Floor($sourceIndex / $SourceColumns)
      $cache[$sourceIndex] = Get-GridCutout -Bitmap $bitmap -Column $sourceColumn -Row $sourceRow -GridColumns $SourceColumns -GridRows $SourceRows
    }
    $largestWidth = ($cache.Values | ForEach-Object Width | Measure-Object -Maximum).Maximum
    $largestHeight = ($cache.Values | ForEach-Object Height | Measure-Object -Maximum).Maximum
    $scale = [math]::Min($MaxContentWidth / $largestWidth, $MaxContentHeight / $largestHeight)
    $sheet = New-Object System.Drawing.Bitmap ($FrameWidth * $Columns), ($FrameHeight * $Rows), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($sheet)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
        for ($index = 0; $index -lt $FrameReferences.Count; $index++) {
          $frame = $cache[$FrameReferences[$index]]
          $drawWidth = [math]::Max(1, [math]::Round($frame.Width * $scale))
          $drawHeight = [math]::Max(1, [math]::Round($frame.Height * $scale))
          $column = $index % $Columns
          $row = [math]::Floor($index / $Columns)
          $destination = New-Object System.Drawing.Rectangle `
            ($column * $FrameWidth + [math]::Floor(($FrameWidth - $drawWidth) / 2)), `
            (($row + 1) * $FrameHeight - $drawHeight), $drawWidth, $drawHeight
          $graphics.DrawImage($frame, $destination)
        }
      } finally { $graphics.Dispose() }
      [SpriteSheetTools]::AlignFramesToBottom($sheet, $FrameWidth, $FrameHeight, $Columns, $Rows)
      $sheet.Save((Join-Path $ProjectRoot $Output), [System.Drawing.Imaging.ImageFormat]::Png)
      $previewBitmap = $sheet.Clone((New-Object System.Drawing.Rectangle 0, 0, $FrameWidth, $FrameHeight), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try { $previewBitmap.Save((Join-Path $ProjectRoot $Preview), [System.Drawing.Imaging.ImageFormat]::Png) }
      finally { $previewBitmap.Dispose() }
      Write-Output "${Output}: 24 frames, ${FrameWidth}x${FrameHeight}, source scale $([math]::Round($scale, 4))"
    } finally { $sheet.Dispose() }
  } finally {
    foreach ($frame in $cache.Values) { $frame.Dispose() }
    $bitmap.Dispose()
  }
}

function Export-TransformationSheet {
  param([string]$Source,[string]$Output)
  $sourcePath=Join-Path $ProjectRoot $Source
  $outputPath=Join-Path $ProjectRoot $Output
  $sourceBitmap=[System.Drawing.Bitmap]::FromFile($sourcePath)
  $targetWidth=160;$targetHeight=160;$columns=7
  try {
    $bounds=@()
    # Six bodies followed by a separate pickup: source is not an equal grid.
    $edges=@(0,310,595,875,1175,1485,1820,$sourceBitmap.Width)
    if($sourceBitmap.Width -ne 2172 -or $sourceBitmap.Height -ne 724){throw 'Transformation source changed; review the seven crop boundaries.'}
    foreach($edge in $edges[1..6]){for($y=0;$y -lt $sourceBitmap.Height;$y++){
      if($sourceBitmap.GetPixel($edge,$y).A -ge $AlphaThreshold){throw "Crop boundary $edge crosses artwork."}
    }}
    for($column=0;$column -lt $columns;$column++){
      $left=$edges[$column];$right=$edges[$column+1]-1
      $minX=$right;$maxX=$left;$minY=$sourceBitmap.Height-1;$maxY=0
      for($y=0;$y -lt $sourceBitmap.Height;$y++){for($x=$left;$x -le $right;$x++){
        if($sourceBitmap.GetPixel($x,$y).A -ge $AlphaThreshold){$minX=[math]::Min($minX,$x);$maxX=[math]::Max($maxX,$x);$minY=[math]::Min($minY,$y);$maxY=[math]::Max($maxY,$y)}
      }}
      if($maxX -lt $minX){throw "Empty transformation frame $column."}
      $bounds+=,[System.Drawing.Rectangle]::FromLTRB($minX,$minY,$maxX+1,$maxY+1)
    }
    $sheet=[System.Drawing.Bitmap]::new(($targetWidth*$columns),$targetHeight,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics=[System.Drawing.Graphics]::FromImage($sheet)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent);$graphics.CompositingMode=[System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor;$graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::Half;$graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::None
        # A single scale is essential here: scaling each frame independently
        # makes Michael appear to jump a pixel or two during transformation.
        $largestWidth=($bounds | ForEach-Object Width | Measure-Object -Maximum).Maximum
        $largestHeight=($bounds | ForEach-Object Height | Measure-Object -Maximum).Maximum
        $scale=[math]::Min(($targetWidth-8)/$largestWidth,($targetHeight-8)/$largestHeight)
        for($column=0;$column -lt $columns;$column++){
          $frame=$bounds[$column]
          $width=[math]::Max(1,[math]::Round($frame.Width*$scale));$height=[math]::Max(1,[math]::Round($frame.Height*$scale))
          $footLeft=$frame.Right;$footRight=$frame.Left
          for($fy=$frame.Bottom-35;$fy -lt $frame.Bottom;$fy++){for($fx=$frame.Left;$fx -lt $frame.Right;$fx++){
            if($sourceBitmap.GetPixel($fx,$fy).A -ge $AlphaThreshold){$footLeft=[math]::Min($footLeft,$fx);$footRight=[math]::Max($footRight,$fx)}
          }}
          $anchor=if($column -lt 6){(($footLeft+$footRight+1)/2-$frame.Left)*$scale}else{$width/2}
          $dx=[int][math]::Round($targetWidth/2-$anchor)
          if($dx -lt 0 -or $dx+$width -gt $targetWidth){throw "Frame $column would be clipped."}
          $destination=[System.Drawing.Rectangle]::new(($column*$targetWidth+$dx),($targetHeight-$height),$width,$height)
          $graphics.DrawImage($sourceBitmap,$destination,$frame,[System.Drawing.GraphicsUnit]::Pixel)
        }
      } finally {$graphics.Dispose()}
      [SpriteSheetTools]::AlignFramesToBottom($sheet,$targetWidth,$targetHeight,$columns,1)
      $sheet.Save($outputPath,[System.Drawing.Imaging.ImageFormat]::Png)
      Write-Output "${Output}: 6 transformation frames + pickup, ${targetWidth}x${targetHeight}"
    } finally {$sheet.Dispose()}
  } finally {$sourceBitmap.Dispose()}
}

if($TransformationOnly){
  Export-TransformationSheet 'public/assets/items/michael-bigcig.png' 'public/assets/items/michael-bigcig-normalized.png'
  exit
}
Export-NormalizedSheet 'public/assets/characters/Michael-sprite.png' 'public/assets/characters/michael-new.png' 'public/assets/characters/michael-new-preview.png'
Export-NormalizedSheet 'public/assets/characters/Sarina-sprite.png' 'public/assets/characters/sarina-new.png' 'public/assets/characters/sarina-new-preview.png'
Export-NormalizedSheet 'public/assets/characters/Felipe-sprite.png' 'public/assets/characters/felipe-new.png' 'public/assets/characters/felipe-new-preview.png'
# These generated sheets have intentional visual overhangs (hair and the large
# cigarette). Detect each complete sprite rather than cutting rigid source cells,
# then align all feet to the bottom of the standard Phaser frame.
Export-NormalizedSheet 'public/assets/characters/yassin-replace.png' 'public/assets/characters/yassin-new.png' 'public/assets/characters/yassin-new-preview.png'
$FrameWidth=96
$MaxContentWidth=92
Export-NormalizedSheet 'public/assets/characters/michael-bigzig.png' 'public/assets/characters/michael-bigzig-normalized.png' 'public/assets/characters/michael-bigzig-preview.png'
$FrameWidth=64
$MaxContentWidth=58
Export-TransformationSheet 'public/assets/items/michael-bigcig.png' 'public/assets/items/michael-bigcig-normalized.png'
