<!---
Markdown description for SystemRDL register map.

Don't override. Generated from: OBMF_channels
-->

## OBMF_channels address map

- Absolute Address: 0x0
- Base Offset: 0x0
- Size: 0x1C002

<p>This file is for illustrative purposes only - it helps to generate linked HTML content</p>

| Offset|Identifier|            Name            |
|-------|----------|----------------------------|
|0x00000| discovery|OBMF-ICP Discovery Structure|
|0x04000|   flash  |    OBMF_FLASH_STRUCTURE    |
|0x08000|    vw    |OBMF_VIRTUAL_WIRES_STRUCTURE|
|0x0C000|    rtc   |        RTC_STRUCTURE       |
|0x10000|   uart   |     OBMF_UART_STRUCTURE    |
|0x14000|   mmio   |      OBMF_Generic_MMIO     |
|0x18000|    tpm   |     OBMF_TPM_STRUCTURE     |
|0x1C000| post_code|  OBMF_POST_CODE_STRUCTURE  |

## discovery register file

- Absolute Address: 0x0
- Base Offset: 0x0
- Size: 0x514

<p>This structure must be provided by the OBMF-ICP Secondary on Channel 0. The Primary can read this content to obtain the list of 
all the other channels that the OBMF-ICP Secondary expects to be supported by the Primary. Some of these channels may be mandatory, while 
some are optional. The Primary should enable all the necessary channels by writing to the “Enable” fields in this data structure. In addition to the 
channel list, this discovery structure allows OBMF-ICP endpoints to establish OBMF-ICP protocol version compatibility and other capabilities.</p>

|Offset|  Identifier  |           Name          |
|------|--------------|-------------------------|
| 0x000|   OBMF_VER   |OBMF-ICP Protocol Version|
| 0x008|   READ_SIZE  |    Maximum Read Size    |
| 0x010|  WRITE_SIZE  |    Maximum Write Size   |
| 0x018|MAX_CHANNEL_NO|  Maximum Channel Number |
| 0x100|   CHANNEL_1  |        Channel 1        |
| 0x200|   CHANNEL_2  |        Channel 2        |
| 0x300|   CHANNEL_3  |        Channel 3        |
| 0x400|   CHANNEL_4  |        Channel 4        |
| 0x500|   CHANNEL_5  |        Channel 5        |

### OBMF_VER register

- Absolute Address: 0x0
- Base Offset: 0x0
- Size: 0x4

<p>OBMF-ICP Protocol Version supported by the device</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|31:0| OBMF_VER |   r  | 0x0 |  — |

#### OBMF_VER field

<p>OBMF-ICP Protocol Version supported by the device</p>

### READ_SIZE register

- Absolute Address: 0x8
- Base Offset: 0x8
- Size: 0x8

<p>Defines the maximum Read response payload size that should be used. READ_SIZE_PRI and READ_SIZE_SEC define the capabilities 
of both parties and the actual size used is the minimum of both values. The same size is used in both directions 
of communication.</p>

| Bits|  Identifier |Access|Reset|Name|
|-----|-------------|------|-----|----|
| 31:0|READ_SIZE_SEC|   r  | 0x40|  — |
|63:32|READ_SIZE_PRI|  rw  | 0x40|  — |

#### READ_SIZE_SEC field

<p>Indicates the total number of bytes for a Read transaction that the OBMF-ICP Secondary supports. OBMF-ICP Primary must 
obey this limit.</p>

#### READ_SIZE_PRI field

<p>Indicates the total number of bytes for a Read transaction that the OBMF-ICP Primary supports. A minimum size that every 
OBMF-ICP Primary shall support is 64-bytes and this should be the default value of this register. OBMF-ICP Primary may write to 
this field to allows larger Read sizes to be initiated by OBMF-ICP Secondary.</p>

### WRITE_SIZE register

- Absolute Address: 0x10
- Base Offset: 0x10
- Size: 0x8

<p>Defines the maximum Write request payload size that should be used. WRITE_SIZE_PRI and WRITE_SIZE_SEC define the capabilities 
of both parties and the actual size used is the minimum of both values. The same size is used in both directions of communication.</p>

| Bits|  Identifier  |Access|Reset|Name|
|-----|--------------|------|-----|----|
| 31:0|WRITE_SIZE_SEC|   r  | 0x40|  — |
|63:32|WRITE_SIZE_PRI|  rw  | 0x40|  — |

#### WRITE_SIZE_SEC field

<p>Indicates the total number of bytes for a Write transaction that the OBMF-ICP Secondary supports.</p>

#### WRITE_SIZE_PRI field

<p>Indicates the total number of bytes for a Write transaction that the OBMF-ICP Primary supports. A minimum size that every OBMF-ICP Primary shall support is 64-bytes and this should be the default value of this register.</p>

### MAX_CHANNEL_NO register

- Absolute Address: 0x18
- Base Offset: 0x18
- Size: 0x4

<p>The last channel number listed in the channel list of this Discovery Structure. Note that Channel 0 is reserved for Control Channel and does not require 
discovery while all other channels are sequentially numbered from 1 to MAX_CHANNEL_NO.</p>

|Bits|  Identifier  |Access|Reset|Name|
|----|--------------|------|-----|----|
|31:0|MAX_CHANNEL_NO|   r  | 0x0 |  — |

#### MAX_CHANNEL_NO field

<p>The last channel number listed in the channel list of this Discovery Structure. Note that channel 0 is reserved for Control Channel 
and does not require discovery while all other channels are numbered from 1 to MAX_CHANNEL_NO.</p>

## CHANNEL_1 register file

- Absolute Address: 0x100
- Base Offset: 0x100
- Size: 0x14

<p>Channel 1 Discovery Structure</p>

|Offset| Identifier |         Name        |
|------|------------|---------------------|
| 0x00 |CHANNEL_GUID|     Channel GUID    |
| 0x10 | CHANNEL_CFG|Channel Configuration|

### CHANNEL_GUID register

- Absolute Address: 0x100
- Base Offset: 0x0
- Size: 0x10

<p>Channel GUID - indicates the type of channel/service that should be supported by OBMF-ICP Primary.</p>

| Bits|Identifier|Access|               Reset              |Name|
|-----|----------|------|----------------------------------|----|
|127:0|   GUID   |   r  |0x123423168094F00180900124567890AB|  — |

#### GUID field

<p>Channel GUID - Please see the proper file with this GUID for detailed definition of this structure.</p>

### CHANNEL_CFG register

- Absolute Address: 0x110
- Base Offset: 0x10
- Size: 0x4

<p>Channel Configuration</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|CHANNEL_NO|   r  | 0x1 |  — |
|  8 | MANDATORY|   r  | 0x1 |  — |
|  9 |  ENABLED |  rw  | 0x0 |  — |

#### CHANNEL_NO field

<p>Channel Number</p>

#### MANDATORY field

<p>Indicates whether this channel is mandatory for the OBMF-ICP Secondary to be fully functional.</p>

#### ENABLED field

<p>Indicates whether this channel is enabled: 0 = DISABLED, 1 = ENABLED. OBMF-ICP Primary should write to 
this field to enable the communication over this channel.</p>

## CHANNEL_2 register file

