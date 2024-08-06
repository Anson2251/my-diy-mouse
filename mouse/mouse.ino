#define DY_PIN A0
#define DX_PIN A1
#define BTN_PIN 7

#define MAX_VAL 1024

int baseX = 0;
int baseY = 0;

int dy = 0;
int dx = 0;
int clicked = 0;

bool setBase = false;

char buffer[128];

void setup() {
  pinMode(DY_PIN, INPUT);
  pinMode(DX_PIN, INPUT);
  pinMode(BTN_PIN, INPUT);
  Serial.begin(9600);
}

double getAcceleration(int value, int range) {
  return pow(sin((double)value / (double)range), 2);
}

void loop() {
  if (!setBase) {
    setBase = true;
    baseY = analogRead(DY_PIN);
    baseX = analogRead(DX_PIN);
  }
  
  int valueY = analogRead(DY_PIN) - baseY;
  int valueX = analogRead(DX_PIN) - baseX;
  double accY = getAcceleration(valueY, (valueY > 0 ? (MAX_VAL - baseY) : baseY));
  double accX = getAcceleration(valueX, (valueX > 0 ? (MAX_VAL - baseX) : baseX));
  dy = valueY * accY;
  dx = valueX * accX;
  clicked = digitalRead(BTN_PIN);

  sprintf(buffer, "%d %d %d", dx, dy, clicked);
  Serial.println(buffer);
}
