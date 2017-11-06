<?php
    require 'config.php';
    $db_pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"> 
    <title><?php echo $site_title; ?></title>
</head>
<header>
    <h1><?php echo $site_title; ?></h1>
</header>
<body>
<!-- content -->
<ul>
<?php
    $result = $db_pdo->query('select * from articles');
    $arts = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach ($arts as $art) {
        echo "<li><h3>$art[title]</h3></li>";
    }
?>
</ul>
<!-- footer -->
</body>

</html>