- Absolute Address: 0x200
- Base Offset: 0x200
- Size: 0x14

<p>Channel 2 Discovery Structure</p>

|Offset| Identifier |         Name        |
|------|------------|---------------------|
| 0x00 |CHANNEL_GUID|     Channel GUID    |
| 0x10 | CHANNEL_CFG|Channel Configuration|

### CHANNEL_GUID register

- Absolute Address: 0x200
- Base Offset: 0x0
- Size: 0x10

<p>Channel GUID - indicates the type of channel/service that should be supported by OBMF-ICP Primary.</p>

| Bits|Identifier|Access|               Reset              |Name|
|-----|----------|------|----------------------------------|----|
|127:0|   GUID   |   r  |0x899ABC228902345189ABBC5609BC450F|  — |

#### GUID field

<p>Channel GUID - Please see the proper file with this GUID for detailed definition of this structure.</p>

### CHANNEL_CFG register

- Absolute Address: 0x210
- Base Offset: 0x10
- Size: 0x4

<p>Channel Configuration</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|CHANNEL_NO|   r  | 0x1 |  — |
|  8 | MANDATORY|   r  | 0x1 |  — |
|  9 |  ENABLED |  rw  | 0x0 |  — |

#### CHANNEL_NO field

<p>Channel Number</p>

#### MANDATORY field

<p>Indicates whether this channel is mandatory for the OBMF-ICP Secondary to be fully functional.</p>

#### ENABLED field

<p>Indicates whether this channel is enabled: 0 = DISABLED, 1 = ENABLED. OBMF-ICP Primary should write into this 
field to enable the communication over this channel.</p>

## CHANNEL_3 register file

- Absolute Address: 0x300
- Base Offset: 0x300
- Size: 0x14

<p>Channel 3 Discovery Structure</p>

|Offset| Identifier |         Name        |
|------|------------|---------------------|
| 0x00 |CHANNEL_GUID|     Channel GUID    |
| 0x10 | CHANNEL_CFG|Channel Configuration|

### CHANNEL_GUID register

- Absolute Address: 0x300
- Base Offset: 0x0
- Size: 0x10

<p>Channel GUID - indicates the type of channel/service that should be supported by OBMF-ICP Primary.</p>

| Bits|Identifier|Access|               Reset              |Name|
|-----|----------|------|----------------------------------|----|
|127:0|   GUID   |   r  |0x34568866AB34567F89AB324212356789|  — |

#### GUID field

<p>Channel GUID - Please see the proper file with this GUID for detailed definition of this structure.</p>

### CHANNEL_CFG register

- Absolute Address: 0x310
- Base Offset: 0x10
- Size: 0x4

<p>Channel Configuration</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|CHANNEL_NO|   r  | 0x1 |  — |
|  8 | MANDATORY|   r  | 0x1 |  — |
|  9 |  ENABLED |  rw  | 0x0 |  — |

#### CHANNEL_NO field

<p>Channel Number</p>

#### MANDATORY field

<p>Indicates whether this channel is mandatory for the OBMF-ICP Secondary to be fully functional.</p>

#### ENABLED field

<p>Indicates whether this channel is enabled: 0 = DISABLED, 1 = ENABLED. OBMF-ICP Primary should write into 
this field to enable the communication over this channel.</p>

## CHANNEL_4 register file

- Absolute Address: 0x400
- Base Offset: 0x400
- Size: 0x14

<p>Channel 4 Discovery Structure</p>

|Offset| Identifier |         Name        |
|------|------------|---------------------|
| 0x00 |CHANNEL_GUID|     Channel GUID    |
| 0x10 | CHANNEL_CFG|Channel Configuration|

### CHANNEL_GUID register

- Absolute Address: 0x400
- Base Offset: 0x0
- Size: 0x10

<p>Channel GUID - indicates the type of channel/service that should be supported by OBMF-ICP Primary.</p>

| Bits|Identifier|Access|               Reset              |Name|
|-----|----------|------|----------------------------------|----|
|127:0|   GUID   |   r  |0xC143A289047340809C421E8C941535B2|  — |

#### GUID field

<p>Channel GUID - Please see the proper file with this GUID for detailed definition of this structure.</p>

### CHANNEL_CFG register

- Absolute Address: 0x410
- Base Offset: 0x10
- Size: 0x4

<p>Channel Configuration</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|CHANNEL_NO|   r  | 0x1 |  — |
|  8 | MANDATORY|   r  | 0x1 |  — |
|  9 |  ENABLED |  rw  | 0x0 |  — |

#### CHANNEL_NO field

<p>Channel Number</p>

#### MANDATORY field

<p>Indicates whether this channel is mandatory for the OBMF-ICP Secondary to be fully functional.</p>

#### ENABLED field

<p>Indicates whether this channel is enabled: 0 = DISABLED, 1 = ENABLED. OBMF-ICP Primary should write into 
this field to enable the communication over this channel.</p>

## CHANNEL_5 register file

- Absolute Address: 0x500
- Base Offset: 0x500
- Size: 0x14

<p>Channel 5 Discovery Structure</p>

|Offset| Identifier |         Name        |
|------|------------|---------------------|
| 0x00 |CHANNEL_GUID|     Channel GUID    |
| 0x10 | CHANNEL_CFG|Channel Configuration|

### CHANNEL_GUID register

- Absolute Address: 0x500
- Base Offset: 0x0
- Size: 0x10

<p>Channel GUID - indicates the type of channel/service that should be supported by OBMF-ICP Primary.</p>

| Bits|Identifier|Access|               Reset              |Name|
|-----|----------|------|----------------------------------|----|
|127:0|   GUID   |   r  |0x2354AB229871543A89ABBC5609BC7567|  — |

#### GUID field

<p>Channel GUID - Please see the proper file with this GUID for detailed definition of this structure.</p>

### CHANNEL_CFG register

- Absolute Address: 0x510
- Base Offset: 0x10
- Size: 0x4

<p>Channel Configuration</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|CHANNEL_NO|   r  | 0x1 |  — |
|  8 | MANDATORY|   r  | 0x1 |  — |
|  9 |  ENABLED |  rw  | 0x0 |  — |

#### CHANNEL_NO field

<p>Channel Number</p>

#### MANDATORY field

<p>Indicates whether this channel is mandatory for the OBMF-ICP Secondary to be fully functional.</p>

#### ENABLED field

<p>Indicates whether this channel is enabled: 0 = DISABLED, 1 = ENABLED. OBMF-ICP Primary should write into 
this field to enable the communication over this channel.</p>

## flash register file

- Absolute Address: 0x4000
- Base Offset: 0x4000
- Size: 0x1008

<p>FLASH Registers</p>

|Offset|     Identifier    |        Name       |
|------|-------------------|-------------------|
|0x0000|   FLASH_SPACE[0]  |    FLASH SPACE    |
|0x1000|ERASE_START_ADDRESS|ERASE_START_ADDRESS|
|0x1004|     ERASE_SIZE    |     ERASE_SIZE    |

### FLASH_SPACE register

- Absolute Address: 0x4000
- Base Offset: 0x0
- Size: 0x80
- Array Dimensions: [1]
- Array Stride: 0x80
- Total Size: 0x80

<p>Flash space.</p>

