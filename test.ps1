for ($i = 0; $i -lt 15; $i++) {
    Write-Host "Request $i"
    $response = curl.exe -s -i http://localhost:8080/api/test
    $response | Select-String -Pattern "HTTP/|X-RateLimit"
    Write-Host "-------------------"
}
