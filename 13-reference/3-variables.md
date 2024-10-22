# 系统变量/参数选项

## System variables

|**Name**                                     |**Cmd-Line** |**Option File** |**Var Scope** |**Dynamic**|
| ---                                         | ---    | ---    | ---       | ---   |
|audit_log_buffer_size                        | Yes    | Yes    | Global    | No    |
|audit_log_enabled                            | Yes    | Yes    | Global    | No    |
|audit_log_exclude_accounts                   | Yes    | Yes    | Global    | No    |
|audit_log_exclude_commands                   | Yes    | Yes    | Global    | No    |
|audit_log_exclude_databases                  | Yes    | Yes    | Global    | No    |
|audit_log_file                               | Yes    | Yes    | Global    | No    |
|audit_log_flush                              | Yes    | Yes    | Global    | Yes   |
|audit_log_format                             | Yes    | Yes    | Global    | No    |
|audit_log_handler                            | Yes    | Yes    | Global    | No    |
|audit_log_include_accounts                   | Yes    | Yes    | Global    | No    |
|audit_log_include_commands                   | Yes    | Yes    | Global    | No    |
|audit_log_include_databases                  | Yes    | Yes    | Global    | No    |
|audit_log_policy                             | Yes    | Yes    | Global    | Yes   |
|audit_log_rotate_on_size                     | Yes    | Yes    | Global    | No    |
|audit_log_rotations                          | Yes    | Yes    | Global    | No    |
|audit_log_strategy                           | Yes    | Yes    | Global    | No    |
|audit_log_syslog_facility                    | Yes    | Yes    | Global    | No    |
|audit_log_syslog_ident                       | Yes    | Yes    | Global    | No    |
|audit_log_syslog_priority                    | Yes    | Yes    | Global    | No    |
|audit_log_to_table                           | Yes    | Yes    | Global    | No    |
|binlog_ddl_skip_rewrite                      | Yes    | Yes    | Global    | No    |
|binlog_skip_flush_commands                   | Yes    | Yes    | Global    | No    |
|binlog_space_limit                           | Yes    | Yes    | Global    | No    |
|buffered_error_log_filename                  | Yes    | Yes    | Global    | No    |
|buffered_error_log_size                      | Yes    | Yes    | Global    | No    |
|clone_encrypt_key_path                       | Yes    | Yes    | Global    | No    |
|clone_file_compress                          | Yes    | Yes    | Global    | No    |
|clone_file_compress_chunk_size               | Yes    | Yes    | Global    | No    |
|clone_file_compress_threads                  | Yes    | Yes    | Global    | No    |
|clone_file_compress_zstd_level               | Yes    | Yes    | Global    | No    |
|dblink_maxreturn_rows                        | Yes    | Yes    | Global    | No    |
|dbms_profiler_max_data_size                  | Yes    | Yes    | Global    | No    |
|dbms_profiler_max_units_size                 | Yes    | Yes    | Global    | No    |
|enable_data_masking                          | Yes    | Yes    | Global    | No    |
|encrypt_tmp_files                            | Yes    | Yes    | Global    | No    |
|enforce_storage_engine                       | Yes    | Yes    | Global    | No    |
|errorlog_messages_language                   | Yes    | Yes    | Global    | No    |
|expand_fast_index_creation                   | Yes    | Yes    | Both      | Yes   |
|force_parallel_execute                       | Yes    | Yes    | Global    | No    |
|ft_query_extra_word_chars                    | Yes    | Yes    | Global    | No    |
|gdb_parallel_load_chunk_size                 | Yes    | Yes    | Global    | No    |
|gdb_parallel_load_workers                    | Yes    | Yes    | Global    | No    |
|gdb_sqld_version                             | Yes    | Yes    | Global    | No    |
|group_replication_applier_batch_size_threshold | Yes    | Yes    | Global    | No    |
|group_replication_arbitrator                 | Yes    | Yes    | Global    | No    |
|group_replication_async_auto_failover_channel_read_only_mode | Yes    | Yes    | Global    | No    |
|group_replication_auto_evict_timeout         | Yes    | Yes    | Global    | No    |
|group_replication_broadcast_gtid_executed_period | Yes    | Yes    | Global    | No    |
|group_replication_communication_flp_timeout  | Yes    | Yes    | Global    | No    |
|group_replication_donor_threshold            | Yes    | Yes    | Global    | No    |
|group_replication_flow_control_max_wait_time | Yes    | Yes    | Global    | No    |
|group_replication_flow_control_replay_lag_behind | Yes    | Yes    | Global    | No    |
|group_replication_majority_after_mode        | Yes    | Yes    | Global    | No    |
|group_replication_primary_election_mode      | Yes    | Yes    | Global    | No    |
|group_replication_request_time_threshold     | Yes    | Yes    | Global    | No    |
|group_replication_single_primary_fast_mode   | Yes    | Yes    | Global    | No    |
|group_replication_xcom_cache_mode            | Yes    | Yes    | Global    | No    |
|group_replication_zone_id                    | Yes    | Yes    | Global    | No    |
|group_replication_zone_id_sync_mode          | Yes    | Yes    | Global    | No    |
|have_backup_locks                            | Yes    | Yes    | Global    | No    |
|have_backup_safe_binlog_info                 | Yes    | Yes    | Global    | No    |
|have_snapshot_cloning                        | Yes    | Yes    | Global    | No    |
|innodb_cleaner_lsn_age_factor                | Yes    | Yes    | Global    | Yes   |
|innodb_compressed_columns_threshold          | Yes    | Yes    | Global    | No    |
|innodb_compressed_columns_zip_level          | Yes    | Yes    | Global    | No    |
|innodb_corrupt_table_action                  | Yes    | Yes    | Global    | Yes   |
|innodb_data_file_async_purge                 | Yes    | Yes    | Global    | No    |
|innodb_data_file_async_purge_all_at_shutdown | Yes    | Yes    | Global    | No    |
|innodb_data_file_async_purge_error_retry_count | Yes    | Yes    | Global    | No    |
|innodb_data_file_async_purge_interval        | Yes    | Yes    | Global    | No    |
|innodb_data_file_async_purge_max_size        | Yes    | Yes    | Global    | No    |
|innodb_data_force_async_purge_file_size      | Yes    | Yes    | Global    | No    |
|innodb_empty_free_list_algorithm             | Yes    | Yes    | Global    | Yes   |
|innodb_encrypt_online_alter_logs             | Yes    | Yes    | Global    | Yes   |
|innodb_force_index_records_in_range          | Yes    | Yes    | Global    | No    |
|innodb_ft_ignore_stopwords                   | Yes    | Yes    | Global    | No    |
|innodb_optimize_no_pk_parallel_load          | Yes    | Yes    | Global    | No    |
|innodb_parallel_dblwr_encrypt                | Yes    | Yes    | Global    | No    |
|innodb_parallel_doublewrite_path             | Yes    | Yes    | Global    | No    |
|innodb_print_lock_wait_timeout_info          | Yes    | Yes    | Global    | Yes   |
|innodb_records_in_range                      | Yes    | Yes    | Global    | No    |
|innodb_sched_priority_lru_flush              | Yes    | Yes    | Global    | No    |
|innodb_sched_priority_pc                     | Yes    | Yes    | Global    | No    |
|innodb_show_locks_held                       | Yes    | Yes    | Global    | Yes   |
|innodb_sys_tablespace_encrypt                | Yes    | Yes    | Global    | No    |
|innodb_temp_tablespace_encrypt               | Yes    | Yes    | Global    | Yes   |
|jemalloc_detected                            | Yes    | Yes    | Global    | No    |
|jemalloc_profiling                           | Yes    | Yes    | Global    | No    |
|kill_idle_transaction                        | Yes    | Yes    | Global    | Yes   |
|lock_ddl_polling_mode                        | Yes    | Yes    | Global    | No    |
|lock_ddl_polling_runtime                     | Yes    | Yes    | Global    | No    |
|log_query_errors                             | Yes    | Yes    | Global    | No    |
|log_slow_filter                              | Yes    | Yes    | Both      | Yes   |
|log_slow_rate_limit                          | Yes    | Yes    | Both      | Yes   |
|log_slow_rate_type                           | Yes    | Yes    | Global    | Yes   |
|log_slow_sp_statements                       | Yes    | Yes    | Global    | Yes   |
|log_slow_verbosity                           | Yes    | Yes    | Both      | Yes   |
|max_dbmsotpt_count                           | Yes    | Yes    | Global    | No    |
|max_slowlog_files                            | Yes    | Yes    | Global    | No    |
|max_slowlog_size                             | Yes    | Yes    | Global    | No    |
|net_buffer_shrink_interval                   | Yes    | Yes    | Global    | No    |
|parallel_cost_threshold                      | Yes    | Yes    | Global    | No    |
|parallel_default_dop                         | Yes    | Yes    | Global    | No    |
|parallel_max_threads                         | Yes    | Yes    | Global    | No    |
|parallel_memory_limit                        | Yes    | Yes    | Global    | No    |
|parallel_queue_timeout                       | Yes    | Yes    | Global    | No    |
|private_temp_table_prefix                    | Yes    | Yes    | Global    | No    |
|proxy_protocol_networks                      | Yes    | Yes    | Global    | No    |
|query_prealloc_reuse_size                    | Yes    | Yes    | Global    | No    |
|rapid_checkpoint_threshold                   | Yes    | Yes    | Global    | No    |
|rapid_hash_table_memory_limit                | Yes    | Yes    | Global    | No    |
|rapid_memory_limit                           | Yes    | Yes    | Global    | No    |
|rapid_temp_directory                         | Yes    | Yes    | Global    | No    |
|rapid_worker_threads                         | Yes    | Yes    | Global    | No    |
|replica_enable_event                         | Yes    | Yes    | Global    | No    |
|replicate_server_mode                        | Yes    | Yes    | Global    | No    |
|rpl_read_binlog_speed_limit                  | Yes    | Yes    | Global    | No    |
|sched_affinity_foreground_thread             | Yes    | Yes    | Global    | No    |
|sched_affinity_log_checkpointer              | Yes    | Yes    | Global    | No    |
|sched_affinity_log_flush_notifier            | Yes    | Yes    | Global    | No    |
|sched_affinity_log_flusher                   | Yes    | Yes    | Global    | No    |
|sched_affinity_log_write_notifier            | Yes    | Yes    | Global    | No    |
|sched_affinity_log_writer                    | Yes    | Yes    | Global    | No    |
|sched_affinity_numa_aware                    | Yes    | Yes    | Global    | No    |
|sched_affinity_purge_coordinator             | Yes    | Yes    | Global    | No    |
|secondary_engine_parallel_load_workers       | Yes    | Yes    | Global    | No    |
|secondary_engine_read_delay_gtid_threshold   | Yes    | Yes    | Global    | No    |
|secondary_engine_read_delay_level            | Yes    | Yes    | Global    | No    |
|secondary_engine_read_delay_time_threshold   | Yes    | Yes    | Global    | No    |
|secondary_engine_read_delay_wait_mode        | Yes    | Yes    | Global    | No    |
|secondary_engine_read_delay_wait_timeout     | Yes    | Yes    | Global    | No    |
|secure_log_path                              | Yes    | Yes    | Global    | No    |
|select_bulk_into_batch                       | Yes    | Yes    | Global    | No    |
|serveroutput                                 | Yes    | Yes    | Global    | No    |
|shrink_sql_mode                              | Yes    | Yes    | Global    | No    |
|slow_query_log_always_write_time             | Yes    | Yes    | Global    | Yes   |
|slow_query_log_use_global_control            | Yes    | Yes    | Global    | Yes   |
|table_open_cache_triggers                    | Yes    | Yes    | Global    | No    |
|tf_sequence_table_max_upper_bound            | Yes    | Yes    | Global    | No    |
|tf_udt_table_max_rows                        | Yes    | Yes    | Global    | No    |
|thread_pool_high_prio_mode                   | Yes    | Yes    | Both      | Yes   |
|thread_pool_high_prio_tickets                | Yes    | Yes    | Both      | Yes   |
|thread_pool_idle_timeout                     | Yes    | Yes    | Global    | Yes   |
|thread_pool_max_threads                      | Yes    | Yes    | Global    | Yes   |
|thread_pool_oversubscribe                    | Yes    | Yes    | Global    | Yes   |
|thread_pool_size                             | Yes    | Yes    | Global    | Yes   |
|thread_pool_stall_limit                      | Yes    | Yes    | Global    | No    |
|thread_statistics                            | Yes    | Yes    | Global    | Yes   |
|userstat                                     | Yes    | Yes    | Global    | Yes   |
|version_suffix                               | Yes    | Yes    | Global    | Yes   |

