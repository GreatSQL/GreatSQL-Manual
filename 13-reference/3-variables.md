# 系统变量参数、状态变量
---

本节列出 GreatSQL 相对 MySQL 新增的系统变量参数，以及新增的状态变量。

## 新增系统变量参数

|**Name**                                                     |**Cmd-Line** |**Option File** |**Var Scope** |**Dynamic**|
| ---                                                         | ---    | ---    | ---       | ---   |
|audit_log_enabled                                            | Yes    | Yes    | Global    | No    |
|audit_log_to_table                                           | Yes    | Yes    | Global    | No    |
|clone_encrypt_key_path                                       | Yes    | Yes    | Global    | Yes   |
|clone_file_compress                                          | Yes    | Yes    | Global    | Yes   |
|clone_file_compress_chunk_size                               | Yes    | Yes    | Global    | Yes   |
|clone_file_compress_threads                                  | Yes    | Yes    | Global    | Yes   |
|clone_file_compress_zstd_level                               | Yes    | Yes    | Global    | Yes   |
|enable_data_masking                                          | Yes    | Yes    | Global    | Yes   |
|gdb_parallel_load_chunk_size                                 | No     | No     | Session   | Yes   |
|gdb_parallel_load_workers                                    | No     | No     | Session   | Yes   |
|group_replication_arbitrator                                 | Yes    | Yes    | Global    | No    |
|group_replication_broadcast_gtid_executed_period             | Yes    | Yes    | Global    | Yes   |
|group_replication_communication_flp_timeout                  | Yes    | Yes    | Global    | Yes   |
|group_replication_donor_threshold                            | Yes    | Yes    | Global    | Yes   |
|group_replication_flow_control_max_wait_time                 | Yes    | Yes    | Global    | Yes   |
|group_replication_flow_control_replay_lag_behind             | Yes    | Yes    | Global    | Yes   |
|group_replication_majority_after_mode                        | Yes    | Yes    | Global    | No    |
|group_replication_primary_election_mode                      | Yes    | Yes    | Global    | No    |
|group_replication_request_time_threshold                     | Yes    | Yes    | Global    | Yes   |
|group_replication_single_primary_fast_mode                   | Yes    | Yes    | Global    | No    |
|group_replication_xcom_cache_mode                            | Yes    | Yes    | Global    | No    |
|group_replication_zone_id                                    | Yes    | Yes    | Global    | Yes   |
|group_replication_zone_id_sync_mode                          | Yes    | Yes    | Global    | Yes   |
|innodb_data_file_async_purge                                 | Yes    | Yes    | Both      | Yes   |
|innodb_data_file_async_purge_all_at_shutdown                 | Yes    | Yes    | Global    | Yes   |
|innodb_data_file_async_purge_error_retry_count               | Yes    | Yes    | Global    | Yes   |
|innodb_data_file_async_purge_interval                        | Yes    | Yes    | Global    | Yes   |
|innodb_data_file_async_purge_max_size                        | Yes    | Yes    | Global    | Yes   |
|innodb_data_force_async_purge_file_size                      | Yes    | Yes    | Global    | Yes   |
|innodb_optimize_no_pk_parallel_load                          | Yes    | Yes    | Global    | Yes   |
|lock_ddl_polling_mode                                        | No     | No     | Session   | Yes   |
|lock_ddl_polling_runtime                                     | No     | No     | Session   | Yes   |
|rapid_checkpoint_threshold                                   | Yes    | Yes    | Global    | Yes   |
|rapid_hash_table_memory_limit                                | Yes    | Yes    | Global    | Yes   |
|rapid_memory_limit                                           | Yes    | Yes    | Global    | Yes   |
|rapid_temp_directory                                         | Yes    | Yes    | Global    | No    |
|rapid_worker_threads                                         | Yes    | Yes    | Global    | Yes   |
|replicate_server_mode                                        | Yes    | Yes    | Global    | No    |
|rpl_read_binlog_speed_limit                                  | Yes    | Yes    | Global    | Yes   |
|sched_affinity_foreground_thread                             | Yes    | Yes    | Global    | Yes   |
|sched_affinity_log_checkpointer                              | Yes    | Yes    | Global    | Yes   |
|sched_affinity_log_flush_notifier                            | Yes    | Yes    | Global    | Yes   |
|sched_affinity_log_flusher                                   | Yes    | Yes    | Global    | Yes   |
|sched_affinity_log_write_notifier                            | Yes    | Yes    | Global    | Yes   |
|sched_affinity_log_writer                                    | Yes    | Yes    | Global    | Yes   |
|sched_affinity_numa_aware                                    | Yes    | Yes    | Global    | Yes   |
|sched_affinity_purge_coordinator                             | Yes    | Yes    | Global    | Yes   |
|secondary_engine_parallel_load_workers                       | Yes    | Yes    | Session   | Yes   |
|secondary_engine_read_delay_gtid_threshold                   | Yes    | Yes    | Both      | Yes   |
|secondary_engine_read_delay_level                            | Yes    | Yes    | Both      | Yes   |
|secondary_engine_read_delay_time_threshold                   | Yes    | Yes    | Both      | Yes   |
|secondary_engine_read_delay_wait_mode                        | Yes    | Yes    | Both      | Yes   |
|secondary_engine_read_delay_wait_timeout                     | Yes    | Yes    | Both      | Yes   |
|select_bulk_into_batch                                       | Yes    | Yes    | Global    | Yes   |
|shrink_sql_mode                                              | Yes    | Yes    | Both      | Yes   |
|tf_udt_table_max_rows                                        | Yes    | Yes    | Both      | Yes   |
|use_secondary_engine                                         | Yes    | Yes    | Session   | Yes   |

