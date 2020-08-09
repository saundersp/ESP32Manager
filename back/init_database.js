use Esp32Manager;
["user_login", "config", "sensors", "login"].forEach(col => db.createCollection(col));
db.user_login.insertOne({ user: "admin", pwd: "XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg=" });