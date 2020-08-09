#include "net_misc.h"

void print_ip_status() noexcept
{
	Serial.println("Wifi connected !");
	Serial.print("IP Address : ");
	Serial.println(WiFi.localIP());
	Serial.print("MAC Address : ");
	Serial.println(String(WiFi.macAddress()));
}

String connect_wifi(const char *ssid, const char *password, const bool &verbose) noexcept
{
	WiFi.disconnect();
	delay(100);
	if (verbose)
	{
		Serial.println("Connecting WiFi to " + String(ssid));
		Serial.print("Attempting to connect ");
	}
	WiFi.begin(ssid, password);
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(250);
		if (verbose)
			Serial.print(".");
	}
	if (verbose)
		Serial.print(" Connected !\n");

	return String(WiFi.macAddress());
}

boolean connect_mqtt(PubSubClient &client, const char *id, const bool &verbose) noexcept
{
	if (verbose)
		Serial.print("MQTT connecting ... ");
	if (client.connect(id))
	{
		if (verbose)
			Serial.println("Connected !");
		return true;
	}
	else
	{
		if (verbose)
			Serial.println("error while connecting");
		return false;
	}
}

char *convertToCharArray(const String &s) noexcept
{
	int strlen = s.length() + 1;
	char *res = new char[strlen];
	s.toCharArray(res, strlen);
	return res;
}

boolean connect_mqtt(PubSubClient &client, const char *id, const char *topic,
					 void (*callback)(const char *topic, const uint8_t *payload, const unsigned int length) noexcept,
					 const bool &verbose) noexcept
{
	if (verbose)
		Serial.print("MQTT connecting ... ");
	if (client.connect(id))
	{
		client.subscribe(topic);
		client.setCallback(callback);
		if (verbose)
			Serial.println("Connected !");
		return true;
	}
	else
	{
		if (verbose)
			Serial.print("error while connecting\n");
		return false;
	}
}

boolean publish(PubSubClient &client, const String &topic, const String &payload) noexcept
{
	const char *pl = convertToCharArray(payload);
	const char *tp = convertToCharArray(topic);
	boolean rt = client.publish(tp, pl);
	delete pl;
	delete tp;
	return rt;
}