| Bits | Identifier|Access|Reset|Name|
|------|-----------|------|-----|----|
|1023:0|FLASH_SPACE|  rw  |  —  |  — |

#### FLASH_SPACE field

<p>Flash space</p>

### ERASE_START_ADDRESS register

- Absolute Address: 0x5000
- Base Offset: 0x1000
- Size: 0x4

<p>Erase cycle start address (note: devices typically require erase to start on block boundary).</p>

|Bits|     Identifier    |Access|Reset|Name|
|----|-------------------|------|-----|----|
|31:0|ERASE_START_ADDRESS|  rw  | 0x0 |  — |

#### ERASE_START_ADDRESS field

<p>Erase start address</p>

### ERASE_SIZE register

- Absolute Address: 0x5004
- Base Offset: 0x1004
- Size: 0x4

<p>Erase size in bytes (note: devices usually only support specific erase sizes).</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|31:0|ERASE_SIZE|  rw  | 0x0 |  — |

#### ERASE_SIZE field

<p>Erase size in bytes</p>

## vw register file

- Absolute Address: 0x8000
- Base Offset: 0x8000
- Size: 0xC

<p>Virtual Wires Registers</p>

|Offset|  Identifier  |                 Name                 |
|------|--------------|--------------------------------------|
|  0x0 |    VW_CFG    |Configuration of Virtual Wires Channel|
|  0x4 |  VW_0_STATE  |         Virtual Wires 0 State        |
|  0x5 |  VW_1_STATE  |         Virtual Wires 1 State        |
|  0x6 |  VW_2_STATE  |         Virtual Wires 2 State        |
|  0x7 |  VW_3_STATE  |         Virtual Wires 2 State        |
|  0x8 |VW_0_DIRECTION|       Virtual Wires 0 Direction      |
|  0x9 |VW_1_DIRECTION|       Virtual Wires 1 Direction      |
|  0xA |VW_2_DIRECTION|       Virtual Wires 2 Direction      |
|  0xB |VW_3_DIRECTION|       Virtual Wires 3 Direction      |

### VW_CFG register

- Absolute Address: 0x8000
- Base Offset: 0x0
- Size: 0x4

<p>Configuration of Virtual Wires Channel</p>

|Bits|   Identifier  |Access|Reset|Name|
|----|---------------|------|-----|----|
| 7:0|     VW_NO     |   r  | 0x0 |  — |
|  8 |VW_NOTIFICATION|  rw  | 0x0 |  — |
|31:9|   reserverd   |   r  | 0x0 |  — |

#### VW_NO field

<p>Total number of VWs supported by OBMF-ICP Producer</p>

#### VW_NOTIFICATION field

<p>Flag indicating of notifications from OBMF-ICP Producer to OBMF-ICP Secondary are enabled. OBMF-ICP Secondary may update this field to enable/disable. 0 - DISABLED, 1 - ENABLED, default = 0.</p>

#### reserverd field

<p>Reserved</p>

### VW_0_STATE register

- Absolute Address: 0x8004
- Base Offset: 0x4
- Size: 0x1

<p>Virtual Wires State</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 | VW_STATE |  rw  | 0x0 |  — |
| 7:1| reserverd|   r  | 0x0 |  — |

#### VW_STATE field

<p>Virtual Wires State.Indicates the state of the vGPIO: 0 - LOW , 1 - HIGH</p>

#### reserverd field

<p>Reserved</p>

### VW_1_STATE register

- Absolute Address: 0x8005
- Base Offset: 0x5
- Size: 0x1

<p>Virtual Wires State</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 | VW_STATE |  rw  | 0x0 |  — |
| 7:1| reserverd|   r  | 0x0 |  — |

#### VW_STATE field

<p>Virtual Wires State.Indicates the state of the vGPIO: 0 - LOW , 1 - HIGH</p>

#### reserverd field

<p>Reserved</p>

### VW_2_STATE register

- Absolute Address: 0x8006
- Base Offset: 0x6
- Size: 0x1

<p>Virtual Wires State</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 | VW_STATE |  rw  | 0x0 |  — |
| 7:1| reserverd|   r  | 0x0 |  — |

#### VW_STATE field

<p>Virtual Wires State.Indicates the state of the vGPIO: 0 - LOW , 1 - HIGH</p>

#### reserverd field

<p>Reserved</p>

### VW_3_STATE register

- Absolute Address: 0x8007
- Base Offset: 0x7
- Size: 0x1

<p>Virtual Wires State</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 | VW_STATE |  rw  | 0x0 |  — |
| 7:1| reserverd|   r  | 0x0 |  — |

#### VW_STATE field

<p>Virtual Wires State.Indicates the state of the vGPIO: 0 - LOW , 1 - HIGH</p>

#### reserverd field

<p>Reserved</p>

### VW_0_DIRECTION register

- Absolute Address: 0x8008
- Base Offset: 0x8
- Size: 0x1

<p>Virtual Wires Direction</p>

|Bits| Identifier |Access|Reset|Name|
|----|------------|------|-----|----|
| 1:0|VW_DIRECTION|  rw  | 0x0 |  — |

#### VW_DIRECTION field

<p>Virtual Wires Direction. Indicates if the VW is an input or output: 0 - Input, 1 - Output, 2 - Hi-Z, 3 - Input &amp; Output</p>

### VW_1_DIRECTION register

- Absolute Address: 0x8009
- Base Offset: 0x9
- Size: 0x1

<p>Virtual Wires Direction</p>

|Bits| Identifier |Access|Reset|Name|
|----|------------|------|-----|----|
| 1:0|VW_DIRECTION|  rw  | 0x1 |  — |

#### VW_DIRECTION field

<p>Virtual Wires Direction. Indicates if the VW is an input or output: 0 - Input, 1 - Output, 2 - Hi-Z, 3 - Input &amp; Output</p>

### VW_2_DIRECTION register

- Absolute Address: 0x800A
- Base Offset: 0xA
- Size: 0x1

<p>Virtual Wires Direction</p>

|Bits| Identifier |Access|Reset|Name|
|----|------------|------|-----|----|
| 1:0|VW_DIRECTION|  rw  | 0x2 |  — |

#### VW_DIRECTION field

<p>Virtual Wires Direction. Indicates if the VW is an input or output: 0 - Input, 1 - Output, 2 - Hi-Z, 3 - Input &amp; Output</p>

### VW_3_DIRECTION register

- Absolute Address: 0x800B
- Base Offset: 0xB
- Size: 0x1

<p>Virtual Wires Direction</p>

|Bits| Identifier |Access|Reset|Name|
|----|------------|------|-----|----|
| 1:0|VW_DIRECTION|  rw  | 0x3 |  — |

#### VW_DIRECTION field

<p>Virtual Wires Direction. Indicates if the VW is an input or output: 0 - Input, 1 - Output, 2 - Hi-Z, 3 - Input &amp; Output</p>

## rtc register file

- Absolute Address: 0xC000
- Base Offset: 0xC000
- Size: 0xF

<p>RTC Registers</p>

