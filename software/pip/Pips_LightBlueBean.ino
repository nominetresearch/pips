int pipStatus = 0;
int beepPreset = 5;
int flashInterval = 5;
uint8_t defaultStatusData[3];
unsigned long currentMillis = 0;

const int ledPin = 4; //pin attached to the LED
const int buzzerPin = 2; //pin attached to the buzzer
const int buttonPin = 0;  //pin atatched to the button (pull up)

volatile boolean pin0_flag = 0; //Flag representing the button being pressed

//fucntion invoked by interupt when the button is pressed
void pin0_isr() {
  pin0_flag = 1;
}


void setup() 
{
  //Set pin attached to the LED
  pinMode(ledPin, OUTPUT);

  //Set pin attached to the buzzer
  pinMode(buzzerPin, OUTPUT);

  //Initialize the pushbutton pin as an input and set it to high
  pinMode(buttonPin, INPUT); 
  digitalWrite(buttonPin, HIGH);

  //Attach a change interrupt to the pin attached to the button
  Bean.attachChangeInterrupt(buttonPin, pin0_isr);
  
  pin0_flag = 0; 

  //Set the name of the bean to PIP
  //TODO: might need to assign a suffux to the name for easy recognition. 
  //Maybe the suffix should identify the type of task the button configured to alert for. 
  char idString[20];
  sprintf(idString, "PIP");
  Bean.setBeanName(idString);
  Bean.setLed(0,0,0);

  //Enable the bean to wake the ATMEGA328 on luetooth connection
  //It would be more desiderable to wake the ATMEGA on a scratch change notification instead
  //but this is not currently supported by the Light Blue Bean 
  Bean.enableWakeOnConnect( true );

  //Set the default parameters of the pip 
  setDefaultState();
}


/*
* Set the pip into the default state
 */
void setDefaultState()
{   
  defaultStatusData[0] = 3; //Pip is in a unknown state
  defaultStatusData[1] = 1; //Beep preset 1
  defaultStatusData[2] = 5; //500 millisecondsfor each flash
  
  //Set the scratch with the default parameters
  Bean.setScratchData(2, defaultStatusData, sizeof(defaultStatusData));
  
  //Disable buzzer
  noTone(buzzerPin);
  
  //Disable led
  digitalWrite(ledPin, LOW);
  
  pin0_flag = 0; 
}


/*
 * Control the LED component of the pip
 * interval is the time in milliseconds between on and off states
 */
void ledController(int interval){
  static unsigned long previousMillis = 0;
  static boolean on = false;
  
  if(currentMillis - previousMillis > interval) {
    // save the last time you blinked the LED 
    previousMillis = currentMillis;   
    if (on) {
      digitalWrite(ledPin, HIGH);  
      on = !on;
    } else {
      digitalWrite(ledPin, LOW);
      on = !on;
    }
  }
  
}

/*
 * Control the buzzer component of the pip
 * interval is the time in milliseconds between sound alerts
 * frequency is the frequency in Hz 
 */
void buzzerController(int beepPreset) {
  static unsigned long previousMillis = 0;
  static boolean on = false;

  /*
   * Determine which beep preset is to be used.  If an unknown preset
   * is used then we default to the same as preset 1
   */

  switch (beepPreset){
    
    //Case 1: 1 Beep at 1Khz for 100ms every 1s
    case 1:  
      if(currentMillis - previousMillis > 500) {
        previousMillis = currentMillis;   
        if (on) {
          tone(buzzerPin, 1000, 100); 
          on = !on;
        } else {
          noTone(buzzerPin);
          on = !on;
        }
      }
      break;
    //Case 2: 3 Beeps incrementing at 500hz for 200ms separated by 400ms every 1s  
    case 2:
      if(currentMillis - previousMillis > 1000) {
        previousMillis = currentMillis;   
        if (on) {
          tone(buzzerPin, 500, 200);
          delay(400); 
          tone(buzzerPin, 1000, 200);
          delay(400); 
          tone(buzzerPin, 1500, 200);
          delay(400);
          on = !on;
        } else {
          noTone(buzzerPin);
          on = !on;
        }
      }
      break;    
    //Case 3: 3 Beeps at 500hz for 200ms separated by 400ms every 1s  
    case 3:
      if(currentMillis - previousMillis > 1000) {
        previousMillis = currentMillis;   
        if (on) {
          tone(buzzerPin, 4000, 200);
          delay(400); 
          tone(buzzerPin, 4000, 200);
          delay(400); 
          tone(buzzerPin, 4000, 200);
          delay(400);
          tone(buzzerPin, 4000, 600);
          delay(400);
          on = !on;
        } else {
          noTone(buzzerPin);
          on = !on;
        }
      }
      break;
      //Case 4: C Major scale every 1s  
    case 4:
      if(currentMillis - previousMillis > 1000) {
        previousMillis = currentMillis;   
        if (on) {
          tone(buzzerPin, 261.63, 200);
          delay(400); 
          tone(buzzerPin, 293.66, 200);
          delay(400); 
          tone(buzzerPin, 329.63, 200);
          delay(400);
          tone(buzzerPin, 349.23, 200);
          delay(400);
          tone(buzzerPin, 392.00, 200);
          delay(400);
          tone(buzzerPin, 440.00, 200);
          delay(400);
          tone(buzzerPin, 493.88, 200);
          delay(400);
          tone(buzzerPin, 440.00, 200);
          delay(400); 
          tone(buzzerPin, 392.00, 200);
          delay(400);
          tone(buzzerPin, 349.23, 200);
          delay(400);
          tone(buzzerPin, 329.63, 200);
          delay(400);
          tone(buzzerPin, 293.66, 200);
          delay(400);
          tone(buzzerPin, 261.63, 600);
          delay(400);
          on = !on;
        } else {
          noTone(buzzerPin);
          on = !on;
        }
      }
      break;
    default:
      if(currentMillis - previousMillis > 500) {
        previousMillis = currentMillis;   
        if (on) {
          tone(buzzerPin, 1000, 100); 
          on = !on;
        } else {
          noTone(buzzerPin);
          on = !on;
        }
      }
      break;  
  }

}


