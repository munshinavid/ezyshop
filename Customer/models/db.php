<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Decide DB credentials
        $this->setDbCredentials();

        // Connect
        $this->connect();
    }

    // ------------------------------
    // Function to set DB credentials
    // ------------------------------
    private function setDbCredentials() {
    // Railway DB credentials (temporary hardcode for testing)
    $this->host = "tramway.proxy.rlwy.net"; // Railway host
    $this->db_name = "railway";             // Railway DB name
    $this->username = "root";               // Railway user
    $this->password = "XjlzbfnpavUQyUJYJOXuqXaScRjWRahs"; // Railway password
    $this->port = 24447;                    // Railway port (as integer, not string)
   }


    // ------------------------------
    // Connect to MySQL
    // ------------------------------
    private function connect() {
        $this->conn = new mysqli(
            $this->host,
            $this->username,
            $this->password,
            $this->db_name,
            $this->port
        );

        if ($this->conn->connect_error) {
            throw new Exception("DB Connection failed: " . $this->conn->connect_error);
        }
    }

    // ------------------------------
    // SELECT query
    // ------------------------------
    public function select($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Error in DB select");
        }

        if (!empty($params)) {
            $this->bindParams($stmt, $params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        $stmt->close();
        return $data;
    }

    // ------------------------------
    // INSERT / UPDATE / DELETE
    // ------------------------------
    public function execute($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Error Processing execute");
        }

        if (!empty($params)) {
            $this->bindParams($stmt, $params);
        }

        $success = $stmt->execute();
        if ($stmt->affected_rows === -1) {
            throw new Exception("Error Processing Request");
        }
        $stmt->close();
        return $success;
    }

    public function insert($query, $params = []) {
        $this->execute($query, $params);
        return $this->getLastInsertId();
    }

    public function update($query, $params = []) {
        return $this->execute($query, $params);
    }

    public function delete($query, $params = []) {
        return $this->execute($query, $params);
    }

    // ------------------------------
    // Bind parameters
    // ------------------------------
    private function bindParams($stmt, $params) {
        $types = '';
        foreach ($params as $param) {
            if (is_int($param)) {
                $types .= 'i';
            } elseif (is_double($param)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$params);
    }

    public function getLastInsertId() {
        return $this->conn->insert_id;
    }

    public function beginTransaction() {
        $this->conn->begin_transaction();
    }

    public function commit() {
        $this->conn->commit();
    }

    public function rollback() {
        $this->conn->rollback();
    }

    public function close() {
        $this->conn->close();
    }
}
