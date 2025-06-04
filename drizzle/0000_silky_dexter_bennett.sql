CREATE TABLE `is_email_valid_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(8) NOT NULL,
	`expires_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 DAY),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `is_email_valid_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forgot_password_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`hash_token` text NOT NULL,
	`expires_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 DAY),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forgot_password_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liveclass_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slogan` varchar(255) NOT NULL,
	`instructor` varchar(255) NOT NULL,
	`plan` varchar(50) NOT NULL,
	`program_time` varchar(20) NOT NULL,
	`link` varchar(255) NOT NULL,
	`status` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `liveclass_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `payment_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`plan` varchar(15) NOT NULL,
	`package` varchar(10) NOT NULL,
	`amount` float NOT NULL,
	`transId` varchar(255) NOT NULL,
	`status` varchar(10) NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_table_transId_unique` UNIQUE(`transId`)
);
--> statement-breakpoint
CREATE TABLE `plan_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slogan` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`plan` varchar(50) NOT NULL,
	`link` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plan_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`valid` boolean NOT NULL DEFAULT true,
	`user_agent` text,
	`ip` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`pass` varchar(255),
	`is_email_valid` boolean NOT NULL DEFAULT false,
	`role` varchar(8) NOT NULL DEFAULT 'User',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_table_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `is_email_valid_table` ADD CONSTRAINT `is_email_valid_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forgot_password_table` ADD CONSTRAINT `forgot_password_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_table` ADD CONSTRAINT `oauth_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_table` ADD CONSTRAINT `payment_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_table` ADD CONSTRAINT `session_table_user_id_users_table_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`) ON DELETE no action ON UPDATE no action;