除了上面列出的在 GreatSQL 中新增的系统变量参数外，其余基于 Percona 相对于 MySQL 新增的变量参数列表参考：[List of variables introduced in Percona Server for MySQL 8.0](https://docs.percona.com/percona-server/8.0/ps-variables.html)。

## 新增状态变量

|**Name**                                      |**Var Type** |**Var Scope** |
| ---                                          | ---        | ---       |
|Com_alter_trigger                             | Numeric    | Both      |
|Com_create_package                            | Numeric    | Both      |
|Com_create_package_body                       | Numeric    | Both      |
|Com_create_type                               | Numeric    | Both      |
|Com_drop_package                              | Numeric    | Both      |
|Com_drop_package_body                         | Numeric    | Both      |
|Com_drop_type                                 | Numeric    | Both      |
|Com_execute_immediate                         | Numeric    | Both      |
|Com_compound_sql                              | Numeric    | Both      |
|Com_insert_all_select                         | Numeric    | Both      |
|Com_show_create_package                       | Numeric    | Both      |
|Com_show_create_package_body                  | Numeric    | Both      |
|Com_show_create_type                          | Numeric    | Both      |
|Com_show_package_status                       | Numeric    | Both      |
|Com_show_type_status                          | Numeric    | Both      |
|Com_show_package_body_code                    | Numeric    | Both      |
|Com_show_package_body_status                  | Numeric    | Both      |
|Com_show_sequences                            | Numeric    | Both      |
|Com_create_sequence                           | Numeric    | Both      |
|Com_drop_sequence                             | Numeric    | Both      |
|Com_alter_sequence                            | Numeric    | Both      |
|Sched_affinity_group_capacity                 | Numeric    | Global    |
|Sched_affinity_group_number                   | Numeric    | Global    |
|Sched_affinity_status                         | String     | Global    |
|group_replication_apply_queue_size            | Numeric    | Global    |
|group_replication_applied_messages            | Numeric    | Global    |
|group_replication_applied_data_messages       | Numeric    | Global    |
|group_replication_applied_events              | Numeric    | Global    |
|group_replication_io_buffered_events          | Numeric    | Global    |
|group_replication_flow_control_count          | Numeric    | Global    |
|group_replication_flow_control_time           | Numeric    | Global    |
|group_replication_before_commit_request_time  | Numeric    | Global    |

除了上面列出的在 GreatSQL 中新增的状态变量外，其余基于 Percona 相对于 MySQL 新增的变量参数列表参考：[List of variables introduced in Percona Server for MySQL 8.0](https://docs.percona.com/percona-server/8.0/ps-variables.html)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
