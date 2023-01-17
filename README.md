# DateX

A simple CLI date calculator 

### Installation

```bash
npm install -g datex-cli
```

### Usage

```bash
datex <value1> <operator> <value2> <operator> <value3>.... to <output format>
```

> **Note**: every operation is applied to the result of the previous one

Example 1: 

```bash
datex now - 400hours to YYYY-MM-DD
```

> calculates the datetime of 400 hours before current time and parses it to the given format

Example 2: 

```bash
datex now - 400hours diff 2012-07-08 to h
```

> calculates the datetime of 400 hours before current time and then calculates the difference between the result and2012-07-08 converting it to hours

### Operations

- **Add/Subtract**: "+", "-"
- **Comparison**: "eq", "aft", "bef", "afteq", "befeq"
- **Diff**: "diff"

### Date Aliases

- **Today at 00:00:00**: "today", "td"
- **Current time**: "now"

### Date Formats

- *YYYY-MM-DDThh:mm:ss*
- *DD/MM/YYYY hh:mm:ss>*
- ...anything generally accepted will fit

### Absolute values format:

```bash
<value><unit>
# e.g.: 500d
```

### Time Units Aliases

- **Years**:        "year", "years", "y"
- **Months**:       "month", "months", "M"
- **Weeks**:        "week", "weeks", "W", "w"
- **Days**:         "day", "days", "D", "d"
- **Hours**:        "hour", "hours", "h", "H"
- **Minutes**:      "minute", "minutes", "m", "min"
- **Seconds**:      "second", "seconds", "s", "S", "sec"
- **Milliseconds**: "millisecond", "milliseconds", "ms", "MS", "milli", "millis"


        