## Status variables

|**Name**                                     |**Var Type** |**Var Scope** |
| ---                                         | ---        | ---       |
|Audit_log_buffer_size_overflow               | Numeric    | Global    |
|Binlog_snapshot_file                         | Numeric    | Global    |
|Binlog_snapshot_position                     | Numeric    | Global    |
|Binlog_snapshot_gtid_executed                | Numeric    | Global    |
|Com_alter_trigger                            | Numeric    | Global    |
|Com_create_compression_dictionary            | Numeric    | Global    |
|Com_create_package                           | Numeric    | Global    |
|Com_create_package_body                      | Numeric    | Global    |
|Com_create_type                              | Numeric    | Global    |
|Com_drop_compression_dictionary              | Numeric    | Global    |
|Com_drop_package                             | Numeric    | Global    |
|Com_drop_package_body                        | Numeric    | Global    |
|Com_drop_type                                | Numeric    | Global    |
|Com_execute_immediate                        | Numeric    | Global    |
|Com_compound_sql                             | Numeric    | Global    |
|Com_insert_all_select                        | Numeric    | Global    |
|Com_lock_tables_for_backup                   | Numeric    | Global    |
|Com_show_client_statistics                   | Numeric    | Global    |
|Com_show_create_package                      | Numeric    | Global    |
|Com_show_create_package_body                 | Numeric    | Global    |
|Com_show_create_type                         | Numeric    | Global    |
|Com_show_index_statistics                    | Numeric    | Global    |
|Com_show_package_status                      | Numeric    | Global    |
|Com_show_type_status                         | Numeric    | Global    |
|Com_show_package_body_code                   | Numeric    | Global    |
|Com_show_package_body_status                 | Numeric    | Global    |
|Com_show_table_statistics                    | Numeric    | Global    |
|Com_show_sequences                           | Numeric    | Global    |
|Com_show_thread_statistics                   | Numeric    | Global    |
|Com_show_user_statistics                     | Numeric    | Global    |
|Com_create_sequence                          | Numeric    | Global    |
|Com_drop_sequence                            | Numeric    | Global    |
|Com_alter_sequence                           | Numeric    | Global    |
|Innodb_background_log_sync                   | Numeric    | Global    |
|Innodb_buffer_pool_pages_LRU_flushed         | Numeric    | Global    |
|Innodb_buffer_pool_pages_made_not_young      | Numeric    | Global    |
|Innodb_buffer_pool_pages_made_young          | Numeric    | Global    |
|Innodb_buffer_pool_pages_old                 | Numeric    | Global    |
|Innodb_checkpoint_age                        | Numeric    | Global    |
|Innodb_checkpoint_max_age                    | Numeric    | Global    |
|Innodb_ibuf_free_list                        | Numeric    | Global    |
|Innodb_ibuf_segment_size                     | Numeric    | Global    |
|Innodb_lsn_current                           | Numeric    | Global    |
|Innodb_lsn_flushed                           | Numeric    | Global    |
|Innodb_lsn_last_checkpoint                   | Numeric    | Global    |
|Innodb_master_thread_active_loops            | Numeric    | Global    |
|Innodb_master_thread_idle_loops              | Numeric    | Global    |
|Innodb_max_trx_id                            | Numeric    | Global    |
|Innodb_oldest_view_low_limit_trx_id          | Numeric    | Global    |
|Innodb_pages0_read                           | Numeric    | Global    |
|Innodb_purge_trx_id                          | Numeric    | Global    |
|Innodb_purge_undo_no                         | Numeric    | Global    |
|Innodb_secondary_index_triggered_cluster_reads | Numeric    | Global    |
|Innodb_secondary_index_triggered_cluster_reads_avoided | Numeric    | Global    |
|Innodb_buffered_aio_submitted                | Numeric    | Global    |
|Innodb_scan_pages_contiguous                 | Numeric    | Global    |
|Innodb_scan_pages_disjointed                 | Numeric    | Global    |
|Innodb_scan_pages_total_seek_distance        | Numeric    | Global    |
|Innodb_scan_data_size                        | Numeric    | Global    |
|Innodb_scan_deleted_recs_size                | Numeric    | Global    |
|Innodb_encryption_n_merge_blocks_encrypted   | Numeric    | Global    |
|Innodb_encryption_n_merge_blocks_decrypted   | Numeric    | Global    |
|Innodb_encryption_n_rowlog_blocks_encrypted  | Numeric    | Global    |
|Innodb_encryption_n_rowlog_blocks_decrypted  | Numeric    | Global    |
|Net_buffer_length                            | Numeric    | Global    |
|PQ_memory_refused                            | Numeric    | Global    |
|PQ_memory_used                               | Numeric    | Global    |
|PQ_threads_refused                           | Numeric    | Global    |
|PQ_threads_running                           | Numeric    | Global    |
|Sched_affinity_group_capacity                | Numeric    | Global    |
|Sched_affinity_group_number                  | Numeric    | Global    |
|Sched_affinity_status                        | Numeric    | Global    |
|Table_open_cache_triggers_hits               | Numeric    | Global    |
|Table_open_cache_triggers_misses             | Numeric    | Global    |
|Table_open_cache_triggers_overflows          | Numeric    | Global    |
|Threadpool_idle_threads                      | Numeric    | Global    |
|Threadpool_threads                           | Numeric    | Global    |
|group_replication_apply_queue_size           | Numeric    | Global    |
|group_replication_applied_messages           | Numeric    | Global    |
|group_replication_applied_data_messages      | Numeric    | Global    |
|group_replication_applied_events             | Numeric    | Global    |
|group_replication_io_buffered_events         | Numeric    | Global    |
|group_replication_flow_control_count         | Numeric    | Global    |
|group_replication_flow_control_time          | Numeric    | Global    |
|group_replication_before_commit_request_time | Numeric    | Global    |
|group_replication_flow_control_active        | Numeric    | Global    |
|group_replication_flow_control_threshold_nodes | Numeric    | Global    |
|group_replication_flow_control_throttle_quota | Numeric    | Global    |