|Offset| Identifier |    Name    |
|------|------------|------------|
|  0x0 |     SEC    |     SEC    |
|  0x1 |  SEC_ALARM |  SEC_ALARM |
|  0x2 |   MINUTES  |   MINUTES  |
|  0x3 |MINUTESALARM|MINUTESALARM|
|  0x4 |    HOURS   |    HOURS   |
|  0x5 | HOURSALARM | HOURSALARM |
|  0x6 |  DAYOFWEEK |  DAYOFWEEK |
|  0x7 | DAYOFMONTH | DAYOFMONTH |
|  0x8 |    MONTH   |    MONTH   |
|  0x9 |    YEAR    |    YEAR    |
|  0xA |  REGISTERA |  REGISTERA |
|  0xB |  REGISTERB |  REGISTERB |
|  0xC |  REGISTERC |  REGISTERC |
|  0xD |  REGISTERD |  REGISTERD |
|  0xE |  REGISTERE |  REGISTERE |

### SEC register

- Absolute Address: 0xC000
- Base Offset: 0x0
- Size: 0x1

<p>RTC Index: 00h. Attribute: Read/Write. Size: 8-bit. This register stores current time second. None of the bits are affected by any reset signal. Only cleared at RTC Power loss</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|    SEC   |  rw  | 0x0 |  — |

#### SEC field

<p>Time Seconds. The time in seconds can be represented in either BCD or Binary format depending on the value in RegB.Data Mode.</p>

### SEC_ALARM register

- Absolute Address: 0xC001
- Base Offset: 0x1
- Size: 0x1

<p>RTC Index: 01h. Attribute: Read/Write. Size: 8-bit. This register stores Seconds Alarm. None of the bits are affected by any reset signal. Only cleared at RTC Power loss</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0| SEC_ALARM|  rw  | 0x0 |  — |

#### SEC_ALARM field

<p>Seconds field of the Alarm.</p>

### MINUTES register

- Absolute Address: 0xC002
- Base Offset: 0x2
- Size: 0x1

<p>RTC Index: 02h. Attribute: Read/Write. Size: 8-bit. This register stores current time Minutes. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|  MINUTES |  rw  | 0x0 |  — |

#### MINUTES field

<p>Time Minutes. The time in minutes can be represented in either BCD or Binary format depending on the value in RegB.Data Mode</p>

### MINUTESALARM register

- Absolute Address: 0xC003
- Base Offset: 0x3
- Size: 0x1

<p>RTC Index: 03h. Attribute: Read/Write. Size: 8-bit. This register stores Alarm Minutes. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits| Identifier |Access|Reset|Name|
|----|------------|------|-----|----|
| 7:0|MINUTESALARM|  rw  | 0x0 |  — |

#### MINUTESALARM field

<p>Minutes field of the Alarm</p>

### HOURS register

- Absolute Address: 0xC004
- Base Offset: 0x4
- Size: 0x1

<p>RTC Index: 04h. Attribute: Read/Write. Size: 8-bit. This register stores current time Hours. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|   HOURS  |  rw  | 0x12|  — |

#### HOURS field

<p>Time Hours. The time in hours can be represented in either BCD or Binary format depending on the value in RegB.Data Mode. It can also be represented in either 12-hour mode or 24-hour mode depending on the value in RegB.Hour Format.</p>

### HOURSALARM register

- Absolute Address: 0xC005
- Base Offset: 0x5
- Size: 0x1

<p>RTC Index: 05h. Attribute: Read/Write. Size: 8-bit. This register stores Alarm Hours. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|HOURSALARM|  rw  | 0x12|  — |

#### HOURSALARM field

<p>Hours field of the Alarm.</p>

### DAYOFWEEK register

- Absolute Address: 0xC006
- Base Offset: 0x6
- Size: 0x1

<p>RTC Index: 06h. Attribute: Read/Write. Size: 8-bit. This register stores current Day of Week. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0| DAYOFWEEK|  rw  | 0x7 |  — |

#### DAYOFWEEK field

<p>This field indicates current Day of Week. 1-Sunday 2-Monday 3-Tuesday 4-Wednesday 5-Thursday 6-Friday 7-Saturday. The value is the same regardless of the Data Mode.</p>

### DAYOFMONTH register

- Absolute Address: 0xC007
- Base Offset: 0x7
- Size: 0x1

<p>RTC Index: 07h. Attribute: Read/Write. Size: 8-bit. This register stores current Day of Month. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|DAYOFMONTH|  rw  | 0x1 |  — |

#### DAYOFMONTH field

<p>This field indicates current Day of Month. The day of month can be represented in either BCD or Binary format depending on the value in RegB.Data Mode.</p>

### MONTH register

- Absolute Address: 0xC008
- Base Offset: 0x8
- Size: 0x1

<p>RTC Index: 08h. Attribute: Read/Write. Size: 8-bit. This register stores current Month. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|   MONTH  |  rw  | 0x1 |  — |

#### MONTH field

<p>This field indicates current Month. The month can be represented in either BCD or Binary format depending on the value in RegB.Data Mode.</p>

### YEAR register

- Absolute Address: 0xC009
- Base Offset: 0x9
- Size: 0x1

<p>RTC Index: 09h. Attribute: Read/Write. Size: 8-bit. This register stores current Year. None of the bits are affected by any reset signal. Only cleared at RTC Power loss.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|   YEAR   |  rw  | 0x0 |  — |

#### YEAR field

<p>This field indicates current Year. The year can be represented in either BCD or Binary format depending on the value in RegB.Data Mode.</p>

### REGISTERA register

- Absolute Address: 0xC00A
- Base Offset: 0xA
- Size: 0x1

<p>RTC Index: 0Ah. This register is used for general configuration of the RTC functions.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 6:4|    DV    |  rw  | 0x2 |  — |
|  7 |    UIP   |   r  | 0x0 |  — |

#### DV field

<p>Controls the divider chain for the oscillator, and are not affected by any other reset signal.02h: Normal Operation.06h/07h: Divider in Reset. RTC stops.Others: Ignored. Keep last State.Note: Write a 06/07h, will get read back as 06h.</p>

#### UIP field

<p>When set, an update is is in progress. When cleared, the update cycle will not start for at least 488 us. Always return '0' in Integrated Boot.</p>

### REGISTERB register

- Absolute Address: 0xC00B
- Base Offset: 0xB
- Size: 0x1

<p>RTC Index: 0Bh. Attribute: Read/Write This register is used for general configuration of the RTC functions.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 |    DSE   |   r  | 0x0 |  — |
|  1 |    HF    |  rw  | 0x0 |  — |
|  2 |    DM    |  rw  | 0x0 |  — |
|  3 |   SQWE   |   r  | 0x0 |  — |
|  4 |    UIE   |   r  | 0x0 |  — |
|  5 |    AIE   |  rw  | 0x0 |  — |
|  6 |    PIE   |   r  | 0x0 |  — |
|  7 |    SET   |  rw  | 0x0 |  — |

#### DSE field

<p>Not implemented.</p>

#### HF field

<p>When set, twenty-four hour mode is selected. When cleared, twelve-hour mode is selected. In twelve hour mode, the seventh bit represents AM (cleared) and PM (set).</p>

#### DM field

<p>When set, represents binary representation. When cleared, denotes BCD.</p>

#### SQWE field

<p>Not implemented.</p>

#### UIE field

