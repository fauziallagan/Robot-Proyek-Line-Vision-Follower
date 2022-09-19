
# Laboratorium Multimedia dan Robotika Universitas Gundarma

"Line Vision Robot"

# Schematic
![Logo](https://github.com/fauziallagan/rfid/blob/master/schematic.png)

## Documentation

#### Wemos D1 R1 Pinout

| PIN | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `` | `` |  |
| `` | `` |  |
| `` | `` | |
| `` | `` | |
#### Pengaturan Kamera 

```C++
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27

#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `-`      | `-` | - |


#### Example Vibration Sensor Code

```c++
  void vibration()
{
  vibrationSensorState = digitalRead(vibrationSensorPin);
  if (vibrationSensorState == 1)
  { // Jika ada getaran di sensor = HIGH
    Serial.println("Getaran Terdeteksi!");
    digitalWrite(buzzPin, LOW);
    delay(1000);
    digitalWrite(buzzPin, HIGH);
    delay(1000);
  }
}
```

| Parameter | Description                |
| :-------- | :------------------------- |
| `` ||


#### Get all items

```c++
Coming Soon :)
  -
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `-` | `-` | - |
