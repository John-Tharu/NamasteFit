CREATE TABLE `oauth_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` enum('google','github') NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_table_provider_account_id_unique` UNIQUE(`provider_account_id`)
);
--> statement-breakpoint
ALTER TABLE `oauth_table` ADD CONSTRAINT `oauth_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;