<p>When set and C.UF is set, an interrupt is generated. Not Implemented.</p>

#### AIE field

<p>When set, and C.AF is set, an interrupt is generated.</p>

#### PIE field

<p>When set, and C.PF is set, an interrupt is generated. Not Implemented.</p>

#### SET field

<p>When cleared, an update cycle occurs once each second. If set, a current update cycle will abort and subsequent update cycles will not occur until SET is returned to zero. When set, SW may initialize time and calendar bytes safely.Note: Ignored by Integrated boot. Always allow to update Time. Reset on Global reset</p>

### REGISTERC register

- Absolute Address: 0xC00C
- Base Offset: 0xC
- Size: 0x1

<p>RTC Index: 0Ch. Attribute: Read-Only (Writes have no effect). All bits in this register are cleared when this register is read.</p>

|Bits|Identifier| Access|Reset|Name|
|----|----------|-------|-----|----|
|  4 |    UF    |   r   | 0x0 |  — |
|  5 |    AF    |   rw  | 0x0 |  — |
|  6 |    PF    |r, rclr| 0x0 |  — |
|  7 |   IRQF   |   r   | 0x0 |  — |

#### UF field

<p>Updated-ended flag will be high immediately following an update cycle for each second. The bit is cleared upon AUX_PWRGOOD deassertion or a read of Register C.Note: in Integrated boot, Always read as '0'.</p>

#### AF field

<p>Alarm Flag will be high after all Alarm values match the current time. This bit is cleared upon RTCRST# assertion or a read of Register C.</p>

#### PF field

<p>Periodic interrupt Flag will be one when the tap as specified by the RS bits of register A is one. If no taps are specified, this flag bit will remain at zero. This bit is cleared upon AUX_PWRGOOD deassertion or a read of Register C. Note: In Integrated boot, always read as '0'.</p>

#### IRQF field

<p>Interrupt Request Flag = (PF * PIE) + (AF * AIE) + (UF * UIE). This also causes the RTC Interrupt to be asserted.Note: In integrated boot, as PIE, UIE are not supported, It = (AF * AIE).</p>

### REGISTERD register

- Absolute Address: 0xC00D
- Base Offset: 0xD
- Size: 0x1

<p>RTC Index: 0Dh.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 5:0|    DA    |   r  | 0x0 |  — |
|  7 |    VRT   |   r  | 0x1 |  — |

#### DA field

<p>These bits store the date of month alarm value. If set to 000000, then a don't care state is assumed. Data alarm not supported in Bootable CPU, these bits will return zeros to mimic the functionality of the Motorola 146818B.</p>

#### VRT field

<p>This bit should always be written as a 0 for write cycle, however it will return a 1 for read cycles.</p>

### REGISTERE register

- Absolute Address: 0xC00E
- Base Offset: 0xE
- Size: 0x1

<p>Remaining 114 Bytes of Lower User RAM. Each byte in this bank share the same description as shown below. RAM default values are undetermined and the last written value will be retained until RTC Clear</p>

|Bits|  Identifier  |Access|Reset|Name|
|----|--------------|------|-----|----|
| 5:0|LOWER_USER_RAM|   r  | 0x0 |  — |

#### LOWER_USER_RAM field

<p>These bits store the date of month alarm value. If set to 000000, then a don't care state is assumed. Data alarm not supported in Bootable CPU, these bits will return zeros to mimic the functionality of the Motorola 146818B.</p>

## uart register file

- Absolute Address: 0x10000
- Base Offset: 0x10000
- Size: 0x8

<p>UART Registers</p>

|Offset| Identifier|    Name   |
|------|-----------|-----------|
|  0x0 |RBR_THR_DLL|RBR_THR_DLL|
|  0x1 |  IER_DLH  |  IER_DLH  |
|  0x2 |  IIR_FCR  |  IIR_FCR  |
|  0x3 |    LCR    |    LCR    |
|  0x4 |    MCR    |    MCR    |
|  0x5 |    LSR    |    MCR    |
|  0x6 |    MSR    |    MSR    |
|  0x7 |    SCR    |    SPR    |

### RBR_THR_DLL register

- Absolute Address: 0x10000
- Base Offset: 0x0
- Size: 0x1

<p>RBR = Recieve buffer register - RO. This register contains the data byte received on the serial input port (sin). The data in this register is valid only if the Data Ready (LSR(0) is set to 1). If FIFOs are disabled (FCR(0) is cleared to 0) the data in the RBR must be read before the next data arrives, otherwise it will be overwritten, resulting in an overrun error. If FIFOs are enabled (FCR(0) set to 1) this register accesses the head of the receive FIFO. If the receive FIFO is full, and this register is not read before the next data character arrives, then the data already in the FIFO will be preserved but any incoming data will be lost. An overrun error will also occur.
THR = Transmit hold register - WO. This register contains data to be transmitted on the serial output port (sout). Data should only be written to the THR when the THR Empty bit (LSR(5) is set to1). If FIFOs are disabled (FCR(0) is set to 0) and THRE is set to 1, writing a single character to the THR clears the THRE. Any additional writes to the THR before the THRE is set again causes the THR data to be overwritten. If FIFO's are enabled (FCR(0) is set to 1) and THRE is set, the FIFO can be filled up to a preconfigured depth (FIFO_DEPTH). Any attempt to write data when the FIFO is full results in the write data being lost.
DLL = Divisor Latch low. - RW. This register makes up the lower 8-bits of a 16-bit, Read/write, Divisor Latch register that contains the baud rate divisor for the UART. This register may only be accessed when the DLAB bit (LCR(7) is set to 1). The output baud rate is equal to the system clock (clk) frequency divided by sixteen times the value of the baud rate divisor, as follows: baud rate = (system clock freq) / (16 * divisor) Note: With the Divisor Latch Registers (DLL and DLH) set to zero, the baud clock is disabled and no serial communications will occur. Also, once the DLL is set, at least 8 system clock cycles should be allowed to pass before transmitting or receiving data.</p>

|Bits| Identifier|Access|Reset|Name|
|----|-----------|------|-----|----|
| 7:0|RBR_THR_DLL|  rw  | 0x0 |  — |

#### RBR_THR_DLL field

<p>When DLAB = 0, this 8-bit value is used as Received Buffer Register as Read, and is used as Transmit Holding Register as Write. When DLAB is 1, this register is used as DLL (Divisor Latch Low Byte Register).</p>

### IER_DLH register

- Absolute Address: 0x10001
- Base Offset: 0x1
- Size: 0x1

<p>IER = Interrupt Enable Register - RW. The ier_dlh (Interrupt Enable Register) may only be accessed when the DLAB bit (7) of the LCR Register is set to 0. Allows control of the Interrupt Enables for transmit and receive functions. refer to UART Interrupt Enable register for details.
DLH = Divisor Latch High - RW. The Divisor Latch High Register is accessed when the DLAB bit (LCR(7) is set to 1). Bits[7:0] contain the high order 8-bits of the baud rate divisor. The output baud rate is equal to the system clock (clk) frequency divided by sixteen times the value of the baud rate divisor, as follows: baud rate = (system clock freq) / (16 * divisor). Note: With the Divisor Latch Registers (DLL and DLH) set to zero, the baud clock is disabled and no serial communications will occur. Also, once the DLL is set, at least 8 system clock cycles should be allowed to pass before transmitting or receiving data.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|  IER_DLH |  rw  | 0x0 |  — |

