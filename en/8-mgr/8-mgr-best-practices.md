# MGR Best Practices

---

This article introduces the MGR best practice references and the constraints and limitations of using MGR.

## Parameter Option Settings
Below are some suggestions for setting MGR-related parameter options:
```ini
#It is recommended to use only single-primary mode
loose-group_replication_single_primary_mode=ON

#Do not enable bootstrap mode
loose-group_replication_bootstrap_group=OFF 

#The default value is 150 MB, but it is recommended to lower it to within 20 MB; do not use large transactions
loose-group_replication_transaction_size_limit = 20M

#Large messages are processed in fragments, 10 M per fragment, to avoid excessive network latency
loose-group_replication_communication_max_message_size = 10M

#The default behavior after a node exits is to set this node to RO mode
loose-group_replication_exit_state_action = READ_ONLY

#If no broadcast message is received for longer than this period, the node is deemed suspicious; if the network environment is poor, it can be increased appropriately
loose-group_replication_member_expel_timeout = 5

#It is recommended to disable the native flow control mechanism
loose-group_replication_flow_control_mode = "DISABLED"

#In AFTER mode, only a majority agreement is required, not all nodes
loose-group_replication_majority_after_mode = ON

#Whether to set it as an arbitrator node
loose-group_replication_arbitrator = 0

#Enable the fast single-primary mode
loose-group_replication_single_primary_fast_mode = 1

#Record a log when the MGR layer takes more than 100 ms, to confirm whether it is an MGR-layer performance bottleneck
loose-group_replication_request_time_threshold = 100

#Record more log information for easier problem tracking
log_error_verbosity=3
```

## MGR-Related Constraints
The following are some limitations on the use of MGR:
- All tables must use the InnoDB engine. Non-InnoDB tables can be created, but data cannot be written, and errors will also be reported when building new nodes with Clone (in GreatSQL, you can set the option `enforce_storage_engine = InnoDB` to allow only the InnoDB engine and disable other engines).
- All tables must have a primary key. Similarly, tables without a primary key can be created, but data cannot be written, and errors will also be reported when building new nodes with Clone.
- Try to avoid large transactions. By default, transactions over 150MB will report an error, and the maximum supported transaction is 2GB (in future versions of GreatSQL, support for large transactions will be added to raise the large transaction limit, but running large transactions is still not recommended).
- When upgrading from an old version, the MINIMAL mode cannot be selected; it is recommended to use the AUTO mode, i.e. `upgrade=AUTO`.
- Since MGR's transaction certification thread does not support gap locks, it is recommended to change the transaction isolation level of all nodes to `READ COMMITTED`. For the same reason, `table lock` and `name lock` (i.e. the `GET_LOCK()` function) should not be used in an MGR cluster.
- The `SERIALIZABLE` isolation level is not supported in multi-primary mode.
- Executing DML and DDL on the same table on different MGR nodes is not supported, as it may cause data loss or node errors and exits.
- Multi-level cascading foreign key tables are not supported in multi-primary mode. In addition, to avoid MGR errors caused by foreign keys, it is recommended to set `group_replication_enforce_update_everywhere_checks=ON`.
- In multi-primary mode, if multiple nodes execute `SELECT ... FOR UPDATE` and then commit transactions, deadlocks will occur.
- Replication Filters are not supported.

It looks like there are quite a few limitations, but most of the time they do not affect normal business use.

In addition, there are several requirements for enabling MGR:
- binlog must be enabled on each node.
- Each node must also log binlog updates from replicas, i.e. set `log_replica_updates=1`.
- The binlog format must be row mode, i.e. `binlog_format=ROW`.
- The `server_id` and `server_uuid` of each node must not be the same.
- Before 8.0.20, `binlog_checksum=NONE` was required, but from 8.0.20 onwards, `binlog_checksum=CRC32` can be set.
- GTID must be enabled, i.e. set `gtid_mode=ON` and `enforce_gtid_consistency = ON`.
- `master_info_repository=TABLE` and `relay_log_info_repository=TABLE` are required. However, since MySQL 8.0.23, these two options are set to TABLE by default, so there is no need to set them separately.
- The setting of the table name case parameter `lower_case_table_names` on all nodes must be consistent.
- It is best to deploy MGR on a LAN rather than across the public network. If the network latency is too high, MGR performance will be very poor or errors will easily occur.
- It is recommended to enable the writeset mode, i.e. set the following parameters:
    - `replica_parallel_type = LOGICAL_CLOCK`
    - `replica_parallel_workers = N`, N>0, which can be set to 2 times the number of logical CPUs
    - `binlog_transaction_dependency_tracking = WRITESET`
    - `replica_preserve_commit_order = 1`
    - `replica_checkpoint_period = 2`


## MGR Usage Suggestions
When using MGR, there are the following suggestions:
- Do not mix different versions, especially different major versions; complete the upgrade as soon as possible.
- Execute DDL and DML on the same table only on the same node; otherwise, the node may unexpectedly exit MGR.
- Do not run large transactions; try to keep each transaction within 10MB.


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
