/*
 HC-SR04 Ping distance sensor:
 VCC to arduino 5v 
 GND to arduino GND
 Echo to Arduino pin 7 
 Trig to Arduino pin 8
 
 This sketch originates from Virtualmix: http://goo.gl/kJ8Gl
 Has been modified by Winkle ink here: http://winkleink.blogspot.com.au/2012/05/arduino-hc-sr04-ultrasonic-distance.html
 And modified further by ScottC here: http://arduinobasics.blogspot.com.au/2012/11/arduinobasics-hc-sr04-ultrasonic-sensor.html
 on 10 Nov 2012.
 */

#include <Bridge.h>
#include <YunServer.h>
#include <YunClient.h>

#include <SPI.h>
#include <boards.h>
#include <RBL_nRF8001.h>
#include <services.h>

#define echoPin 12 // Echo Pin
#define trigPin 11 // Trigger Pin
#define LEDPin 13 // Onboard LED
#define warningPin 10 

int maximumRange = 200; // Maximum range needed
int minimumRange = 0; // Minimum range needed
long duration, distance; // Duration used to calculate distance
YunServer server; 
boolean sensorDetected = false;


long lastSeen = 0;
long lastAway = 0;

void setup() {
 Serial.begin (9600);
 pinMode(trigPin, OUTPUT);
 pinMode(echoPin, INPUT);
 pinMode(LEDPin, OUTPUT); // Use LED indicator (if required)
 pinMode(warningPin, OUTPUT);
    Bridge.begin();
    server.listenOnLocalhost();
  server.begin();
  
    Serial.begin(57600);
  ble_begin();
  ble_set_name("arduinoble");

  
}

void loop() {
  sensorloop();
/* The following trigPin/echoPin cycle is used to determine the
 distance of the nearest object by bouncing soundwaves off of it. */ 
 YunClient client = server.accept();

  if (client) {
    process(client);
    client.stop();
  }

  delay(50); 
}

void bt_paired(){
    ble_connected();
}

void is_present(){
    return sensorDetected && bt_paired();
}

void process(YunClient client) {
  String command = client.readStringUntil('/');

  if (command == "digital") {
    digitalCommand(client);
  }

}

void digitalCommand(YunClient client) {
  int pin, value;

  // Read pin number
  pin = client.parseInt();

  // If the next character is a '/' it means we have an URL
  // with a value like: "/digital/13/1"
  if (client.read() == '/') {
    value = client.parseInt();
    digitalWrite(pin, value);
  }
  else {
    value = digitalRead(pin);
  }

  // Send feedback to client
  client.print(F("Pin D"));
  client.print(pin);
  client.print(F(" set to "));
  client.println(value);

  // Update datastore key with the current pin value
  String key = "D";
  key += pin;
  Bridge.put(key, String(value));
}
  

void sensorloop(){
 digitalWrite(trigPin, LOW); 
 delayMicroseconds(2); 

 digitalWrite(trigPin, HIGH);
 delayMicroseconds(10); 
 
 digitalWrite(trigPin, LOW);
 duration = pulseIn(echoPin, HIGH);
 
 //Calculate the distance (in cm) based on the speed of sound.
 distance = duration/58.2;
 
 if (distance <= 50){
 /* Send a negative number to computer and Turn LED ON 
 to indicate "out of range" */
 //Serial.println("-1");
 sensorDetected = True;
 lastSeen = millis();
 }
 else {
 /* Send the distance to the computer using Serial protocol, and
 turn LED OFF to indicate successful reading. */
 //Serial.println(distance);
 digitalWrite(LEDPin, LOW);
 sensorDetected = false;
 lastAway = millis();
 }
 
if is_present() {
 Bridge.put(String(LEDPin), String(1));
} else {
 Bridge.put(String(LEDPin), String(0)); 
}

 if (lastAway+ 5000 < millis()   ){
     digitalWrite(warningPin, HIGH);
 } else {
     digitalWrite(warningPin, LOW);
 }
 
}
