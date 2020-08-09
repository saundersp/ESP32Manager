#pragma once

#include <WiFi.h>
#include <PubSubClient.h>
#include <SPIFFS.h>
#include <ArduinoJson.h> // by Benoit Blanchon

#define UPLOAD_SPEED 9600 // Mesurée en baud

// TODO A modifier si besoin !
#define WIFI_SSID "__Tempconn" //"MODIFY_ME"
#define WIFI_PASSWORD "PierreS07" //"MODIFY_ME"
#define MQTT_BROKER_ADDRESS "192.168.43.123" //"192.MODIFY_ME.8"
#define MQTT_BROKER_PORT 1883

void print_ip_status() noexcept;
String connect_wifi(const char *ssid, const char *password, const bool &verbose) noexcept;
char *convertToCharArray(const String &s) noexcept;
boolean connect_mqtt(PubSubClient &client, const char *id, const bool &verbose) noexcept;
boolean connect_mqtt(PubSubClient &client, const char *id, const char *topic,
					 void (*callback)(const char *topic, const uint8_t *payload, const unsigned int length) noexcept,
					 const bool &verbose) noexcept;
boolean publish(PubSubClient &client, const String &topic, const String &payload) noexcept;