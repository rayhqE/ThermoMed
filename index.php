<?php
// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve the JSON data from the POST request
    $data = json_decode(file_get_contents('php://input'), true);

    // Extract the relevant fields
    $temperature = floatval($data['temperature']);
    $recipient = "lalhappy308@gmail.com";
    $subject = $data['subject'] ?? "Temperature Alert";
    $message = $data['message'] ?? "";

    // Validate that temperature data is present
    if (is_nan($temperature)) {
        http_response_code(400);
        echo "Invalid temperature data.";
        exit;
    }

    // Check if the temperature has reached or exceeded 35°C
    if ($temperature >= 30) {
        // Build the email content
        $email_content = "Temperature Alert: The current simulated temperature has reached $temperature°C. Immediate action is required.\n\n";
        $email_content .= "Details:\n$message";

        // Build the email headers
        $email_headers = "From: Alert System <no-reply@yourdomain.com>";

        // Send the email
        if (mail($recipient, $subject, $email_content, $email_headers)) {
            http_response_code(200);
            echo "Alert email sent successfully.";
        } else {
            http_response_code(500);
            echo "Failed to send alert email.";
        }
    } else {
        echo "Temperature is below the alert threshold. No email sent.";
    }
} else {
    // Not a POST request, set a 403 (forbidden) response code
    http_response_code(403);
    echo "Forbidden: Invalid request method.";
}
?>