#### IER_DLH field

<p>This is a multi-function register. This register enables/disables receive and transmit interrupts and also controls the most significant 8-bits of the baud rate divisor. When DLAB = 0, this 8-bit value is used as Interrupt Enable Register. When DLAB = 1, this 8-bit value is used as DLH (Divisor Latch High Byte Register).</p>

### IIR_FCR register

- Absolute Address: 0x10002
- Base Offset: 0x2
- Size: 0x1

<p>IIR = Interrupt Identification Register - RO. The IIR register is read to determine the type and source of UART interrupts. To be 16550 compatible, the lower 4 bits (0-3) of the IIR register are priority encoded. If two or more interrupts occurs which are represented by bits (0-3), only the interrupt with the highest priority is displayed. The upper 4 bits (4-7) are not priority encoded. These bits will assert/deassert independently of the lower 4 bits. Bit 0 (nIP) is used to indicate the existence of an interrupt in the priority encoded bits (0-3) of the IIR register. A low signal on this bit indicates an encoded interrupt is pending. If this bit is high, no encoded interrupt is pending regardless of the state of the other 3 bits. nIP has no effect ,or association with, the upper bits four bits (4-7) which assert/deassert independently of nIP. Refer to UART Interrupt Identification register for details.
FCR = FIFO Control Register - WO. FCR is a write-only register that is located at the same address as the IIR (IIR is a read-only register). FCR enables/disables the transmitter/receiver FIFOs, clears the transmitter/receiver FIFOs, sets the Receiver FIFO trigger level. Refer to FIFO Control register for details.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|  IIR_FCR |  rw  | 0x1 |  — |

#### IIR_FCR field

<p>When read, this 8-bit value is used as Interrupt Identification Register. When written, this 8-bit value is used as FIFO Control Register.</p>

### LCR register

- Absolute Address: 0x10003
- Base Offset: 0x3
- Size: 0x1

<p>In the Line Control register, system programmers specify the format of the asynchronous data communications exchange. The serial data format consists of a start bit (logic 0), five to eight data bits, an optional parity bit, and one or two stop bits (logic 1). The LCR has bits for accessing the Divisor Latch registers and causing a Break condition. Programmers can also read the contents of the Line Control register. The read capability simplifies system programming and eliminates the need for separate storage in system memory.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 1:0|  LCR_WLS |  rw  | 0x0 |  — |
|  2 |  LCR_STB |  rw  | 0x0 |  — |
|  3 |  LCR_PEN |  rw  | 0x0 |  — |
|  4 |  LCR_EPS |  rw  | 0x0 |  — |
|  5 | LCR_STKYP|  rw  | 0x0 |  — |
|  6 |  LCR_SB  |  rw  | 0x0 |  — |
|  7 | LCR_DLAB |  rw  | 0x0 |  — |

#### LCR_WLS field

<p>The word length select bits specify the number of data bits (five to eight bits are allowed) in each transmitted or received serial character.
00: 5-bit character (default)
01: 6-bit character,
10: 7-bit character,
11: 8-bit character</p>

#### LCR_STB field

<p>This bit specifies the number of stop bits transmitted and received in each serial character.
0: 1 stop bit,
1: 2 stop bits; except for 5-bit character, then 1 bits,
The receiver checks the first stop bit only, regardless of the number of stop bits selected.</p>

#### LCR_PEN field

<p>When PEN is logic 1, a parity bit is generated (transmit data) or checked (receive data) between the last data-word bit and stop bit of the serial data.
0: No parity function.
1: Allows parity generation and checking.</p>

#### LCR_EPS field

<p>EPS is only valid when the parity is enabled (PEN = 1).
0: Sends and checks for odd parity,
1: Sends and checks for even parity.</p>

#### LCR_STKYP field

<p>This bit is the sticky-parity bit, which can be used in multiprocessor communications.
0: No effect on parity bit.
1: Forces parity bit to be opposite of EPS bit value.
When PEN and STKYP are logic 1, the bit that is transmitted in the parity-bit location (the bit just before the stop bit) is the complement of the EPS bit. If EPS is 0, then the bit at the parity-bit location will be transmitted as a 1. In the receiver, if STKYP and PEN are 1, then the receiver compares the bit that is received in the parity-bit location with the complement of the EPS bit. If the values being compared are not equal, the receiver sets the parity-error bit in LSR, and causes an Error Interrupt if Line-Status Interrupts were enabled. For example, if EPS is 0, the receiver expects the bit received at the parity-bit location to be 1. If it is not, then the parity-error bit is set. By forcing the bit value at the parity-bit location, rather than calculating a parity value, a system with a Driver/Initiator transmitter and multiple receivers can identify some transmitted characters as receiver addresses and the rest of the characters as data. If PEN = 0, STKYP is ignored.</p>

#### LCR_SB field

<p>The set-break control bit transmits a Break condition to the receiving UART. When SB is set to logic 1, the serial output (TXD) is forced to the Spacing (logic 0) state and remains there until SB is set to logic 0. This bit acts only on the TXD pin and has no effect on the transmitter logic.
0: No effect on TXD output.
1: Forces TXD output to 0 (space).
This feature enables the processor to alert a terminal in a computer communications system. If the following sequence is executed, no erroneous characters will be transmitted because of the break: Load 0x00 in the Transmit Holding register in response to a TDRQ Interrupt. After TDRQ goes high (indicating that 0x00 is being shifted out), set the break bit before the parity or stop bits reach the TXD pin. Wait for the transmitter to be idle (TEMT = 1), and clear the break bit when normal transmission has to be restored. During the Break, the transmitter can be used as a character timer to accurately establish the Break duration. In FIFO mode, wait for the transmitter to be idle (TEMT=1) to set and clear the break bit.</p>

#### LCR_DLAB field

<p>The divisor-latch access bit must be set high (logic 1) to access the divisor latches of the baud rate generator during a read or write operation. It must be set low (logic 0) to access the receiver buffer, the Transmit Holding register, or the Interrupt Enable register. This bit does not need to be set when using auto-baud.
0: Access Transmit Holding register (THR), Receive Buffer register (RBR) and Interrupt Enable register.
1: Access Divisor Latch registers (DLL and DLH)</p>

### MCR register

- Absolute Address: 0x10004
- Base Offset: 0x4
- Size: 0x1

<p>This register controls the interface with the modem or data set (or a peripheral device emulating a modem)</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 |  MCR_DTR |  rw  | 0x0 |  — |
|  1 |  MCR_RTS |  rw  | 0x0 |  — |
|  2 | MCR_OUT1 |  rw  | 0x0 |  — |
|  3 | MCR_OUT2 |  rw  | 0x0 |  — |
|  4 | MCR_LOOP |  rw  | 0x0 |  — |

#### MCR_DTR field

<p>This bit controls the Data Terminal Ready output.
0: Primary output \"uart_dtr\" pin is forced to logic 1.
1: Primary output uart_dtr pin is forced to logic 0.
The uart_dtr output of the UART may be applied to an EIA inverting line driver (such as the DS1488) to obtain the proper polarity input at the succeeding modem or data set.</p>

