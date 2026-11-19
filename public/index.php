<?php

declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$isApiRequest = $requestPath === '/health' || str_starts_with($requestPath, '/api/');

if (!$isApiRequest) {
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');

    $html = file_get_contents(__DIR__ . '/index.html');
    if ($html === false) {
        http_response_code(500);
        echo 'Application interface is temporarily unavailable.';
        exit;
    }

    $html = preg_replace_callback(
        '/(src|href)="(\.\/static\/(?:js|css)\/[^"]+\.(?:js|css))"/',
        static function (array $matches): string {
            $assetPath = __DIR__ . '/' . ltrim($matches[2], './');
            $version = is_file($assetPath) ? (string) filemtime($assetPath) : 'current';

            return $matches[1] . '="' . $matches[2] . '?v=' . $version . '"';
        },
        $html
    );

    echo $html;
    exit;
}

$targetUrl = 'http://127.0.0.1:8000' . $requestPath;
$queryString = $_SERVER['QUERY_STRING'] ?? '';
if ($queryString !== '') {
    $targetUrl .= '?' . $queryString;
}

$requestHeaders = [];
$excludedRequestHeaders = ['connection', 'content-length', 'host', 'transfer-encoding'];
foreach (getallheaders() as $name => $value) {
    if (!in_array(strtolower($name), $excludedRequestHeaders, true)) {
        $requestHeaders[] = $name . ': ' . $value;
    }
}
$requestHeaders[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? '');
$requestHeaders[] = 'X-Forwarded-Proto: ' . (($_SERVER['HTTPS'] ?? '') === 'on' ? 'https' : 'http');

$curl = curl_init($targetUrl);
curl_setopt_array($curl, [
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    CURLOPT_HTTPHEADER => $requestHeaders,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_HEADERFUNCTION => static function ($curlHandle, string $header): int {
        $length = strlen($header);
        $trimmedHeader = trim($header);

        if ($trimmedHeader === '') {
            return $length;
        }

        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $trimmedHeader, $matches)) {
            http_response_code((int) $matches[1]);
            return $length;
        }

        $name = strtolower(strtok($trimmedHeader, ':') ?: '');
        $excludedResponseHeaders = ['connection', 'content-length', 'transfer-encoding'];
        if (!in_array($name, $excludedResponseHeaders, true)) {
            header($trimmedHeader, false);
        }

        return $length;
    },
    CURLOPT_WRITEFUNCTION => static function ($curlHandle, string $body): int {
        echo $body;
        return strlen($body);
    },
]);

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if (!in_array($method, ['GET', 'HEAD'], true)) {
    curl_setopt($curl, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}
if ($method === 'HEAD') {
    curl_setopt($curl, CURLOPT_NOBODY, true);
}

$success = curl_exec($curl);
if ($success === false) {
    if (!headers_sent()) {
        http_response_code(502);
        header('Content-Type: application/json');
    }
    echo json_encode(['detail' => 'Application service is temporarily unavailable.']);
}

curl_close($curl);