/*
 * Checks the flag representing the button being pressed
 * and handle the button-press action 
 */
void buttonController(){
  if(pin0_flag == 1) {
    //Interrupt received, turn ISR off
    Bean.detachChangeInterrupt(buttonPin);
    pin0_flag = 0;  
    //Debounce
    delay(250);
    
    //Blink the onboard LED Green
    Bean.sleep(500);
    Bean.setLed(0, 255, 0);
    Bean.sleep(500);
    Bean.setLed(0, 0, 0);

    //Update the scratch data with the new status (off)
    ScratchData statusData = Bean.readScratchData(2);
    statusData.data[0] = 0;
    Bean.setScratchData(2, (uint8_t*) & statusData.data, sizeof(statusData.data));
    //The status data is also pushed to the scratch from where the client (pips_gateway_BLT_procy) receives notifications (button pressed)
    
    //Flip the state (Hack)
    statusData.data[0] = 3;
    Bean.setScratchData(1, (uint8_t*) & statusData.data, sizeof(statusData.data));
    statusData.data[0] = 0;
    Bean.setScratchData(1, (uint8_t*) & statusData.data, sizeof(statusData.data));
    
    //Test delay to see if the button press has been notified
    delay(1000);
    
    //Turn on the interrupt
    Bean.attachChangeInterrupt(buttonPin, pin0_isr);
  } 
}

/*
 * Show the status of the pip using the onboard LED
 * Blinking blue light indicates activity
 * TODO: This function could be expanded to indicate error states
 */
void statusBlink(int interval){
  static unsigned long previousMillis = 0;
  static boolean on = false;
  
  if(currentMillis - previousMillis > interval) {
    // save the last time you blinked the LED 
    previousMillis = currentMillis;   

    LedReading rgbSetting;
    rgbSetting = Bean.getLed();
    if (on) {
      Bean.setLed(0, 0, 0); 
      on = !on;
    } else {
      Bean.setLed(0, 0, 255);
      on = !on;
    }
  }
}

/*
 * Function to control the transition of the pip to sleep mode
 * timeout is the time in millisecond that pe pip is allowe to be
 * in an unknown state
 */
void sleepController(int timeout){
  static unsigned long previousMillis = 0;
  static boolean initialised = false;
  
  if (!initialised) { 
    previousMillis = currentMillis;
    initialised = true;
  }

  if (initialised & (currentMillis - previousMillis > timeout) & ((pipStatus == 0) || (pipStatus == 3))) {
    Bean.setLed(0, 0, 0);
    initialised = false;
    setDefaultState();
    Bean.sleep( 0xFFFFFFFF );
  }
}


/*
 * Update the internal variables defining the pip status by reading the 
 * information from the BLE Scratch data
 */
void statusController(int interval){
  //read required status from BLE scketch 2
  static unsigned long previousMillis = 0;
  ScratchData statusData2 = Bean.readScratchData(2);
  
  if (pipStatus != statusData2.data[0]) {
   pipStatus = statusData2.data[0];
   beepPreset = statusData2.data[1];
   flashInterval = statusData2.data[2];
  }
   if ((currentMillis - previousMillis > interval) & (pipStatus != 0))  {
     previousMillis = currentMillis;  
     Bean.setScratchData(1, (uint8_t*) & statusData2.data, sizeof(statusData2.data));
   }
}


//the loop routine runs over and over again forever:
void loop() 
{
  currentMillis = millis();
  statusController(1000);
  if (pipStatus == 1) { 
    buttonController();
    ledController(flashInterval*100);
    buzzerController(beepPreset);
  }

  statusBlink(500);

  sleepController(10000); 
} 

