#include "net_misc.h"

#include <OneWire.h>
#include <DallasTemperature.h>
#include <vector>

/*============= GPIO ======================*/
OneWire oneWire;
DallasTemperature tempSensor;
/*=========================================*/

// Memory optimization techniques
// https://arduinojson.org/v6/api/json/measurejson/
// https://arduinojson.org/v6/api/jsondocument/garbagecollect/
struct IOTuple
{
	String name;
	uint8_t pin;
	void print() const noexcept
	{
		Serial.print("Name : ");
		Serial.print(name);
		Serial.print(" - Pin : ");
		Serial.println(pin);
	}
};
std::vector<IOTuple> sens;

struct IOTriple : IOTuple
{
	IOTriple(const String &name, const uint8_t &pin, const bool &state) noexcept: IOTuple{name, pin}, state{state} {}
	bool state;
	void print() const noexcept
	{
		Serial.print("Name : ");
		Serial.print(name);
		Serial.print(" - Pin : ");
		Serial.print(pin);
		Serial.print(" - State : ");
		Serial.println(state);
	}
};
std::vector<IOTriple> leds;

String mac;
bool isMother;
long update_time; // Publication period

// 0 => login
// 1 => child: sensors, mother: nothing yet
int state = 0;

#define INTERVAL_THRESHOLD 250
#define LOGIN_INTERVAL 10000

WiFiClient wclient; // Wifi

// IMPORTANT !!!!! MQTT_MAX_PACKET_SIZE needs to be changed to at least 512
// As in https://pubsubclient.knolleary.net/api.html
// ${env:USER.PATH}/Documents/Arduino/libraries/PubSubClient/src/PubSubClient.h
// Or find a way to replace a existing define directive such as
//#undef MQTT_MAX_PACKET_SIZE
//#define MQTT_MAX_PACKET_SIZE 512
PubSubClient client(wclient); // MQTT client

#define BASE_TOPIC "Esp32Manager"
#define LOGIN_TOPIC BASE_TOPIC "/login"
#define CONFIG_TOPIC BASE_TOPIC "/config"
#define SENSORS_TOPIC BASE_TOPIC "/sensors"

#define __DEBUG true

void setupTemp(const uint8_t &pin) noexcept;

void setup(void)
{
	// Serial
	Serial.begin(UPLOAD_SPEED);
	while (!Serial); // Wait for a serial connection
	Serial.println("Begining of serial !");

	mac = connect_wifi(WIFI_SSID, WIFI_PASSWORD, __DEBUG);
#if __DEBUG
	print_ip_status();
#endif
	client.setServer(MQTT_BROKER_ADDRESS, MQTT_BROKER_PORT);

	// Impossible to dynamically configure for now
	setupTemp(23); // Marqué D23 sur la carte
}

void setupTemp(const uint8_t &pin) noexcept
{
	oneWire = OneWire(pin);
	tempSensor = DallasTemperature(&oneWire);
	tempSensor.begin();
}

void setupLed(const uint8_t &pin) noexcept
{
	pinMode(pin, OUTPUT);
	digitalWrite(pin, LOW);
}

// Reset pinmode to default
void unSetupLed(const uint8_t &pin) noexcept
{
	digitalWrite(pin, LOW);
	pinMode(pin, INPUT);
}

template <typename T>
std::vector<int>::size_type indexOf(const std::vector<T> &list, const String &element) noexcept
{
	for (auto i = 0; i != list.size(); i++)
		if (list[i].name == element)
			return i;
	return -1;
}

#if __DEBUG
template <typename T>
constexpr void printList(const char *listName, const std::vector<T> &list) noexcept
{
	Serial.print("Printing ");
	Serial.println(listName);
	for (const T &item : list)
		item.print();
}
#endif

/*============== MQTT CALLBACK ===================*/

