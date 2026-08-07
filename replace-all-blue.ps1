# Replace remaining light blue/blue colors with sidebar indigo equivalents
Get-ChildItem -Path ".\src" -Recurse -Include *.jsx,*.js,*.css | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content `
        -replace 'bg-\[#e8e5ff\]', 'bg-white' `
        -replace 'bg-blue-50/50', 'bg-indigo-50/50' `
        -replace 'bg-blue-50', 'bg-indigo-50' `
        -replace 'bg-blue-100/50', 'bg-indigo-100/50' `
        -replace 'bg-blue-100', 'bg-indigo-100' `
        -replace 'bg-blue-200', 'bg-indigo-200' `
        -replace 'border-blue-100', 'border-indigo-100' `
        -replace 'border-blue-200', 'border-indigo-200' `
        -replace 'border-blue-400', 'border-indigo-400' `
        -replace 'border-blue-500', 'border-indigo-500' `
        -replace 'text-blue-700', 'text-indigo-700' `
        -replace 'text-blue-800', 'text-indigo-800' `
        -replace 'text-blue-500', 'text-indigo-500' `
        -replace 'text-blue-600', 'text-indigo-600' `
        -replace 'hover:bg-blue-200', 'hover:bg-indigo-200' `
        -replace 'focus:border-blue-500', 'focus:border-indigo-500' `
        -replace 'focus:ring-blue-500', 'focus:ring-indigo-500' `
        -replace '#d1ecf1', '#e0e7ff' `
        -replace '#007bff', '#4F46E5' `
        -replace '#0069d9', '#4338ca'
    if ($content -ne $newContent) {
        Set-Content $_.FullName -Value $newContent -NoNewline
        Write-Host ("Updated: " + $_.Name)
    }
}
