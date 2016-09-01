#include <DHT.h>

#define DHTTYPE DHT22
#define DHTPIN 7
#define LED_BLINK 13
#define LED_ONOFF 12
#define LED_SLIDER 6

DHT dht(DHTPIN, DHTTYPE);

bool blinkLed = false;

void setup() {
  Serial.begin(9600);
  pinMode(LED_BLINK, OUTPUT);
  pinMode(LED_ONOFF, OUTPUT);
  pinMode(LED_SLIDER, OUTPUT);
  digitalWrite(LED_SLIDER, LOW);
  digitalWrite(LED_BLINK, LOW);
  digitalWrite(LED_ONOFF, LOW);
  dht.begin();
  Serial.println("Iniciado.");
  Serial.println("Use: help - para ver os comandos");
}

String split(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = { 0, -1 };
  int maxIndex = data.length()-1;
  for(int i=0; i<=maxIndex && found<=index; i++) {
    if(data.charAt(i)==separator || i==maxIndex) {
      found++;
      strIndex[0] = strIndex[1]+1;
      strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }
  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void loop() {
  String inputString = "";
  while (Serial.available() > 0) {
    char inChar = Serial.read(); 
    inputString += inChar;
  }
  if(inputString.length() > 0) {
    if (inputString == "oi") {
      Serial.println("Ola, sou o Arduino");
    }
    if(inputString.startsWith("sld")) {
      String s[3];
      for(int i = 0; i < 3; i++) s[i] = split(inputString, ':', i);
      int pin = s[1].toInt();
      int value = s[2].toInt();
      Serial.println("SLIDER PORTA: " + s[1] + " VALOR: " + s[2]);
      analogWrite(pin, value);
    }
    if (inputString == "y") {
      digitalWrite(LED_ONOFF, HIGH);
      Serial.println("LED: Ligado");
    }
    if (inputString == "n") {
      digitalWrite(LED_ONOFF, LOW);
      Serial.println("LED: Desligado");
    } 
    if (inputString == "blink") {
      blinkLed = !blinkLed;
      Serial.println(blinkLed ? "Blink: Ligado" : "Blink: Desligado");
    }
    delay(10);
  }
  
  if (blinkLed == true) {
    digitalWrite(LED_BLINK, HIGH);
    delay(500);
    digitalWrite(LED_BLINK, LOW);
    delay(500);
  }
  // Leitura da umidade
  float h = dht.readHumidity();
  // Leitura da temperatura (Celsius)
  float t = dht.readTemperature();
  
  // Verifica se o sensor esta respondendo
  if (isnan(h) || isnan(t))
  {
    Serial.println("Falha ao ler dados do sensor DHT !!!");
    return;
  }

  // Mostra a temperatura no serial monitor e no display
  String temp = "txt;temp;Temperatura: ";
  temp.concat(t);
  temp.concat(" *C;");
  Serial.println(temp);
  delay(100);
  // Mostra a umidade no serial monitor e no display
  String umi = "txt;umi;Umidade: ";
  umi.concat(h);
  umi.concat(" %;");
  Serial.println(umi);
  delay(100);
  //delay(2000);
}