void mqtt_pubcallback(const char *topic, const uint8_t *message, const unsigned int length) noexcept
{
	const std::unique_ptr<char[]> messageTemp(new char[length]);
	for (int i = 0; i < length; i++)
		messageTemp[i] = (char)message[i];

#if __DEBUG
	Serial.print("Topic [");
	Serial.print(topic);
	Serial.print("] : ");
	for (int i = 0; i < length; i++)
		Serial.print(messageTemp[i]);
	Serial.print('\n');
#endif

	StaticJsonDocument<512> doc;
	if (const DeserializationError error = deserializeJson(doc, messageTemp.get()))
	{
		Serial.print("Error : can't deserialize json : ");
		Serial.println(error.c_str());
		return;
	}

#if __DEBUG
	if (doc.containsKey("__debug"))
	{
		Serial.println("==================  DEBUGGING  =========================");
		printList("sens", sens);
		printList("leds", leds);
		Serial.println("==================  /DEBUGGING  =========================");
	}
#endif

	// Analyse du message et Action
	if (String(topic) == CONFIG_TOPIC && doc["mac"] == mac)
	{
		if (doc.containsKey("clear") && doc["clear"])
		{
			sens.clear();
			// Reset pinmode to default
			for (const IOTriple& led : leds)
				pinMode(led.pin, INPUT);
			leds.clear();
			isMother = false;
			state = 0;
		}

		if (doc.containsKey("isMother"))
		{
			isMother = doc["isMother"];
			state = isMother ? 2 : 1;
		}

		if (doc.containsKey("sensors"))
		{
			for (const JsonObject& sen : doc["sensors"].as<JsonArray>())
			{
				const std::vector<int>::size_type idx = indexOf(sens, sen["name"]);
				if (idx == -1)
					sens.push_back({sen["name"], sen["pin"]});
				else
					sens[idx].pin = sen["pin"];
			}
		}

		if (doc.containsKey("leds"))
		{
			for (const JsonObject& led : doc["leds"].as<JsonArray>())
			{
				const std::vector<int>::size_type idx = indexOf(leds, led["name"]);
				if (idx == -1)
				{
					if (led.containsKey("value"))
					{
						leds.push_back({led["name"], led["pin"], led["value"]});
						setupLed(led["pin"]);
#if __DEBUG
						Serial.print("Changing ledstate of ");
						Serial.print(led["pin"].as<uint8_t>());
						Serial.print(" to ");
						Serial.println(leds.back().state ? HIGH : LOW);
#endif
						digitalWrite(led["pin"], leds.back().state ? HIGH : LOW);
					}
					else
					{
						leds.push_back({led["name"], led["pin"], false});
						setupLed(led["pin"]);
					}
				}
				else
				{
					if (led.containsKey("pin"))
					{
						unSetupLed(leds[idx].pin);
						leds[idx].pin = led["pin"];
						setupLed(leds[idx].pin);
					}
					if (led.containsKey("value"))
					{
						leds[idx].state = led["value"];
#if __DEBUG
						Serial.print("Changing ledstate of ");
						Serial.print(leds[idx].pin);
						Serial.print(" to ");
						Serial.println(leds[idx].state ? HIGH : LOW);
#endif
						digitalWrite(leds[idx].pin, leds[idx].state ? HIGH : LOW);
					}
				}
			}
		}
		if (doc.containsKey("update_time"))
		{
			const int newUpdate_time = doc["update_time"].as<int>() - INTERVAL_THRESHOLD;
			update_time = max(newUpdate_time, 0);
		}
	}
	doc.clear();
	doc.garbageCollect();
}

/*============= ACCESSEURS ====================*/
float get_temperature() noexcept
{
	tempSensor.requestTemperatures();
	return tempSensor.getTempCByIndex(0);
}
/*============= /ACCESSEURS ===================*/

long delta = 0, passed_time = 0; // To instantly send msg after first launch

void login_state() noexcept
{
	if (delta > LOGIN_INTERVAL)
	{
		passed_time += delta;
		delta = 0;

		/* Publish login informations periodically */
		const String payload = "{\"mac\": \"" + mac + "\"}";
#if __DEBUG
		Serial.println(LOGIN_TOPIC " = " + payload);
#endif
		publish(client, LOGIN_TOPIC, payload); // publish it
	}
	else
		delta = (millis() - passed_time);
}

void send_sensors_info() noexcept
{
	if (delta > update_time)
	{
		passed_time += delta;
		delta = 0;

		/* Publish Temperature & Light periodically */
		StaticJsonDocument<512> doc;
		doc["mac"] = mac;

		const JsonArray serial_sens = doc.createNestedArray("sensors");
		for (const IOTuple &sen : sens)
		{
			const JsonObject sensorsOut = serial_sens.createNestedObject();
			sensorsOut["value"] = sen.name == "temp" ? get_temperature() : analogRead(sen.pin);
			sensorsOut["name"] = sen.name;
		}

		const JsonArray serial_leds = doc.createNestedArray("leds");
		for (const IOTriple &led : leds)
		{
			const JsonObject ledOut = serial_leds.createNestedObject();
			ledOut["name"] = led.name;
			ledOut["value"] = led.state;
		}

		String payload;
		serializeJson(doc, payload);
#if __DEBUG
		Serial.println(SENSORS_TOPIC " = " + payload);
#endif
		publish(client, SENSORS_TOPIC, payload); // publish it
		doc.clear();
		doc.garbageCollect();
	}
	else
		delta = (millis() - passed_time);
}

void loop()
{
	if (!client.connected())
		connect_mqtt(client, "esp32", CONFIG_TOPIC, mqtt_pubcallback, __DEBUG);

	switch (state)
	{
	case 0:
		login_state();
		break;
	case 1:
		send_sensors_info();
		break;
	case 2:
		// Mother sends nothing
		break;
	default:
		Serial.println("Illegal state ! " + state);
		delay(750);
		break;
	}

	client.loop();
	delay(INTERVAL_THRESHOLD);
}