#### MCR_RTS field

<p>When Auto Flow is disabled: MCR.AFE = 0:  0: Primary output uart_rts pin is forced to logic 1 | 1: Primary output uart_rts pin is forced to logic 0 
When Auto Flow is enabled: MCR.AFE = 1: | 0: Auto-RTS is disabled | 1: Auto-RTS is enabled</p>

#### MCR_OUT1 field

<p>The auxiliary output OUT1 bit is only used in Loopback Test mode.
0: uart_ri UART pin input set low when in Loop-back mode
1: uart_ri UART pin input set high when in Loop-back mode
Note: OUT1 is not used in IBL.</p>

#### MCR_OUT2 field

<p>The function of the auxiliary output OUT2 bit differs depending on the mode of the UART.
0: uart_dcd UART pin input set low when in Loop-back mode
1: uart_dcd UART pin input set high when in Loop-back mode.
Note: OUT2 is not used in IBL.</p>

#### MCR_LOOP field

<p>This bit provides a local loopback feature for diagnostic testing of the UART. This feature allows the processor to verify the UART transmit and receive data paths. The Transmit, Receive, and Modem Control interrupts are operational in this mode.
0: Normal UART operation.
1: Loopback Test mode operation.
When LOOP is set to logic 1, the following will occur: The TXD (transmitter output) pin is set to a logic-1 state. The RXD (receiver input) pin is disconnected. The output of the Transmitter Shift register is \"looped back\" into the Receiver-Shift register input. The four modem-control inputs (uart_cts, uart_dsr, uart_dcd, and uart_ri) are disconnected from the pins and the modem-control output pins (uart_rts and uart_dtr) are forced to their inactive state. The lower four bits of the Modem Control register (MCR) are connected to the upper four modem status register (MSR) bits. Flow control can be tested.
DTR = 1 forces DSR to a 1
RTS = 1 forces CTS to a 1
OUT1 = 1 forces RI to a 1
OUT2= 1 forces DCD to a 1
Coming out of the Loopback Test mode may result in unpredictable activation of the delta bits (bits 3:0) in the Modem Status register (MSR). It is recommended that MSR is read once to clear the delta bits in the MSR.</p>

### LSR register

- Absolute Address: 0x10005
- Base Offset: 0x5
- Size: 0x1

<p>This register provides status information to the processor concerning the data transfers. Bits 5 and 6 indicate the status of the transmitter. The remainder of the bits contains information about the receiver. In non-FIFO mode, three of the LSR register bits parity error, framing error, and break interrupt indicate the error status of the character that has just been received. In FIFO mode, these three status bits are stored with each received character in the FIFO. These bits in the line status register are associated with the character at the top of the FIFO. These bits are not cleared by reading the erroneous byte from the FIFO or receive buffer. They are cleared only by reading LSR. In FIFO mode, the Line Status Interrupt occurs only when the erroneous byte is at the top of the FIFO. If the erroneous byte being received is not at the top of the FIFO, an interrupt is generated only after the previous bytes are read and the erroneous byte is moved to the top of the FIFO.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 |  LSR_DR  |   r  | 0x0 |  — |
|  1 |  LSR_OE  |   r  | 0x0 |  — |
|  2 |  LSR_PE  |   r  | 0x0 |  — |
|  3 |  LSR_FE  |   r  | 0x0 |  — |
|  4 |  LSR_BI  |   r  | 0x0 |  — |
|  5 | LSR_TDRQ |   r  | 0x1 |  — |
|  6 | LSR_TEMT |   r  | 0x1 |  — |
|  7 | LSR_FIFOE|   r  | 0x0 |  — |

#### LSR_DR field

<p>DR is set to logic 1 when a complete incoming character has been received and transferred into the Receiver Buffer register or the FIFO. In non-FIFO mode, DR is reset to 0 when the receive buffer is read. In FIFO mode, DR is reset to logic 0 if the FIFO is empty (last character has been read from RBR) or the RESETRF bit is set in FCR.</p>

#### LSR_OE field

<p>0: No overflow error. Data has not been lost.
1: Overflow error. Receive data has been lost.
In non-FIFO mode, OE indicates that data in the Receiver Buffer register was not read by the processor before the next character was received; the new character is lost. In FIFO mode, OE indicates that all 64 bytes of the FIFO are full and the most recently received byte has been discarded. The OE indicator is set to logic 1 upon detection of an overflow condition and reset when the processor reads the Line Status register.</p>

#### LSR_PE field

<p>0: No Parity error.
1: Parity error has occurred.
PE indicates that the received character does not have the correct even or odd parity, as selected by the Even Parity Select bit. The PE is set to logic 1 upon detection of a parity error and is reset to logic 0 when the processor reads the Line Status register. In FIFO mode, PE shows a parity error for the character at the bottom of the FIFO, not the most recent character received.</p>

#### LSR_FE field

<p>0: No Framing error.
1: Framing error has occurred.
FE indicates that the received character did not have a valid stop bit. FE is set to logic 1 when the bit following the last data bit or parity bit is detected as logic 0 bit (spacing level). If the Line Control register had been set for two stop bits, the receiver does not check for a valid second stop bit. The FE indicator is reset when the processor reads the Line Status register. The UART will resynchronize after a framing error by assuming that the framing error was due to the next start bit. Therefore it samples this start bit twice and then takes in the data. In FIFO mode, FE shows a framing error for the character at the bottom of the FIFO, not for the most recent character received.</p>

#### LSR_BI field

<p>0: No break signal has been received.
1: Break signal has been received.
BI is set to logic 1 when the received data input is held in the Spacing (logic 0) state for longer than a full character transmission time (that is, the total time of start bit + data bits + parity bit + stop bits). The Break Indicator is reset when the processor reads the Line Status register. In FIFO mode, only one Break character (equal to 0x00) is loaded into the FIFO regardless of the length of the Break condition. BI shows the Break condition for the character at the bottom of the FIFO, not the most recent character received.</p>

#### LSR_TDRQ field

<p>If THRE mode is disabled (IER(7) set to zero).
0: The UART is NOT ready to receive data for transmission.
1: The UART is ready to receive data for transmission.
The assertion of TDRQ causes the UART to interrupt the processor when the Transmit Data Request Interrupt Enable IER.TIE is set high. TDRQ is set to 1 when the new symbol is copied from Transmit Holding register into the Transmit Shift register. The bit is reset to logic 0 concurrently with the loading of the Transmit Holding register by the processor. In FIFO mode, TDRQ is set to logic 1 when the FIFO is empty. It is cleared when the FIFO is more than half full. If more than 32 characters are loaded into the FIFO, the excess characters are lost.
If THRE mode is enabled (IER(7) set to one), the functionality is switched to indicate the transmitter FIFO is full, and no longer controls THRE interrupts, which are then controlled by the FCR[5:4] threshold setting.</p>

#### LSR_TEMT field

<p>0: There is data in the Transmit Shift register, the Transmit Holding register, or the FIFO (in FIFO mode).
1: All the data in the transmitter has been shifted out.</p>

#### LSR_FIFOE field

