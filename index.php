<?php

// Set game id to easily change it both in the url to send highscores and showing the highscores
$gameId = getenv('GAME_ID') ?: 2;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Get from environment in production, but use a test token for development
    $apiToken = getenv('API_TOKEN') ?: '3|UsCfU713vmxRvnLViQ7khTJyx8G4DLiaK4RZihbq3c9452a8';

    $url = "https://highscores.martindilling.com/api/v1/games/{$gameId}/highscores";
    $data = [
        'player' => $data['player'] ?? null,
        'score' => $data['score'] ?? null,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiToken}",
        'Content-Type: application/json',
        'Accept: application/json',
    ]);

    $response = curl_exec($ch);
    if ($response === false) {
        // Handle cURL execution error
        die('cURL error: ' . curl_error($ch));
    }

    // Get HTTP response status code
    $httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    // Check for HTTP errors (non-2xx status codes)
    if ($httpStatusCode < 200 || $httpStatusCode >= 300) {
        die("HTTP error occurred: Status code $httpStatusCode. Response: $response");
    }
    curl_close($ch);

    http_response_code(200);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => true]);
    exit();
}

$page = $_GET['page'] ?? 'menu';

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ClickClack</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>

    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="ClickClack" />
    <link rel="manifest" href="/site.webmanifest" />
</head>
<body>
    Made responsive
    <div class="container">
        Made this responsive
        <?php if ($page === 'menu'): ?>
            <div class="screen-menu">
                <a
                    href="/?page=game"
                    class="menu-button"
                >
                    Play
                </a>
                <a
                    href="/?page=highscore"
                    class="menu-button"
                >
                    Highscores
                </a>
            </div>
        <?php elseif ($page === 'highscore'): ?>
            <div class="screen-highscore">
                <a
                    href="/"
                    class="screen--back-button"
                >
                    &#x2C2; Menu
                </a>
                <div class="highscore-table">
                    <iframe
                        src="https://highscores.martindilling.com/games/<?php echo $gameId; ?>/embed?fontSize=150&bgColor=cad5e2&textColor=1d293d&borderColor=62748e"
                        title="Highscore table for ClickClack"
                        width="100%"
                        height="100%"
                    >
                    </iframe>
                </div>
            </div>
        <?php elseif ($page === 'game'): ?>
            <div class="screen-game">
                <div
                    class="game-over-overlay"
                    style="display: none;"
                >
                    <div class="game-over-score"></div>
                    <input
                        class="submit-name-input"
                        type="text"
                        placeholder="Enter your name..."
                        id="name"
                        name="name"
                        autocomplete="off"
                    >
                    <a
                        href="#"
                        class="submit-button"
                    >
                        Submit highscore
                    </a>
                    <a
                        href="/"
                        class="exit-button"
                    >
                        Back to menu
                    </a>
                </div>
                <a
                    href="/"
                    class="screen--back-button"
                >
                    &#x2C2; Menu
                </a>
                <div class="game-status-bar">
                    <div class="score">
                        <div class="score--label"></div>
                        <div class="score--value"></div>
                    </div>
                    <div class="status-message">
                    </div>
                    <div class="timer">
                        <div class="timer--label"></div>
                        <div class="timer--value"></div>
                    </div>
                </div>
                <div class="game-grid">
                    <?php foreach (range(1, 100) as $cell): ?>
                        <div class="cell"></div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
