# DateX

A simple CLI date calculator 

### Usage

```bash
datex <value1> <operator> <value2> <operator> <value3>....
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

        