<p>0: No character has error inside the Receive FIFO.
1: At least one character in Receiver FIFO has errors.
In non-FIFO mode, this bit is always set to 0. In FIFO mode, FIFOE is set to 1 when there is at least one parity error, framing error, or break indication for any of the characters in the FIFO. A processor read to the Line Status register does not reset this bit. FIFOE is reset when all error bytes have been read from the FIFO.</p>

### MSR register

- Absolute Address: 0x10006
- Base Offset: 0x6
- Size: 0x1

<p>The MSR provides the current state of the control lines from the modem or data set (or a peripheral device emulating a modem) to the processor. In addition to this current state information, four bits of the MSR provide change information. These bits, 3:0, are set to logic 1 when the associated control Input from the remote modem changes state. They are reset to logic 0 when the processor reads the MSR.
When bits 0, 1, 2, or 3 are set to logic 1, a Modem Status Interrupt IIR.IID is generated if bit MIE of the Interrupt Enable register is set.</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
|  0 | MSR_DCTS |   r  | 0x0 |  — |
|  1 | MSR_DDSR |   r  | 0x0 |  — |
|  2 | MSR_TERI |   r  | 0x0 |  — |
|  3 | MSR_DDCR |   r  | 0x0 |  — |
|  4 |  MSR_CTS |   r  | 0x0 |  — |
|  5 |  MSR_DSR |   r  | 0x0 |  — |
|  6 |  MSR_RI  |   r  | 0x0 |  — |
|  7 |  MSR_DCD |   r  | 0x0 |  — |

#### MSR_DCTS field

<p>0: No change in uart_cts pin since last read of MSR
1: uart_cts pin has change state
When DCTS is set the modem status interrupt will be generated if enabled in IER.</p>

#### MSR_DDSR field

<p>0: No change in uart_dsr pin since last read of MSR
1: uart_dsr pin has changed state
When DDSR is set the modem status interrupt will be generated if enabled in IER.</p>

#### MSR_TERI field

<p>0: No change in uart_ri pin since last read of MSR
1: uart_ri pin has changed state
When TERI is set the modem status interrupt will be generated if enabled in IER.</p>

#### MSR_DDCR field

<p>0: No change in uart_dcr pin since last read of MSR
1: uart_dcr pin has changed state
When DDCR is set the modem status interrupt will be generated if enabled in IER.</p>

#### MSR_CTS field

<p>Loopback is disabled, MCR.LOOP = 0 | 0: Primary input uart_cts is logic 1 | 1: Primary input uart_cts is logic 0 
Loopback is enabled, MCR.LOOP = 1 | 0: MCR.RTS is logic 0 | 1: MCR.RTS is logic 1</p>

#### MSR_DSR field

<p>Loopback is disabled, MCR.LOOP = 0 | 0: Primary input uart_dsr is logic 1 | 1: Primary input uart_dsr is logic 0 
Loopback is enabled, MCR.LOOP = 1 | 0: MCR.DTR is logic 0 | 1: MCR.DTR is logic 1</p>

#### MSR_RI field

<p>Loopback is disabled, MCR.LOOP = 0 | 0: Primary input uart_ri is logic 1 | 1: Primary input uart_ri is logic 0 
Loopback is enabled, MCR.LOOP = 1 | 0: MCR.OUT1 is logic 0 | 1: MCR.OUT1 is logic 1</p>

#### MSR_DCD field

<p>Loopback is disabled, MCR.LOOP = 0 | 0: Primary input uart_dcd is logic 1 | 1: Primary input uart_dcd is logic 0 
Loopback is enabled, MCR.LOOP = 1 | 0: MCR.OUT2 is logic 0 | 1: MCR.OUT2 is logic 1</p>

### SCR register

- Absolute Address: 0x10007
- Base Offset: 0x7
- Size: 0x1

<p>This is the SPR register</p>

|Bits|Identifier|Access|Reset|Name|
|----|----------|------|-----|----|
| 7:0|    SPR   |  rw  | 0x0 |  — |

#### SPR field

<p>Writing to this field does not affect the operation of the UART in any way.</p>

## mmio register file

- Absolute Address: 0x14000
- Base Offset: 0x14000
- Size: 0x80

<p>Memory Mapped I/O Space</p>

|Offset|  Identifier |   Name   |
|------|-------------|----------|
|  0x0 |MMIO_SPACE[0]|MMIO_SPACE|

### MMIO_SPACE register

- Absolute Address: 0x14000
- Base Offset: 0x0
- Size: 0x80
- Array Dimensions: [1]
- Array Stride: 0x80
- Total Size: 0x80

<p>Memory Mapped I/O Space</p>

| Bits |Identifier|Access|Reset|Name|
|------|----------|------|-----|----|
|1023:0|MMIO_SPACE|  rw  |  —  |  — |

#### MMIO_SPACE field

<p>MMIO space</p>

## tpm register file

- Absolute Address: 0x18000
- Base Offset: 0x18000
- Size: 0x40

<p>Trusted Platform Module Space. 
TPM Spec: PC Client Work Group PC Client Specific TPM Interface Specification (TIS),
Version 1.21, Revision 1.00.: https://trustedcomputinggroup.org/wp-content/uploads/TCG_PCClientTPMSpecification_1-21_1-00_FINAL.pdf</p>

|Offset| Identifier |   Name  |
|------|------------|---------|
|  0x0 |TPM_SPACE[0]|TPM SPACE|

### TPM_SPACE register

- Absolute Address: 0x18000
- Base Offset: 0x0
- Size: 0x40
- Array Dimensions: [1]
- Array Stride: 0x40
- Total Size: 0x40

<p>TPM space.</p>

| Bits|Identifier|Access|Reset|Name|
|-----|----------|------|-----|----|
|511:0| TPM_SPACE|  rw  |  —  |  — |

#### TPM_SPACE field

<p>TPM space</p>

## post_code register file

- Absolute Address: 0x1C000
- Base Offset: 0x1C000
- Size: 0x2

<p>Post Code I/O Channel for system diagnostics and debugging.</p>

|Offset|    Identifier    |      Name     |
|------|------------------|---------------|
|  0x0 |POST_CODE_SPACE[0]|POST CODE SPACE|
|  0x1 |POST_CODE_SPACE[1]|POST CODE SPACE|

### POST_CODE_SPACE register

- Absolute Address: 0x1C000
- Base Offset: 0x0
- Size: 0x1
- Array Dimensions: [2]
- Array Stride: 0x1
- Total Size: 0x2

<p>Post Code space.</p>

|Bits|   Identifier  |Access|Reset|Name|
|----|---------------|------|-----|----|
| 7:0|POST_CODE_SPACE|  rw  |  —  |  — |

#### POST_CODE_SPACE field

<p>Post Code space</p>

### POST_CODE_SPACE register

- Absolute Address: 0x1C001
- Base Offset: 0x0
- Size: 0x1
- Array Dimensions: [2]
- Array Stride: 0x1
- Total Size: 0x2

<p>Post Code space.</p>

|Bits|   Identifier  |Access|Reset|Name|
|----|---------------|------|-----|----|
| 7:0|POST_CODE_SPACE|  rw  |  —  |  — |

#### POST_CODE_SPACE field

<p>Post Code space</p>
