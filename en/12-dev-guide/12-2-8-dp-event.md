# Event Scheduler
---

## Overview

In GreatSQL, the Event Scheduler is a mechanism that allows events to be defined and scheduled on the server side. These events can automatically execute predefined SQL statements at a specified interval or at a specific point in time.

The Event Scheduler can be used as a replacement for operating-system-level scheduled tasks (such as the `cron` jobs on Linux) to perform periodic maintenance tasks, generate reports, or carry out other automated operations.

## Enabling the Event Scheduler

Before using the Event Scheduler, make sure it is enabled on the GreatSQL server.

1. **Checking the Event Scheduler status**

```sql
SHOW VARIABLES LIKE 'event_scheduler';
```

2. **Enabling the Event Scheduler**

The Event Scheduler can be enabled in the following ways:

- Set it in the GreatSQL configuration file `my.cnf`

```ini
[mysqld]
# Enabled by default; set to OFF to disable it
event_scheduler=ON
```

- Enable it dynamically online

```sql
SET GLOBAL event_scheduler = ON;
```

- It can also be disabled dynamically online

```sql
SET GLOBAL event_scheduler = OFF;
```


## Creating an Event

The basic syntax for creating an event is as follows:

```sql
CREATE EVENT event_name
ON SCHEDULE schedule
DO
    event_body;
```

- `event_name`: the name of the event.
- `schedule`: the schedule of the event, which defines when the event runs.
- `event_body`: the SQL statements executed by the event.

## Examples

1. **Creating an event that executes once per minute**

```sql
CREATE EVENT my_1m_event
ON SCHEDULE EVERY 1 MINUTE
DO
    INSERT INTO log_table (aid, message, log_time) VALUES (0, 'Event triggered', NOW());
```

2. **Creating an event that executes only once at a specific point in time**

```sql
CREATE EVENT my_once_event
ON SCHEDULE AT '2024-05-23 12:00:00'
DO
    UPDATE my_table SET status = 1, update_time = NOW() WHERE aid = 1;
```

A one-time Event Scheduler event is dropped automatically after it has been executed, and the corresponding information is recorded in the error log:

```log
[Note] [MY-010044] [Server] Event Scheduler: Last execution of tpch.my_once_event. Dropping.
[Note] [MY-010450] [Server] Event Scheduler: Dropping greatsql.my_once_event
```

3. **Creating an event that executes once per day**

```sql
CREATE EVENT my_daily_event
ON SCHEDULE EVERY 1 DAY
STARTS '2024-05-23 00:00:00'
DO
    -- Delete historical data written more than 30 days ago every day
    DELETE FROM my_table WHERE created_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Modifying and Dropping Events

- **Modifying an event**

The `ALTER EVENT` statement can be used to modify an event:

```sql
-- Rename the event first, then modify its execution frequency
ALTER EVENT my_1m_event RENAME TO my_2m_event;

ALTER EVENT my_2m_event
ON SCHEDULE EVERY 2 MINUTE;
```

- **Dropping an event**

The `DROP EVENT` statement can be used to drop an event:

```sql
DROP EVENT IF EXISTS my_2m_event;
```

## Viewing Events

The events in a database can be viewed with the `SHOW EVENTS` statement:

```sql
SHOW EVENTS;
```

Or by querying the `EVENTS` table in the `information_schema` database:

```sql
-- Replace greatsql in the query condition with your own database name
SELECT * FROM information_schema.EVENTS WHERE EVENT_SCHEMA = 'greatsql';
```

When an error occurs during event execution (for example, because the SQL statement is written incorrectly), it is recorded in the error log, similar to the following:

```log
[ERROR] [MY-010045] [Server] Event Scheduler: [root@localhost][greatsql.my_once_event] Unknown column 'aid' in 'where clause'
```

## Usage Precautions

1. **Status of the Event Scheduler**

- Make sure the Event Scheduler is enabled (`event_scheduler = ON`); otherwise events will not execute.

2. **EVENT privilege**

- A user needs the `EVENT` privilege to create, modify, or drop events.

3. **Time and time zone**

- The scheduling time of an event is based on the server time zone. Make sure the server time zone is set correctly to avoid scheduling confusion.

4. **Resource consumption**

- Frequently executed events may increase the server load, especially in large-scale systems. Design the execution frequency and complexity of events reasonably to avoid performance problems.

5. **Event error handling**

- If an error occurs during event execution, the event may stop running. It is recommended to include the necessary error handling mechanisms in the event, or to check the event status periodically.

6. **Persistence**

- When an event is created, it is stored persistently in the database, and it is retained even if the database is restarted.

7. **Logging**

- It is recommended to log important event operations for reference during debugging or auditing.

8. **Impact on source-replica replication and MGR**

- In a source-replica replication or MGR architecture, all modifications made to the database after the Event Scheduler is created on the primary node are replicated to the replica nodes normally, so there is no need to create the same Event Scheduler on the replica nodes. Note that the binary log must not be temporarily disabled (by setting `sql_log_bin = 0`) while the Event Scheduler is executing, otherwise the data on the source and replica nodes may become inconsistent.


## Summary

The GreatSQL Event Scheduler provides powerful automation capabilities for database management and maintenance.

With reasonable configuration and use of the Event Scheduler, periodic tasks can be executed automatically, the burden of manual operations is reduced, and the efficiency and reliability of database management are improved.

During use, pay attention to the event scheduling frequency, system resource consumption, and error handling to ensure efficient and stable event scheduling.



**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
